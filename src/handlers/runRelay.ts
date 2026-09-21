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
import { convertSliceToRows, RelayBridgeIds } from "./relayProgress";
import { advanceDurableCheckpoint, getCache, getDurableCheckpoint, setCache } from "../utils/cache";

// Requests are read by createdAt, not updatedAt: Relay periodically bulk-touches old requests, which
// inflates an updatedAt stream 20-30x and used to stall the checkpoint. A request is created once, so a
// createdAt window is only the real traffic (~50 pages per 10 minutes). Late destination legs are picked
// up by re-scanning the last LOOKBACK_SECONDS every run (rows are upserted); p99 settle time is ~25 s.
const WINDOW_SECONDS = 10 * 60;
const LOOKBACK_SECONDS = 2 * 60 * 60;
const INITIAL_LOOKBACK_SECONDS = 48 * 60 * 60;
const INSERT_BATCH_PAGES = 10;
const RELAY_CHECKPOINT_KEY = "adapter_progress:relay:created_at";
// Cursor of the previous updatedAt-based ingest; used once so the switch resumes where it stopped.
const LEGACY_CHECKPOINT_KEY = "adapter_progress:relay:updated_at";
const RELAY_CHAIN_CATALOG_CACHE_KEY = "relay:chain_catalog:last_good";

export const splitIngestWindows = (startTs: number, endTs: number): Array<[number, number]> => {
  const windows: Array<[number, number]> = [];
  const firstWindowStart = Math.floor(startTs / WINDOW_SECONDS) * WINDOW_SECONDS;
  for (let t = firstWindowStart; t < endTs; t += WINDOW_SECONDS) {
    windows.push([Math.max(t, startTs), Math.min(t + WINDOW_SECONDS, endTs)]);
  }
  return windows;
};

export const resolveIngestStart = (checkpoint: number | null, now: number): number =>
  checkpoint === null ? now - INITIAL_LOOKBACK_SECONDS : Math.min(checkpoint, now) - LOOKBACK_SECONDS;

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

const loadCheckpoint = async (): Promise<number | null> =>
  (await getDurableCheckpoint(RELAY_CHECKPOINT_KEY)) ?? (await getDurableCheckpoint(LEGACY_CHECKPOINT_KEY));

export const processWindow = async (
  [from, to]: [number, number],
  bridgeIds: RelayBridgeIds,
  chainCatalog: RelayChainCatalog,
  signal?: AbortSignal
) => {
  const label = `[relay ${dayjs.unix(from).format("YYYY-MM-DD HH:mm")}-${dayjs.unix(to).format("HH:mm")}]`;
  let depositUsd = 0;
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
      if (deposits.length) await insertTransactionRows(txSql, true, deposits, "upsert", true);
      if (withdrawals.length) await insertTransactionRows(txSql, true, withdrawals, "upsert", true);
    });
  };

  const stats = await forEachRequestsByTimePage(
    from,
    to,
    async (slice) => {
      throwIfAborted(signal);
      pageIndex += 1;
      const rows = convertSliceToRows(slice, bridgeIds, chainCatalog, label);
      depositUsd += rows.depositUsd;
      insertedDeposits += rows.sourceTransactions.length;
      insertedWithdrawals += rows.destinationTransactions.length;
      skippedLegs += rows.skippedLegs;
      pendingDeposits.push(...rows.sourceTransactions);
      pendingWithdrawals.push(...rows.destinationTransactions);
      if (pageIndex % INSERT_BATCH_PAGES === 0) await flushRows();
    },
    undefined,
    signal
  );
  await flushRows();

  console.log(
    `${label} ${stats.pages} pages, ${stats.requests} requests, ` +
      `${insertedDeposits} deposits, ${insertedWithdrawals} withdrawals, ${skippedLegs} skipped legs`
  );
  return { depositUsd, pages: stats.pages, requests: stats.requests, skippedLegs };
};

export const handler = async (signal?: AbortSignal) => {
  try {
    throwIfAborted(signal);
    const chainCatalog = await loadRelayChainCatalog(signal);
    const bridgeIds = await loadRelayBridgeIds(chainCatalog);
    const now = dayjs().unix();
    const checkpoint = await loadCheckpoint();
    const windows = splitIngestWindows(resolveIngestStart(checkpoint, now), now);
    console.log(
      `Running Relay adapter over ${windows.length} windows from ${dayjs.unix(windows[0][0]).toISOString()} ` +
        `(checkpoint=${checkpoint === null ? "none" : dayjs.unix(checkpoint).toISOString()})`
    );

    let totalPages = 0;
    let totalRequests = 0;
    let totalDepositUsd = 0;
    for (const window of windows) {
      throwIfAborted(signal);
      const totals = await processWindow(window, bridgeIds, chainCatalog, signal);
      totalPages += totals.pages;
      totalRequests += totals.requests;
      totalDepositUsd += totals.depositUsd;
      await advanceDurableCheckpoint(RELAY_CHECKPOINT_KEY, window[1]);
    }
    console.log(
      `Relay complete: ${windows.length} windows, ${totalPages} pages, ${totalRequests} requests, ` +
        `total deposit USD: ${totalDepositUsd}, checkpoint ${dayjs.unix(now).toISOString()}`
    );
  } catch (error) {
    console.error("Fatal error in Relay handler:", error);
    throw error;
  }
};

export default wrapScheduledLambda(async () => handler());
