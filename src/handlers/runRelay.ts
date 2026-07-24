import { wrapScheduledLambda } from "../utils/wrap";
import adapter, { forEachRequestsByTimePage, convertRequestToEvent, chainIdToSlug } from "../adapters/relay";
import { sql } from "../utils/db";
import { insertTransactionRows } from "../utils/wrappa/postgres/write";
import { insertConfigEntriesForAdapter } from "../utils/adapter";
import dayjs from "dayjs";
import { formatError, NonRetryableError, throwIfAborted } from "../utils/errors";
import {
  RelayCheckpointSource,
  getRelayBootstrapCheckpoint,
  requireRelayChainId,
  resolveRelayWindowFromCheckpoint,
  validateRelayCheckpoint,
} from "./relayProgress";
import { advanceDurableCheckpoint, getDurableCheckpoint } from "../utils/cache";

const HOURS_CONCURRENCY = 4;
const CHECKPOINT_OVERLAP_SECONDS = 5 * 60;
const BOOTSTRAP_LOOKBACK_HOURS = 48;
const MAX_CATCHUP_HOURS = 4;
const INSERT_BATCH_PAGES = 10;
const RELAY_CHECKPOINT_KEY = "adapter_progress:relay:updated_at";

type RelayBridgeIds = Record<string, string | undefined>;

const mapLimit = async <T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
  onError?: () => void
): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;
  let stopped = false;
  let hasError = false;
  let firstError: unknown;
  const worker = async () => {
    while (!stopped) {
      const index = nextIndex++;
      if (index >= items.length) return;
      try {
        results[index] = await fn(items[index], index);
      } catch (error) {
        if (!stopped) {
          stopped = true;
          hasError = true;
          firstError = error;
          onError?.();
        }
        return;
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  if (hasError) throw firstError;
  return results;
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

const getLatestRelayCheckpoint = async (
  now: number
): Promise<{
  checkpoint: number | null;
  source: RelayCheckpointSource;
}> => {
  const durableCheckpoint = await getDurableCheckpoint(RELAY_CHECKPOINT_KEY);
  if (durableCheckpoint !== null) {
    return { checkpoint: validateRelayCheckpoint(durableCheckpoint, now), source: "redis" };
  }

  const bootstrapCheckpoint = getRelayBootstrapCheckpoint(now, BOOTSTRAP_LOOKBACK_HOURS * 60 * 60);
  const storedCheckpoint = await advanceDurableCheckpoint(RELAY_CHECKPOINT_KEY, bootstrapCheckpoint);
  console.log(
    `Relay bootstrap checkpoint initialized in Redis: ${dayjs
      .unix(storedCheckpoint)
      .toISOString()} (${RELAY_CHECKPOINT_KEY})`
  );
  return { checkpoint: validateRelayCheckpoint(storedCheckpoint, now), source: "redis" };
};

const resolveWindow = async () => {
  const now = dayjs().unix();
  const { checkpoint, source } = await getLatestRelayCheckpoint(now);
  return resolveRelayWindowFromCheckpoint({
    now,
    checkpoint,
    source,
    checkpointOverlapSeconds: CHECKPOINT_OVERLAP_SECONDS,
    bootstrapLookbackSeconds: BOOTSTRAP_LOOKBACK_HOURS * 60 * 60,
    maxCatchupSeconds: MAX_CATCHUP_HOURS * 60 * 60,
  });
};

const saveRelayCheckpoint = async (checkpoint: number) => {
  const storedCheckpoint = await advanceDurableCheckpoint(RELAY_CHECKPOINT_KEY, checkpoint);
  console.log(
    `Relay checkpoint stored in Redis: ${dayjs.unix(storedCheckpoint).toISOString()} (${RELAY_CHECKPOINT_KEY})`
  );
};

const convertSliceToRows = (slice: any[], bridgeIds: RelayBridgeIds, label: string) => {
  const sourceTransactions: any[] = [];
  const destinationTransactions: any[] = [];
  let depositUsd = 0;

  for (const req of slice) {
    try {
      const event = convertRequestToEvent(req);
      if (event.deposit) {
        const depositChainId = requireRelayChainId("deposit", event.depositChainId);
        const depositSlug = chainIdToSlug[depositChainId];
        if (!depositSlug) {
          throw new NonRetryableError(`Relay returned unknown deposit chain ID ${event.depositChainId}`);
        }
        const bId = bridgeIds[depositSlug?.toLowerCase?.()];
        if (!bId) {
          throw new NonRetryableError(`Relay bridge config is missing deposit chain ${depositSlug}`);
        }
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

      if (event.withdraw) {
        const withdrawChainId = requireRelayChainId("withdrawal", event.withdrawChainId);
        const withdrawSlug = chainIdToSlug[withdrawChainId];
        if (!withdrawSlug) {
          throw new NonRetryableError(`Relay returned unknown withdrawal chain ID ${event.withdrawChainId}`);
        }
        const bId = bridgeIds[withdrawSlug?.toLowerCase?.()];
        if (!bId) {
          throw new NonRetryableError(`Relay bridge config is missing withdrawal chain ${withdrawSlug}`);
        }
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
    } catch (e) {
      throw new NonRetryableError(`${label} failed to convert request ${req?.id ?? "unknown"}: ${formatError(e)}`);
    }
  }

  return { sourceTransactions, destinationTransactions, depositUsd };
};

const processHourWindow = async ([from, to]: [number, number], bridgeIds: RelayBridgeIds, signal?: AbortSignal) => {
  const label = `[relay ${dayjs.unix(from).format("YYYY-MM-DD HH:mm")}-${dayjs.unix(to).format("HH:mm")}]`;
  console.log(`${label} start`);
  let hourDepositUsd = 0;
  let insertedDeposits = 0;
  let insertedWithdrawals = 0;
  let pageIndex = 0;
  let pendingDeposits: any[] = [];
  let pendingWithdrawals: any[] = [];

  const flushRows = async () => {
    throwIfAborted(signal);
    if (!pendingDeposits.length && !pendingWithdrawals.length) return;
    const deposits = pendingDeposits;
    const withdrawals = pendingWithdrawals;
    pendingDeposits = [];
    pendingWithdrawals = [];
    await sql.begin(async (txSql) => {
      if (deposits.length) {
        await insertTransactionRows(txSql, true, deposits, "upsert", true);
      }
      if (withdrawals.length) {
        await insertTransactionRows(txSql, true, withdrawals, "upsert", true);
      }
    });
  };

  const stats = await forEachRequestsByTimePage(
    from,
    to,
    async (slice) => {
      throwIfAborted(signal);
      pageIndex += 1;
      const rows = convertSliceToRows(slice, bridgeIds, label);
      hourDepositUsd += rows.depositUsd;
      insertedDeposits += rows.sourceTransactions.length;
      insertedWithdrawals += rows.destinationTransactions.length;

      pendingDeposits.push(...rows.sourceTransactions);
      pendingWithdrawals.push(...rows.destinationTransactions);
      if (pageIndex % INSERT_BATCH_PAGES === 0) await flushRows();

      if (pageIndex === 1 || pageIndex % 25 === 0) {
        console.log(
          `${label} processed through page ${pageIndex}: ` +
            `${insertedDeposits} deposits, ${insertedWithdrawals} withdrawals`
        );
      }
    },
    undefined,
    signal
  );
  await flushRows();

  console.log(
    `${label} complete: ${stats.pages} pages, ${stats.requests} requests, ` +
      `${insertedDeposits} deposits, ${insertedWithdrawals} withdrawals`
  );
  return { depositUsd: hourDepositUsd, pages: stats.pages, requests: stats.requests };
};

export const handler = async (signal?: AbortSignal) => {
  const relayController = new AbortController();
  const abortRelay = () => relayController.abort();
  signal?.addEventListener("abort", abortRelay, { once: true });
  if (signal?.aborted) abortRelay();
  const relaySignal = relayController.signal;
  try {
    throwIfAborted(relaySignal);
    const bridgeIds = await loadRelayBridgeIds();
    const { checkpoint, startTs, endTs, source, overlap } = await resolveWindow();

    if (startTs >= endTs) {
      console.log(`Relay adapter skipped: resolved empty window ${startTs}-${endTs}`);
      return;
    }

    const windowConcurrency = source === "redis" ? HOURS_CONCURRENCY : 1;
    console.log(
      `Running Relay adapter from ${dayjs.unix(startTs).toISOString()} to ${dayjs.unix(endTs).toISOString()} ` +
        `(checkpoint=${checkpoint ? dayjs.unix(checkpoint).toISOString() : "none"}, ` +
        `source=${source}, overlap=${overlap}s, maxCatchup=${MAX_CATCHUP_HOURS}h, concurrency=${windowConcurrency})`
    );

    const windows = splitHourWindows(startTs, endTs);
    const hourTotals = await mapLimit(
      windows,
      windowConcurrency,
      (w) => processHourWindow(w, bridgeIds, relaySignal),
      abortRelay
    );
    throwIfAborted(relaySignal);
    const totalDepositUsd = hourTotals.reduce((sum, item) => sum + (item?.depositUsd || 0), 0);
    const totalPages = hourTotals.reduce((sum, item) => sum + (item?.pages || 0), 0);
    const totalRequests = hourTotals.reduce((sum, item) => sum + (item?.requests || 0), 0);

    console.log(
      `Relay processing complete. ${totalPages} pages, ${totalRequests} requests, ` +
        `total deposit USD: ${totalDepositUsd}`
    );
    await saveRelayCheckpoint(endTs);
  } catch (error) {
    console.error("Fatal error in Relay handler:", error);
    throw error;
  } finally {
    signal?.removeEventListener("abort", abortRelay);
  }
};

export default wrapScheduledLambda(async () => handler());
