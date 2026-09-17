import { wrapScheduledLambda } from "../utils/wrap";
import adapter, {
  RelayChainCatalog,
  chainIdToSlug,
  fetchRelayChainCatalog,
  forEachRequestsByTimePage,
  parseRelayChainsResponse,
  serializeRelayChainCatalog,
} from "../adapters/relay";
import { sql } from "../utils/db";
import { insertTransactionRows } from "../utils/wrappa/postgres/write";
import { insertConfigEntriesForAdapter } from "../utils/adapter";
import dayjs from "dayjs";
import { formatError, throwIfAborted } from "../utils/errors";
import {
  convertSliceToRows,
  createCompletionPrefix,
  RelayBridgeIds,
  RelayCheckpointSource,
  resolveRelayWindowFromCheckpoint,
  validateRelayCheckpoint,
} from "./relayProgress";
import { advanceDurableCheckpoint, getCache, getDurableCheckpoint, setCache } from "../utils/cache";

// TEMP relay catch-up (Sept 2026): was 4 / 24h / 20m. Revert together with the cron.ts relay schedule.
const HOURS_CONCURRENCY = 8;
const CHECKPOINT_OVERLAP_SECONDS = 5 * 60;
const INITIAL_LOOKBACK_HOURS = 48;
const MAX_CATCHUP_HOURS = 72;
const SOFT_DEADLINE_MINUTES = 30;
const INSERT_BATCH_PAGES = 10;
const RELAY_CHECKPOINT_KEY = "adapter_progress:relay:updated_at";
const RELAY_CHAIN_CATALOG_CACHE_KEY = "relay:chain_catalog:last_good";

const runWindows = async <T>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<void>,
  { isExpired, onSettled }: { isExpired: () => boolean; onSettled: (index: number) => void | Promise<void> }
): Promise<{ started: number; firstError?: unknown; expired: boolean }> => {
  let nextIndex = 0;
  let started = 0;
  let stopped = false;
  let expired = false;
  let firstError: unknown;

  const worker = async () => {
    while (!stopped) {
      if (isExpired()) {
        expired = true;
        return;
      }
      const index = nextIndex++;
      if (index >= items.length) return;
      started += 1;
      try {
        await fn(items[index], index);
        await onSettled(index);
      } catch (error) {
        if (!stopped) {
          stopped = true;
          firstError = error;
        }
        return;
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return { started, firstError, expired };
};

export const splitHourWindows = (startTs: number, endTs: number): Array<[number, number]> => {
  const windows: Array<[number, number]> = [];
  const startHour = Math.floor(startTs / 3600) * 3600;
  for (let t = startHour; t < endTs; t += 3600) {
    windows.push([Math.max(t, startTs), Math.min(t + 3600, endTs)]);
  }
  return windows;
};

export const loadRelayChainCatalog = async (signal?: AbortSignal): Promise<RelayChainCatalog> => {
  try {
    const liveCatalog = await fetchRelayChainCatalog(signal);
    await setCache(RELAY_CHAIN_CATALOG_CACHE_KEY, serializeRelayChainCatalog(liveCatalog), null);
    console.log(`Loaded ${Object.keys(liveCatalog).length} Relay chains from the live catalog.`);
    return { ...chainIdToSlug, ...liveCatalog };
  } catch (error) {
    throwIfAborted(signal);
    console.warn(`Relay live chain catalog failed: ${formatError(error)}`);
  }

  const cachedCatalog = await getCache(RELAY_CHAIN_CATALOG_CACHE_KEY);
  if (cachedCatalog !== null) {
    try {
      const parsedCatalog = parseRelayChainsResponse(cachedCatalog);
      console.warn(`Using ${Object.keys(parsedCatalog).length} Relay chains from the Redis last-known-good catalog.`);
      return { ...chainIdToSlug, ...parsedCatalog };
    } catch (error) {
      console.warn(`Relay Redis chain catalog is invalid: ${formatError(error)}`);
    }
  }

  console.warn(`Relay chain catalog is unavailable; using ${Object.keys(chainIdToSlug).length} static chain mappings.`);
  return { ...chainIdToSlug };
};

export const loadRelayBridgeIds = async (chainCatalog: RelayChainCatalog): Promise<RelayBridgeIds> => {
  const dynamicAdapter = Object.fromEntries(Object.values(chainCatalog).map((chain) => [chain, true]));
  await insertConfigEntriesForAdapter({ ...adapter, ...dynamicAdapter } as any, "relay");
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
  return { checkpoint: null, source: "lookback" };
};

const resolveWindow = async () => {
  const now = dayjs().unix();
  const { checkpoint, source } = await getLatestRelayCheckpoint(now);
  return resolveRelayWindowFromCheckpoint({
    now,
    checkpoint,
    source,
    checkpointOverlapSeconds: CHECKPOINT_OVERLAP_SECONDS,
    initialLookbackSeconds: INITIAL_LOOKBACK_HOURS * 60 * 60,
    maxCatchupSeconds: MAX_CATCHUP_HOURS * 60 * 60,
  });
};

const saveRelayCheckpoint = async (checkpoint: number) => {
  const storedCheckpoint = await advanceDurableCheckpoint(RELAY_CHECKPOINT_KEY, checkpoint);
  console.log(
    `Relay checkpoint stored in Redis: ${dayjs.unix(storedCheckpoint).toISOString()} (${RELAY_CHECKPOINT_KEY})`
  );
};

export const processHourWindow = async (
  [from, to]: [number, number],
  bridgeIds: RelayBridgeIds,
  chainCatalog: RelayChainCatalog,
  signal?: AbortSignal
) => {
  const label = `[relay ${dayjs.unix(from).format("YYYY-MM-DD HH:mm")}-${dayjs.unix(to).format("HH:mm")}]`;
  console.log(`${label} start`);
  let hourDepositUsd = 0;
  let insertedDeposits = 0;
  let insertedWithdrawals = 0;
  let skippedLegs = 0;
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
      const rows = convertSliceToRows(slice, bridgeIds, chainCatalog, label);
      hourDepositUsd += rows.depositUsd;
      insertedDeposits += rows.sourceTransactions.length;
      insertedWithdrawals += rows.destinationTransactions.length;
      skippedLegs += rows.skippedLegs;

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
      `${insertedDeposits} deposits, ${insertedWithdrawals} withdrawals, ${skippedLegs} skipped legs`
  );
  return { depositUsd: hourDepositUsd, pages: stats.pages, requests: stats.requests, skippedLegs };
};

export const handler = async (signal?: AbortSignal) => {
  const relayController = new AbortController();
  const abortRelay = () => relayController.abort();
  signal?.addEventListener("abort", abortRelay, { once: true });
  if (signal?.aborted) abortRelay();
  const relaySignal = relayController.signal;
  try {
    throwIfAborted(relaySignal);
    const chainCatalog = await loadRelayChainCatalog(relaySignal);
    const bridgeIds = await loadRelayBridgeIds(chainCatalog);
    const { checkpoint, startTs, endTs, source, overlap } = await resolveWindow();

    if (startTs >= endTs) {
      console.log(`Relay adapter skipped: resolved empty window ${startTs}-${endTs}`);
      return;
    }

    const windows = splitHourWindows(startTs, endTs);
    const deadlineAt = Date.now() + SOFT_DEADLINE_MINUTES * 60 * 1000;
    console.log(
      `Running Relay adapter from ${dayjs.unix(startTs).toISOString()} to ${dayjs.unix(endTs).toISOString()} ` +
        `(checkpoint=${checkpoint ? dayjs.unix(checkpoint).toISOString() : "none"}, ` +
        `source=${source}, overlap=${overlap}s, maxCatchup=${MAX_CATCHUP_HOURS}h, ` +
        `windows=${windows.length}, concurrency=${HOURS_CONCURRENCY}, deadline=${SOFT_DEADLINE_MINUTES}m)`
    );

    const prefix = createCompletionPrefix(windows.length);
    let savedPrefix = 0;
    let totalDepositUsd = 0;
    let totalPages = 0;
    let totalRequests = 0;
    let totalSkippedLegs = 0;

    const { firstError, expired } = await runWindows(
      windows,
      HOURS_CONCURRENCY,
      async (w, index) => {
        const totals = await processHourWindow(w, bridgeIds, chainCatalog, relaySignal);
        totalDepositUsd += totals.depositUsd;
        totalPages += totals.pages;
        totalRequests += totals.requests;
        totalSkippedLegs += totals.skippedLegs;
        prefix.complete(index);
      },
      {
        isExpired: () => Date.now() >= deadlineAt || relaySignal.aborted,
        onSettled: async () => {
          if (prefix.length <= savedPrefix) return;
          savedPrefix = prefix.length;
          await saveRelayCheckpoint(windows[savedPrefix - 1][1]);
        },
      }
    );

    console.log(
      `Relay processing ${savedPrefix === windows.length ? "complete" : "partial"}: ` +
        `${savedPrefix}/${windows.length} windows checkpointed, ${totalPages} pages, ` +
        `${totalRequests} requests, ${totalSkippedLegs} skipped legs, total deposit USD: ${totalDepositUsd}`
    );

    if (firstError) throw firstError;
    if (expired) {
      console.warn(
        `Relay stopped at the ${SOFT_DEADLINE_MINUTES}m deadline with ` +
          `${windows.length - savedPrefix} window(s) left; the next run resumes from the checkpoint.`
      );
    }
  } catch (error) {
    console.error("Fatal error in Relay handler:", error);
    throw error;
  } finally {
    signal?.removeEventListener("abort", abortRelay);
  }
};

export default wrapScheduledLambda(async () => handler());
