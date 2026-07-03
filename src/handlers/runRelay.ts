import { wrapScheduledLambda } from "../utils/wrap";
import adapter, { forEachRequestsByTimePage, convertRequestToEvent, chainIdToSlug } from "../adapters/relay";
import { sql } from "../utils/db";
import { insertTransactionRows } from "../utils/wrappa/postgres/write";
import { insertConfigEntriesForAdapter } from "../utils/adapter";
import dayjs from "dayjs";

const HOURS_CONCURRENCY = 4;
const CHECKPOINT_OVERLAP_SECONDS = 60 * 60;
const BOOTSTRAP_LOOKBACK_HOURS = 48;
const MAX_CATCHUP_HOURS = 4;

type RelayBridgeIds = Record<string, string | undefined>;

const mapLimit = async <T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let inFlight = 0;
  let i = 0;
  return await new Promise<R[]>((resolve, reject) => {
    const launchNext = () => {
      if (i >= items.length && inFlight === 0) return resolve(results);
      while (inFlight < limit && i < items.length) {
        const idx = i++;
        inFlight++;
        fn(items[idx], idx)
          .then((res) => {
            results[idx] = res;
          })
          .catch(reject)
          .finally(() => {
            inFlight--;
            launchNext();
          });
      }
    };
    launchNext();
  });
};

const splitHourWindows = (startTs: number, endTs: number): Array<[number, number]> => {
  const windows: Array<[number, number]> = [];
  const startHour = Math.floor(startTs / 3600) * 3600;
  for (let t = startHour; t < endTs; t += 3600) {
    windows.push([Math.max(t, startTs), Math.min(t + 3600, endTs)]);
  }
  return windows;
};

const loadRelayBridgeIds = async (): Promise<RelayBridgeIds> => {
  await insertConfigEntriesForAdapter(adapter, "relay");
  const rows = await sql<Array<{ chain: string; id: string }>>`
    SELECT LOWER(chain) AS chain, id::text AS id
    FROM bridges.config
    WHERE bridge_name = 'relay'
  `;
  return Object.fromEntries(rows.map((row) => [row.chain, row.id]));
};

const getLatestRelayCheckpoint = async (): Promise<number | null> => {
  const rows = await sql<Array<{ checkpoint: string | null }>>`
    SELECT floor(extract(epoch from max(t.ts)))::bigint::text AS checkpoint
    FROM bridges.transactions t
    JOIN bridges.config c ON c.id = t.bridge_id
    WHERE c.bridge_name = 'relay'
      AND t.is_usd_volume
      AND t.ts <= NOW()
  `;
  const checkpoint = Number(rows[0]?.checkpoint);
  return Number.isFinite(checkpoint) && checkpoint > 0 ? checkpoint : null;
};

const resolveWindow = async () => {
  const now = dayjs().unix();
  const checkpoint = await getLatestRelayCheckpoint();
  const safeCheckpoint = checkpoint ? Math.min(checkpoint, now) : null;
  const startTs = Math.max(
    0,
    safeCheckpoint ? safeCheckpoint - CHECKPOINT_OVERLAP_SECONDS : now - BOOTSTRAP_LOOKBACK_HOURS * 60 * 60
  );
  const endTs = Math.min(now, startTs + MAX_CATCHUP_HOURS * 60 * 60);
  return { checkpoint: safeCheckpoint, startTs, endTs };
};

const convertSliceToRows = (slice: any[], bridgeIds: RelayBridgeIds, label: string) => {
  const sourceTransactions: any[] = [];
  const destinationTransactions: any[] = [];
  let depositUsd = 0;

  for (const req of slice) {
    try {
      const event = convertRequestToEvent(req);
      if (event.deposit && event.depositChainId) {
        const depositSlug = chainIdToSlug[event.depositChainId];
        const bId = bridgeIds[depositSlug?.toLowerCase?.()];
        if (bId) {
          depositUsd += parseFloat(event.deposit.amount?.toString?.() || "0");
          sourceTransactions.push({
            bridge_id: bId,
            chain: depositSlug.toLowerCase(),
            tx_hash: event.deposit.txHash,
            ts: event.deposit.timestamp!,
            tx_block: null,
            tx_from: event.deposit.from ?? "0x",
            tx_to: event.deposit.to ?? "0x",
            token: event.deposit.token ?? "0x0000000000000000000000000000000000000000",
            amount: event.deposit.amount?.toString?.() || "0",
            is_deposit: true,
            is_usd_volume: true,
            txs_counted_as: 1,
            origin_chain: null,
          });
        }
      }

      if (event.withdraw && event.withdrawChainId) {
        const withdrawSlug = chainIdToSlug[event.withdrawChainId];
        const bId = bridgeIds[withdrawSlug?.toLowerCase?.()];
        if (bId) {
          destinationTransactions.push({
            bridge_id: bId,
            chain: withdrawSlug.toLowerCase(),
            tx_hash: event.withdraw.txHash,
            ts: event.withdraw.timestamp!,
            tx_block: null,
            tx_from: event.withdraw.from ?? "0x",
            tx_to: event.withdraw.to ?? "0x",
            token: event.withdraw.token ?? "0x0000000000000000000000000000000000000000",
            amount: event.withdraw.amount?.toString?.() || "0",
            is_deposit: false,
            is_usd_volume: true,
            txs_counted_as: 1,
            origin_chain: null,
          });
        }
      }
    } catch (e) {
      console.error(`${label} error converting request ${req?.id}:`, e);
    }
  }

  return { sourceTransactions, destinationTransactions, depositUsd };
};

const processHourWindow = async ([from, to]: [number, number], bridgeIds: RelayBridgeIds) => {
  const label = `[relay ${dayjs.unix(from).format("YYYY-MM-DD HH:mm")}-${dayjs.unix(to).format("HH:mm")}]`;
  console.log(`${label} start`);
  let hourDepositUsd = 0;
  let insertedDeposits = 0;
  let insertedWithdrawals = 0;
  let pageIndex = 0;

  const stats = await forEachRequestsByTimePage(from, to, async (slice) => {
    pageIndex += 1;
    const rows = convertSliceToRows(slice, bridgeIds, label);
    hourDepositUsd += rows.depositUsd;
    insertedDeposits += rows.sourceTransactions.length;
    insertedWithdrawals += rows.destinationTransactions.length;

    if (rows.sourceTransactions.length || rows.destinationTransactions.length) {
      await sql.begin(async (txSql) => {
        if (rows.sourceTransactions.length) {
          await insertTransactionRows(txSql, true, rows.sourceTransactions, "upsert");
        }
        if (rows.destinationTransactions.length) {
          await insertTransactionRows(txSql, true, rows.destinationTransactions, "upsert");
        }
      });

      if (pageIndex === 1 || pageIndex % 25 === 0) {
        console.log(
          `${label} inserted through page ${pageIndex}: ` +
            `${insertedDeposits} deposits, ${insertedWithdrawals} withdrawals`
        );
      }
    }
  });

  console.log(
    `${label} complete: ${stats.pages} pages, ${stats.requests} requests, ` +
      `${insertedDeposits} deposits, ${insertedWithdrawals} withdrawals`
  );
  return { depositUsd: hourDepositUsd, pages: stats.pages, requests: stats.requests };
};

export const handler = async () => {
  try {
    const bridgeIds = await loadRelayBridgeIds();
    const { checkpoint, startTs, endTs } = await resolveWindow();

    if (startTs >= endTs) {
      console.log(`Relay adapter skipped: resolved empty window ${startTs}-${endTs}`);
      return;
    }

    console.log(
      `Running Relay adapter from ${dayjs.unix(startTs).toISOString()} to ${dayjs.unix(endTs).toISOString()} ` +
        `(checkpoint=${checkpoint ? dayjs.unix(checkpoint).toISOString() : "none"}, ` +
        `overlap=${CHECKPOINT_OVERLAP_SECONDS}s, maxCatchup=${MAX_CATCHUP_HOURS}h, concurrency=${HOURS_CONCURRENCY})`
    );

    const windows = splitHourWindows(startTs, endTs);
    const hourTotals = await mapLimit(windows, HOURS_CONCURRENCY, (w) => processHourWindow(w, bridgeIds));
    const totalDepositUsd = hourTotals.reduce((sum, item) => sum + (item?.depositUsd || 0), 0);
    const totalPages = hourTotals.reduce((sum, item) => sum + (item?.pages || 0), 0);
    const totalRequests = hourTotals.reduce((sum, item) => sum + (item?.requests || 0), 0);

    console.log(
      `Relay processing complete. ${totalPages} pages, ${totalRequests} requests, ` +
        `total deposit USD: ${totalDepositUsd}`
    );
  } catch (error) {
    console.error("Fatal error in Relay handler:", error);
    throw error;
  }
};

export default wrapScheduledLambda(handler);
