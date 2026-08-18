import { wrapScheduledLambda } from "../utils/wrap";
import adapter, { convertSwapToEvent, forEachSwapPage } from "../adapters/layerswap";
import { sql } from "../utils/db";
import { insertTransactionRows } from "../utils/wrappa/postgres/write";
import { insertConfigEntriesForAdapter } from "../utils/adapter";
import { formatError, NonRetryableError, throwIfAborted } from "../utils/errors";
import { EventData } from "../utils/types";
import dayjs from "dayjs";

// Event timestamps and close_date can differ slightly, so re-scan before the latest stored event.
const CHECKPOINT_OVERLAP_HOURS = 1;

// Newest recorded Layerswap event timestamp (ms); close-date paging applies overlap around it.
const getLatestCheckpointMs = async (): Promise<number | null> => {
  const rows = await sql<Array<{ checkpoint: string | null }>>`
    SELECT floor(extract(epoch from max(t.ts)) * 1000)::bigint::text AS checkpoint
    FROM bridges.transactions t
    JOIN bridges.config c ON c.id = t.bridge_id
    WHERE c.bridge_name = 'layerswap'
      AND t.is_usd_volume
      AND t.ts <= NOW()
  `;
  const checkpoint = Number(rows[0]?.checkpoint);
  return Number.isFinite(checkpoint) && checkpoint > 0 ? checkpoint : null;
};

const toRow = (bridgeId: string, chain: string, event: EventData) => ({
  bridge_id: bridgeId,
  chain,
  tx_hash: event.txHash,
  ts: event.timestamp!,
  tx_block: null,
  tx_from: event.from ?? "0x",
  tx_to: event.to ?? "0x",
  token: event.token,
  amount: event.amount?.toString?.() ?? "0",
  is_deposit: event.isDeposit,
  is_usd_volume: true,
  txs_counted_as: 1,
  origin_chain: null,
});

export const handler = async (signal?: AbortSignal) => {
  try {
    throwIfAborted(signal);
    await insertConfigEntriesForAdapter(adapter, "layerswap");

    const configRows = await sql<Array<{ chain: string; id: string }>>`
      SELECT chain, id::text AS id FROM bridges.config WHERE bridge_name = 'layerswap'
    `;
    const bridgeIds: Record<string, string | undefined> = Object.fromEntries(configRows.map((r) => [r.chain, r.id]));

    // No checkpoint means this is the cutover from the old hot-wallet adapter, which already covered
    // everything up to now on a different basis (raw token amounts, is_usd_volume = false). Starting
    // from now instead of backfilling avoids re-covering that period twice. Page granularity still
    // lets the first run write its newest page (~200 swaps) into the overlap; that is accepted.
    const checkpoint = await getLatestCheckpointMs();
    const sinceCloseTs = checkpoint ? checkpoint - CHECKPOINT_OVERLAP_HOURS * 60 * 60 * 1000 : dayjs().valueOf();
    console.log(
      `Running Layerswap completion feed since ${new Date(sinceCloseTs).toISOString()} ` +
        `(checkpoint=${checkpoint ? new Date(checkpoint).toISOString() : "none, starting from now"})`
    );
    let deposits = 0;
    let withdrawals = 0;
    const unmappedNetworks = new Set<string>();

    const pagination = await forEachSwapPage(
      sinceCloseTs,
      async (swaps) => {
        const rows: any[] = [];

        for (const item of swaps) {
          const swapId = item?.swap?.id ?? "unknown";
          let event;
          try {
            event = convertSwapToEvent(item);
          } catch (error) {
            throw new NonRetryableError(`[layerswap] failed to convert swap ${swapId}: ${formatError(error)}`);
          }

          // A chain we do not recognise is skipped and reported as degraded: Layerswap adds and
          // removes networks on a days-long cadence, and one unknown network must not stop the
          // other ~68. A chain we DO recognise with no bridges.config row is a real bug: fail.
          const collect = (
            leg: "deposit" | "withdraw",
            chain: string | undefined,
            networkName: string | undefined,
            legEvent: EventData | undefined
          ) => {
            if (!chain) {
              unmappedNetworks.add(networkName ?? "unknown");
              return;
            }
            const bridgeId = bridgeIds[chain];
            if (!bridgeId) {
              throw new NonRetryableError(
                `[layerswap] bridges.config is missing ${leg} chain ${chain} (swap ${swapId})`
              );
            }
            if (legEvent) rows.push(toRow(bridgeId, chain, legEvent));
          };

          collect("deposit", event.depositChain, item?.swap?.source_network?.name, event.deposit);
          collect("withdraw", event.withdrawChain, item?.swap?.destination_network?.name, event.withdraw);
        }

        if (rows.length) {
          throwIfAborted(signal);
          await sql.begin(async (sql) => {
            await insertTransactionRows(sql, true, rows, "upsert", true);
          });
          deposits += rows.filter((r) => r.is_deposit).length;
          withdrawals += rows.filter((r) => !r.is_deposit).length;
        }
      },
      signal
    );

    const summary =
      `Layerswap processing complete. ${pagination.pages} pages, ${pagination.swaps} swaps, ` +
      `${deposits} deposits, ${withdrawals} withdrawals, stop=${pagination.stopReason}.`;

    if (unmappedNetworks.size) {
      const error = `Unmapped Layerswap networks skipped: ${[...unmappedNetworks].sort().join(", ")}`;
      console.warn(`[WARN] ${summary} ${error}`);
      return { degraded: true, error };
    }

    console.log(summary);
  } catch (error) {
    console.error(`Fatal error in Layerswap handler: ${formatError(error)}`);
    throw error;
  }
};

// Wrapped in an arrow so the Lambda `event` argument can never land in the `signal` parameter.
export default wrapScheduledLambda(async () => {
  await handler();
});
