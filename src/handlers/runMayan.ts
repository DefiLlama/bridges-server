import { PromisePool } from "@supercharge/promise-pool";
import adapter, {
  createRowAccumulator,
  forEachPage,
  MayanSwap,
  normalizeSwap,
  PagingResult,
  Partition,
  partitionLabel,
  servicesForChain,
  resolveIngestWindow,
  sourceChainNames,
  SwapLeg,
  SwapSkipReason,
  TransactionRow,
  VOLUME_WINDOW_MS,
} from "../adapters/mayan";
import { insertConfigEntriesForAdapter } from "../utils/adapter";
import { advanceDurableCheckpoint, getDurableCheckpoint, setCache } from "../utils/cache";
import { sql } from "../utils/db";
import { formatError, NonRetryableError, throwIfAborted } from "../utils/errors";
import { wrapScheduledLambda } from "../utils/wrap";
import { insertTransactionRows } from "../utils/wrappa/postgres/write";

const BRIDGE_NAME = "mayan";
const VOLUME_CACHE_KEY = "24h_mayan_volume";
const CHECKPOINT_KEY = "adapter_progress:mayan:initiated_at";
const INSERT_BATCH_SIZE = 500;
const PARTITION_CONCURRENCY = 4;

/** Stop before the cron's own timeout, which would abort a partition mid-read. */
const TIME_BUDGET_MS = 16 * 60 * 1000;

const getNewestStoredMs = async (): Promise<number | null> => {
  const [row] = await sql<Array<{ newest: string | null }>>`
    SELECT floor(extract(epoch from max(t.ts)) * 1000)::bigint::text AS newest
    FROM bridges.transactions t
    JOIN bridges.config c ON c.id = t.bridge_id
    WHERE c.bridge_name = ${BRIDGE_NAME}
      AND t.ts <= NOW()
  `;
  const newest = Number(row?.newest);
  return Number.isFinite(newest) && newest > 0 ? newest : null;
};

/**
 * The checkpoint is held back by an incomplete run so the next one re-reads the gap. Only an
 * unconfigured Redis falls back to the newest stored row, which cannot express incompleteness.
 */
const readCheckpointMs = async (): Promise<number | null> => {
  try {
    const seconds = await getDurableCheckpoint(CHECKPOINT_KEY);
    if (seconds !== null) return seconds * 1000;
  } catch (error) {
    // Only an unconfigured Redis may fall back. When Redis exists but is unreachable, the newest
    // stored row would silently stand in for a checkpoint that was deliberately held back, skipping
    // the very gap the hold-back exists to re-read.
    if (process.env.REDIS_URL) {
      throw new NonRetryableError(`Mayan checkpoint is unreadable: ${formatError(error)}`);
    }
    console.warn(`[WARN] No Redis configured (${formatError(error)}); using the newest stored row instead.`);
  }
  return getNewestStoredMs();
};

const saveCheckpoint = async (checkpointMs: number) => {
  try {
    await advanceDurableCheckpoint(CHECKPOINT_KEY, Math.floor(checkpointMs / 1000));
  } catch (error) {
    console.warn(`[WARN] Mayan checkpoint not stored (${formatError(error)}); the next run re-reads this window.`);
  }
};

/** Read back from stored rows, so the figure holds regardless of how far the run paged. */
const getRecentVolumeUsd = async (): Promise<{ volumeUsd: number; legs: number }> => {
  const [row] = await sql<Array<{ volume: string; legs: string }>>`
    SELECT COALESCE(sum(t.amount::numeric), 0)::text AS volume, count(*)::text AS legs
    FROM bridges.transactions t
    JOIN bridges.config c ON c.id = t.bridge_id
    WHERE c.bridge_name = ${BRIDGE_NAME}
      AND t.is_deposit
      AND t.is_usd_volume
      AND t.ts >= NOW() - ${`${VOLUME_WINDOW_MS / 1000} seconds`}::interval
  `;
  return { volumeUsd: Number(row?.volume ?? 0), legs: Number(row?.legs ?? 0) };
};

const getBridgeIdsByChain = async (): Promise<Record<string, string>> => {
  const rows = await sql<Array<{ chain: string; id: string }>>`
    SELECT chain, id::text AS id FROM bridges.config WHERE bridge_name = ${BRIDGE_NAME}
  `;
  return Object.fromEntries(rows.map((row) => [row.chain, row.id]));
};

const toRow = (bridgeId: string, leg: SwapLeg): TransactionRow => ({
  bridge_id: bridgeId,
  chain: leg.chain,
  tx_hash: leg.txHash,
  ts: leg.timestamp,
  tx_block: null,
  tx_from: leg.from,
  tx_to: leg.to,
  token: leg.token,
  amount: leg.amountUsd,
  is_deposit: leg.isDeposit,
  is_usd_volume: true,
  txs_counted_as: 1,
  origin_chain: leg.originChain,
});

/** Writes rows in batches. Rows are upserted, so a repeated run is idempotent. */
const writeRows = async (rows: TransactionRow[]) => {
  for (let start = 0; start < rows.length; start += INSERT_BATCH_SIZE) {
    const batch = rows.slice(start, start + INSERT_BATCH_SIZE);
    await sql.begin(async (transaction) => {
      await insertTransactionRows(transaction, true, batch, "upsert", true);
    });
  }
};

type Diagnostics = {
  depositLegs: number;
  withdrawalLegs: number;
  /** Legs a settled swap could not produce, for want of a transaction hash. */
  unroutableLegs: number;
  skippedSwaps: Record<SwapSkipReason, number>;
  sourcePricedSwaps: number;
  priceConflicts: number;
  unmappedChainIds: Set<string>;
  skippedPartitions: string[];
};

const createDiagnostics = (): Diagnostics => ({
  depositLegs: 0,
  withdrawalLegs: 0,
  unroutableLegs: 0,
  skippedSwaps: { unsettled: 0, same_chain: 0, invalid_timestamp: 0, unpriced: 0, uncorroborated: 0 },
  sourcePricedSwaps: 0,
  priceConflicts: 0,
  unmappedChainIds: new Set(),
  skippedPartitions: [],
});

const reportDiagnostics = (diagnostics: Diagnostics) => {
  const { unmappedChainIds, skippedPartitions, skippedSwaps } = diagnostics;
  if (unmappedChainIds.size > 0) {
    console.warn(
      `[WARN] Mayan reported chain id(s) ${[...unmappedChainIds].join(", ")} with no entry in the adapter's ` +
        `chain table; those legs are not recorded until the table is updated.`
    );
  }
  if (skippedPartitions.length > 0) {
    console.warn(
      `[WARN] Exhausted the ${TIME_BUDGET_MS / 60_000} minute budget before reading ` +
        `${skippedPartitions.length} partition(s): ${skippedPartitions.join(", ")}.`
    );
  }
  console.log(
    `Mayan wrote ${diagnostics.depositLegs} deposit and ${diagnostics.withdrawalLegs} withdrawal legs; ` +
      `skipped ${skippedSwaps.unsettled} unsettled, ${skippedSwaps.same_chain} same-chain, ` +
      `${skippedSwaps.unpriced} unpriced, ${skippedSwaps.uncorroborated} uncorroborated and ` +
      `${skippedSwaps.invalid_timestamp} undated swaps, plus ` +
      `${diagnostics.unroutableLegs} unroutable legs; ${diagnostics.sourcePricedSwaps} swaps priced from the ` +
      `source side, ${diagnostics.priceConflicts} with conflicting side prices.`
  );
};

export const handler = async (signal?: AbortSignal) => {
  throwIfAborted(signal);
  const startedAt = Date.now();

  await insertConfigEntriesForAdapter(adapter, BRIDGE_NAME);
  const bridgeIds = await getBridgeIdsByChain();

  const checkpointMs = await readCheckpointMs();
  const { fromMs, unreachableGap } = resolveIngestWindow(checkpointMs, startedAt);
  if (unreachableGap) {
    console.warn(
      `[WARN] The Mayan checkpoint predates what the explorer API can page back to; ` +
        `the gap before ${new Date(fromMs).toISOString()} needs a manual backfill.`
    );
  }
  console.log(
    `Ingesting Mayan swaps since ${new Date(fromMs).toISOString()} ` +
      `(checkpoint ${checkpointMs ? new Date(checkpointMs).toISOString() : "none"})`
  );

  const diagnostics = createDiagnostics();
  // Rows accumulate across both passes and are written once, so swaps sharing a transaction are
  // summed rather than overwriting one another.
  const accumulator = createRowAccumulator();

  const collectRows = (swaps: MayanSwap[]) => {
    for (const swap of swaps) {
      const { legs, skipped, unmappedChainIds, pricedFromSource, priceConflict } = normalizeSwap(swap);
      unmappedChainIds.forEach((chainId) => diagnostics.unmappedChainIds.add(chainId));
      if (pricedFromSource) diagnostics.sourcePricedSwaps++;
      if (priceConflict) diagnostics.priceConflicts++;
      if (skipped) {
        diagnostics.skippedSwaps[skipped]++;
        continue;
      }
      diagnostics.unroutableLegs += 2 - legs.length;

      for (const leg of legs) {
        // A page can reach past the window start; only rows inside it belong to this run.
        if (leg.timestamp < fromMs) continue;

        const bridgeId = bridgeIds[leg.chain];
        if (!bridgeId) {
          throw new NonRetryableError(`bridges.config has no ${BRIDGE_NAME} row for chain ${leg.chain}`);
        }

        accumulator.add(toRow(bridgeId, leg), swap.orderId ?? `${leg.chain}-${leg.txHash}`);
        if (leg.isDeposit) diagnostics.depositLegs++;
        else diagnostics.withdrawalLegs++;
      }
    }
  };

  const isExpired = () => Date.now() - startedAt > TIME_BUDGET_MS;

  const ingestPartition = async (partition: Partition): Promise<PagingResult> => {
    if (isExpired()) {
      diagnostics.skippedPartitions.push(partitionLabel(partition));
      return { partition, pages: 0, swaps: 0, truncated: false, expired: true, oldestSeen: null };
    }

    throwIfAborted(signal);
    const result = await forEachPage(
      partition,
      fromMs,
      async (swaps) => collectRows(swaps),
      signal,
      undefined,
      isExpired
    );
    if (result.expired) diagnostics.skippedPartitions.push(partitionLabel(partition));

    console.log(
      `[PARTITION] ${partitionLabel(partition)}: ${result.pages} page(s), ${result.swaps} swap(s), oldest ` +
        `${result.oldestSeen ? new Date(result.oldestSeen).toISOString() : "n/a"}` +
        `${result.truncated ? ", truncated at the offset cap" : ""}${
          result.expired ? ", stopped at the time budget" : ""
        }`
    );
    return result;
  };

  const ingestPartitions = async (partitions: Partition[]) => {
    const { results, errors } = await PromisePool.withConcurrency(PARTITION_CONCURRENCY)
      .for(partitions)
      .process(ingestPartition);
    // The pool collects failures rather than rejecting; an unread partition must fail the job
    // instead of passing for a quiet day.
    if (errors.length > 0) throw errors[0].raw ?? errors[0];
    return results;
  };

  // Write whatever was read even if a partition fails: partial coverage beats none, and the
  // checkpoint is held back either way.
  const flush = async () => {
    const rows = accumulator.drain();
    if (rows.length === 0) return;
    console.log(`Writing ${rows.length} Mayan rows.`);
    await writeRows(rows);
  };

  let stillTruncated: string[] = [];
  try {
    const chainResults = await ingestPartitions(sourceChainNames.map((fromChain) => ({ fromChain })));

    // A chain busy enough to exhaust the offset cap is split by service, which multiplies the depth a
    // single query reaches. Rows the first pass already read are deduplicated by the accumulator.
    const truncatedChains = chainResults
      .filter(({ truncated }) => truncated)
      .map(({ partition }) => partition.fromChain);
    if (truncatedChains.length > 0) {
      console.log(`Splitting ${truncatedChains.join(", ")} by service after hitting the offset cap.`);
      // Split only by services the chain runs: querying a combination with no swaps is slow enough
      // to exhaust its retries.
      const serviceResults = await ingestPartitions(
        truncatedChains.flatMap((fromChain) => servicesForChain(fromChain).map((service) => ({ fromChain, service })))
      );
      stillTruncated = serviceResults
        .filter(({ truncated }) => truncated)
        .map(({ partition }) => partitionLabel(partition));
      if (stillTruncated.length > 0) {
        console.warn(
          `[WARN] ${stillTruncated.join(", ")} remain truncated after the service split; they cover only ` +
            `back to the oldest page logged above.`
        );
      }
    }
  } finally {
    await flush();
  }

  reportDiagnostics(diagnostics);

  // Only a partition stopped by the time budget holds the checkpoint back, since only that one
  // benefits from a retry; a truncated partition would stop at the same place every time.
  if (diagnostics.skippedPartitions.length === 0) {
    await saveCheckpoint(startedAt);
  } else {
    console.warn(`[WARN] Mayan checkpoint held back; the next run repeats from ${new Date(fromMs).toISOString()}.`);
  }

  const { volumeUsd, legs } = await getRecentVolumeUsd();
  console.log(`Mayan ${VOLUME_WINDOW_MS / (60 * 60 * 1000)}h volume across ${legs} deposits: $${volumeUsd.toFixed(2)}`);
  await setCache(VOLUME_CACHE_KEY, volumeUsd, null);
};

export default wrapScheduledLambda(handler);
