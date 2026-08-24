import fetch from "node-fetch";
import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { EventData } from "../../utils/types";
import { isAbortError, NonRetryableError, throwIfAborted, waitWithSignal } from "../../utils/errors";

/**
 * Reads Mayan's public explorer API, which needs no credentials, and turns each swap into the rows
 * it produces. `runMayan` owns fetching and persistence.
 *
 * `format=raw` is required: the default shape reports a source amount and a source price belonging
 * to different tokens. It omits the derived completion flag, hence `isSettled`.
 */
const DEFAULT_EXPLORER_URL = "https://explorer-api.mayan.finance/v3/swaps";

/** Server-side query limits; larger values are rejected. MAX_OFFSET caps how far one query reaches. */
const PAGE_SIZE = 100;
const MAX_OFFSET = 3000;

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
/** Placeholder for a counterparty the feed does not expose. Aggregation drops zero-address rows. */
const UNKNOWN_ADDRESS = "0x";

/** Divergence between the two sides of a swap above which neither price is treated as corroborated. */
const MAX_PRICE_DIVERGENCE = 10;

/**
 * Most a swap may be worth when only the source side could be priced, since nothing is left to check
 * that price against. Destination-only pricing is trusted: it is the side the feed reports reliably.
 */
const MAX_SOURCE_ONLY_USD = 1_000_000;

const HOUR_MS = 60 * 60 * 1000;

/**
 * The feed is ordered by initiation but swaps settle later, so a resume starts behind the checkpoint
 * to pick up ones that were still pending when last read.
 */
const CHECKPOINT_OVERLAP_MS = 2 * HOUR_MS;
/** How far back a run will reach, sized so no partition approaches the offset cap. */
const MAX_LOOKBACK_MS = 12 * HOUR_MS;
/** Window the bridge reports volume over. */
export const VOLUME_WINDOW_MS = 24 * HOUR_MS;

/** Queries can take many seconds to answer, so allow generous timeouts. */
const REQUEST_RETRIES = 8;
const REQUEST_TIMEOUT_MS = 60_000;
const RETRY_BASE_MS = 5_000;
const RETRY_MAX_MS = 60_000;

type MayanChain = {
  /** Value accepted by the `fromChain` query parameter. */
  name: string;
  /** Wormhole chain id, which is how the feed reports source and destination. */
  wormholeId: string;
  /** Chain key used by bridges-server and DefiLlama. */
  slug: string;
  /**
   * Cross-chain services this chain runs, and the only ones queried when it has to be split. Asking
   * for a combination that has no swaps is far slower than asking for one that does.
   */
  services: string[];
};

/**
 * Every chain Mayan settles on. HyperEVM and HyperCore both report as DefiLlama's "Hyperliquid";
 * Aptos is retired but kept so its existing `bridges.config` row keeps resolving.
 */
const CHAINS: MayanChain[] = [
  {
    name: "solana",
    wormholeId: "1",
    slug: "solana",
    services: [
      "SWIFT_V2",
      "MCTP_FAST_SWAP",
      "MCTP_FAST_BRIDGE",
      "MCTP_SWAP",
      "MCTP_BRIDGE",
      "WH_BRIDGE",
      "MCTP_BRIDGE_WITH_UNLOCK",
    ],
  },
  {
    name: "ethereum",
    wormholeId: "2",
    slug: "ethereum",
    services: ["SWIFT_V2", "MCTP_FAST_SWAP", "MCTP_FAST_BRIDGE", "MCTP_BRIDGE", "MCTP_SWAP", "WH_BRIDGE"],
  },
  { name: "bsc", wormholeId: "4", slug: "bsc", services: ["SWIFT_V2"] },
  {
    name: "polygon",
    wormholeId: "5",
    slug: "polygon",
    services: ["SWIFT_V2", "MCTP_FAST_SWAP", "MCTP_BRIDGE", "MCTP_FAST_BRIDGE", "MCTP_SWAP", "MCTP_BRIDGE_WITH_UNLOCK"],
  },
  {
    name: "avalanche",
    wormholeId: "6",
    slug: "avalanche",
    services: ["SWIFT_V2", "MCTP_FAST_SWAP", "MCTP_BRIDGE", "MCTP_FAST_BRIDGE", "MCTP_BRIDGE_WITH_UNLOCK", "MCTP_SWAP"],
  },
  { name: "sui", wormholeId: "21", slug: "sui", services: ["MCTP_SWAP", "MCTP_BRIDGE", "MCTP_BRIDGE_WITH_UNLOCK"] },
  { name: "aptos", wormholeId: "22", slug: "aptos", services: [] },
  {
    name: "arbitrum",
    wormholeId: "23",
    slug: "arbitrum",
    services: ["SWIFT_V2", "MCTP_FAST_SWAP", "MCTP_FAST_BRIDGE", "MCTP_BRIDGE", "MCTP_SWAP", "MCTP_BRIDGE_WITH_UNLOCK"],
  },
  {
    name: "optimism",
    wormholeId: "24",
    slug: "optimism",
    services: ["SWIFT_V2", "MCTP_FAST_SWAP", "MCTP_BRIDGE", "MCTP_FAST_BRIDGE", "MCTP_SWAP", "MCTP_BRIDGE_WITH_UNLOCK"],
  },
  {
    name: "base",
    wormholeId: "30",
    slug: "base",
    services: ["SWIFT_V2", "MCTP_FAST_SWAP", "MCTP_BRIDGE", "MCTP_FAST_BRIDGE", "MCTP_SWAP", "MCTP_BRIDGE_WITH_UNLOCK"],
  },
  { name: "linea", wormholeId: "38", slug: "linea", services: ["MCTP_FAST_SWAP", "MCTP_FAST_BRIDGE"] },
  {
    name: "unichain",
    wormholeId: "44",
    slug: "unichain",
    services: ["MCTP_FAST_SWAP", "MCTP_BRIDGE", "MCTP_FAST_BRIDGE"],
  },
  {
    name: "hyperevm",
    wormholeId: "47",
    slug: "hyperliquid",
    services: ["SWIFT_V2", "MCTP_FAST_SWAP", "MCTP_FAST_BRIDGE"],
  },
  {
    name: "monad",
    wormholeId: "48",
    slug: "monad",
    services: ["SWIFT_V2", "MCTP_FAST_BRIDGE", "MCTP_FAST_SWAP"],
  },
  { name: "hypercore", wormholeId: "65000", slug: "hyperliquid", services: ["HC_WITHDRAW"] },
];

/** Source chains to walk. A swap has exactly one source chain, so this covers the feed once. */
export const sourceChainNames = CHAINS.map((chain) => chain.name);

/** Services worth querying when a chain has to be split. */
export const servicesForChain = (name: string): string[] => CHAINS.find((chain) => chain.name === name)?.services ?? [];

const chainSlugByWormholeId: Record<string, string> = Object.fromEntries(
  CHAINS.map((chain) => [chain.wormholeId, chain.slug])
);

/** Subset of the explorer's raw swap row this adapter consumes. */
export type MayanSwap = {
  orderId?: string | null;
  service?: string | null;
  status?: string | null;
  customPayloadSettleTxHash?: string | null;
  meta?: { hypercoreData?: { redeemTxHash?: string | null } | null } | null;
  initiatedAt?: string | null;
  trader?: string | null;
  destAddress?: string | null;
  sourceTxHash?: string | null;
  fulfillTxHash?: string | null;
  sourceChain?: string | null;
  destChain?: string | null;
  fromAmount?: string | number | null;
  toAmount?: string | number | null;
  fromTokenAddress?: string | null;
  toTokenAddress?: string | null;
  fromTokenPrice?: number | null;
  toTokenPrice?: number | null;
};

/** One side of a swap, ready to be written to `bridges.transactions`. */
export type SwapLeg = {
  chain: string;
  originChain: string | null;
  txHash: string;
  timestamp: number;
  from: string;
  to: string;
  token: string;
  /** USD with cents. The column is a VARCHAR read with BigNumber, so decimals survive. */
  amountUsd: string;
  isDeposit: boolean;
};

/**
 * Statuses the feed reports once value has reached the recipient. The raw response carries `status`
 * rather than the completion flag the default response derives, so that judgement is made here.
 */
const SETTLED_STATUSES = new Set([
  "ORDER_FROZEN",
  "ORDER_SETTLED",
  "ORDER_UNLOCKED",
  "REDEEMED_ON_EVM",
  "REDEEMED_ON_APTOS",
  "SETTLED_ON_SOLANA",
  "REDEEMED_ON_EVM_WITH_FEE",
  "REDEEMED_ON_EVM_WITH_LOCKED_FEE",
  "REDEEMED_ON_SOL_WITH_FEE",
  "REDEEMED_ON_SOL_WITH_LOCKED_FEE",
  "REDEEMED_ON_SUI_WITH_FEE",
  "REDEEMED_ON_SUI_WITH_LOCKED_FEE",
  "MCTP_FEE_UNLOCKED",
  "SETTLED_ON_SOLANA_MCTP",
  "SWAPPED_ON_EVM_MCTP",
  "SWAPPED_ON_SUI_MCTP",
  "SWAP_LAYER_ORDER_SETTLED",
  "HC_SWIFT_ORDER_FULFILLED",
  "HC_REDEEMED_ON_ARBITRUM",
]);

/** Settled for every service except the Wormhole bridge, where the redeem leg is still pending. */
const REDEEM_PENDING_STATUSES = new Set(["REDEEM_SEQUENCE_RECEIVED", "REDEEM_VAA_SIGNED"]);
const REDEEM_PENDING_SERVICES = new Set(["WH_BRIDGE", "WH_SWAP"]);

const isSettled = (swap: MayanSwap): boolean => {
  const status = swap.status ?? "";
  const service = swap.service ?? "";

  // A Swift order carrying a HyperCore deposit is not done until that deposit lands, even though
  // the order itself reads as settled.
  const hypercoreData = swap.meta?.hypercoreData;
  if (
    (service === "SWIFT_SWAP" || service === "SWIFT_V2") &&
    hypercoreData &&
    !(hypercoreData.redeemTxHash || swap.customPayloadSettleTxHash) &&
    (status === "ORDER_SETTLED" || status === "ORDER_UNLOCKED")
  ) {
    return false;
  }

  if (REDEEM_PENDING_STATUSES.has(status)) return !REDEEM_PENDING_SERVICES.has(service);
  return SETTLED_STATUSES.has(status);
};

export type SwapSkipReason = "unsettled" | "same_chain" | "invalid_timestamp" | "unpriced" | "uncorroborated";

export type NormalizedSwap = {
  legs: SwapLeg[];
  /** Set when the swap yields no volume at all. */
  skipped?: SwapSkipReason;
  /** Chain ids with no entry in `CHAINS`, whose legs could not be attributed. */
  unmappedChainIds: string[];
  pricedFromSource: boolean;
  priceConflict: boolean;
};

const toNumber = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : null;
};

/** Value of one side of a swap, or null when its amount or price is unusable. */
const sideValueUsd = (amount: string | number | null | undefined, price: number | null | undefined): number | null => {
  const parsedAmount = toNumber(amount);
  const parsedPrice = toNumber(price);
  if (parsedAmount === null || parsedAmount <= 0) return null;
  if (parsedPrice === null || parsedPrice <= 0) return null;
  const value = parsedAmount * parsedPrice;
  return Number.isFinite(value) && value > 0 ? value : null;
};

/**
 * Both sides of a swap are worth the same money, so one value is written to both legs. The
 * destination side leads, being the more reliably priced. Neither side is authoritative on its own,
 * so where the two diverge beyond `MAX_PRICE_DIVERGENCE` the lower bound is taken rather than an
 * uncorroborated price.
 */
const resolveSwapValue = (
  swap: MayanSwap
): { valueUsd: number | null; pricedFromSource: boolean; priceConflict: boolean } => {
  const destination = sideValueUsd(swap.toAmount, swap.toTokenPrice);
  const source = sideValueUsd(swap.fromAmount, swap.fromTokenPrice);

  if (destination === null || source === null) {
    return {
      valueUsd: destination ?? source,
      pricedFromSource: destination === null && source !== null,
      priceConflict: false,
    };
  }

  const divergence = destination / source;
  const priceConflict = divergence > MAX_PRICE_DIVERGENCE || divergence < 1 / MAX_PRICE_DIVERGENCE;
  return {
    valueUsd: priceConflict ? Math.min(destination, source) : destination,
    pricedFromSource: false,
    priceConflict,
  };
};

const addressOrPlaceholder = (address: string | null | undefined): string =>
  address && address.toLowerCase() !== NULL_ADDRESS ? address : UNKNOWN_ADDRESS;

/**
 * Token totals are keyed by address without normalising case, so mixed casing splits a token in two.
 * Only a canonical EVM address is safe to fold: Sui coin types are `0x`-prefixed but their module
 * and struct names are case-sensitive (`0x2::sui::SUI`).
 */
const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/;

const normalizeToken = (address: string | null | undefined): string => {
  if (!address) return NULL_ADDRESS;
  return EVM_ADDRESS.test(address) ? address.toLowerCase() : address;
};

/**
 * Resolves a Wormhole chain id, dropping and reporting the leg when it is unknown. Failing the run
 * instead would turn any new chain into a total outage, since the table above is static.
 */
const resolveChainSlug = (chainId: string | null | undefined, unmapped: string[]): string | undefined => {
  if (!chainId) return undefined;
  const slug = chainSlugByWormholeId[chainId];
  if (!slug) unmapped.push(chainId);
  return slug;
};

export const normalizeSwap = (swap: MayanSwap): NormalizedSwap => {
  const unmappedChainIds: string[] = [];
  const sourceSlug = resolveChainSlug(swap.sourceChain, unmappedChainIds);
  const destinationSlug = resolveChainSlug(swap.destChain, unmappedChainIds);

  const empty: NormalizedSwap = { legs: [], unmappedChainIds, pricedFromSource: false, priceConflict: false };

  // Refunded, expired and in-flight swaps moved no value end to end.
  if (!isSettled(swap)) return { ...empty, skipped: "unsettled" };

  // Same-chain swaps are a DEX product, not a bridge transfer, so they are out of scope for a
  // cross-chain volume series. Compared by chain key rather than by id: HyperEVM and HyperCore carry
  // different ids but are one chain here, so value moving between them never leaves it.
  if (sourceSlug && destinationSlug && sourceSlug === destinationSlug) {
    return { ...empty, skipped: "same_chain" };
  }

  const timestamp = Date.parse(swap.initiatedAt ?? "");
  if (!Number.isFinite(timestamp) || timestamp <= 0) return { ...empty, skipped: "invalid_timestamp" };

  const { valueUsd, pricedFromSource, priceConflict } = resolveSwapValue(swap);
  // Below a cent the amount renders as "0.00", which aggregation discards outright; skipping here
  // keeps the table free of rows that can never contribute.
  if (valueUsd === null || valueUsd < 0.005) return { ...empty, skipped: "unpriced" };
  if (pricedFromSource && valueUsd > MAX_SOURCE_ONLY_USD) {
    return { ...empty, pricedFromSource, skipped: "uncorroborated" };
  }

  const amountUsd = valueUsd.toFixed(2);
  const legs: SwapLeg[] = [];

  if (sourceSlug && swap.sourceTxHash) {
    legs.push({
      chain: sourceSlug,
      originChain: null,
      txHash: swap.sourceTxHash,
      timestamp,
      from: addressOrPlaceholder(swap.trader),
      to: UNKNOWN_ADDRESS,
      token: normalizeToken(swap.fromTokenAddress),
      amountUsd,
      isDeposit: true,
    });
  }

  if (destinationSlug && swap.fulfillTxHash) {
    legs.push({
      chain: destinationSlug,
      // Aggregation prices tokens by origin chain when the address alone cannot identify one.
      originChain: sourceSlug ?? null,
      txHash: swap.fulfillTxHash,
      timestamp,
      from: UNKNOWN_ADDRESS,
      to: addressOrPlaceholder(swap.destAddress),
      token: normalizeToken(swap.toTokenAddress),
      amountUsd,
      isDeposit: false,
    });
  }

  return { legs, unmappedChainIds, pricedFromSource, priceConflict };
};

export type IngestWindow = {
  fromMs: number;
  /** The requested window reached further back than paging can, so part of it stays uncovered. */
  unreachableGap: boolean;
};

/**
 * Start of the window to ingest: an overlap behind the checkpoint, clamped to reachable depth. With
 * nothing stored there is no gap to close, so a first run simply takes the full reachable window.
 */
export const resolveIngestWindow = (checkpointMs: number | null, nowMs: number): IngestWindow => {
  const earliestReachable = nowMs - MAX_LOOKBACK_MS;
  const requested = checkpointMs ? checkpointMs - CHECKPOINT_OVERLAP_MS : earliestReachable;
  return { fromMs: Math.max(requested, earliestReachable), unreachableGap: requested < earliestReachable };
};

/** Row as stored in `bridges.transactions`. */
export type TransactionRow = {
  bridge_id: string;
  chain: string;
  tx_hash: string;
  ts: number;
  tx_block: null;
  tx_from: string;
  tx_to: string;
  token: string;
  amount: string;
  is_deposit: boolean;
  is_usd_volume: true;
  txs_counted_as: number;
  origin_chain: string | null;
};

/**
 * The table's unique key, plus `is_deposit`. The constraint itself is direction-blind, so a deposit
 * and a withdrawal that agreed on every other column would collide in Postgres; keeping them apart
 * here means the accumulator never sums two legs that represent opposite flows.
 */
const rowKey = (row: TransactionRow): string =>
  `${row.bridge_id}-${row.chain}-${row.tx_hash}-${row.token}-${row.tx_from}-${row.tx_to}-${row.is_deposit}`;

/**
 * Accumulates rows for one run, collapsing them onto the table's unique key. Swaps batched into one
 * transaction share a key and would otherwise overwrite each other, while the service split re-reads
 * swaps the first pass already saw. Keying the inner map by swap handles both: distinct swaps sum,
 * repeat sightings replace.
 */
export const createRowAccumulator = () => {
  const rows = new Map<string, { row: TransactionRow; amountsBySwap: Map<string, number> }>();

  return {
    add(row: TransactionRow, swapId: string) {
      const key = rowKey(row);
      const existing = rows.get(key);
      if (!existing) {
        rows.set(key, { row: { ...row }, amountsBySwap: new Map([[swapId, Number(row.amount)]]) });
        return;
      }
      existing.amountsBySwap.set(swapId, Number(row.amount));
      existing.row.ts = Math.max(existing.row.ts, row.ts);
    },
    get size() {
      return rows.size;
    },
    /** Rows with their per-swap values summed and the swap count carried into `txs_counted_as`. */
    drain(): TransactionRow[] {
      const drained = [...rows.values()].map(({ row, amountsBySwap }) => ({
        ...row,
        amount: [...amountsBySwap.values()].reduce((total, amount) => total + amount, 0).toFixed(2),
        txs_counted_as: amountsBySwap.size,
      }));
      rows.clear();
      return drained;
    },
  };
};

/** A slice of the feed to walk: one source chain, optionally narrowed to a single service. */
export type Partition = { fromChain: string; service?: string };

export const partitionLabel = ({ fromChain, service }: Partition): string =>
  service ? `${fromChain}/${service}` : fromChain;

const explorerUrl = (): string => process.env.MAYAN_EXPLORER_URL || DEFAULT_EXPLORER_URL;

export const buildSwapsUrl = (partition: Partition, offset: number, baseUrl = explorerUrl()): string => {
  const url = new URL(baseUrl);
  url.searchParams.set("fromChain", partition.fromChain);
  if (partition.service) url.searchParams.set("service", partition.service);
  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("format", "raw");
  return url.toString();
};

const retryDelayMs = (attempt: number): number => Math.min(RETRY_BASE_MS * 2 ** attempt, RETRY_MAX_MS);

type RetryableResponse = { headers?: { get?: (name: string) => string | null } };

const retryAfterMs = (response: RetryableResponse, attempt: number): number => {
  const retryAfter = Number(response.headers?.get?.("retry-after"));
  // Clamped: an hour-long Retry-After would park the partition well past the job's own budget.
  return Number.isFinite(retryAfter) && retryAfter > 0
    ? Math.min(retryAfter * 1000, RETRY_MAX_MS)
    : retryDelayMs(attempt);
};

const fetchPage = async (
  partition: Partition,
  offset: number,
  signal?: AbortSignal,
  fetchImpl: typeof fetch = fetch
): Promise<MayanSwap[]> => {
  const url = buildSwapsUrl(partition, offset);

  for (let attempt = 0; attempt <= REQUEST_RETRIES; attempt++) {
    throwIfAborted(signal);
    try {
      // Cast: @types/node-fetch declares its own AbortSignal, structurally older than the DOM one.
      const response = await fetchImpl(url, { timeout: REQUEST_TIMEOUT_MS, signal } as any);
      if (response.ok) {
        const body: any = await response.json();
        if (!Array.isArray(body?.data)) {
          throw new NonRetryableError(`Mayan explorer returned an unexpected payload for ${url}`);
        }
        return body.data as MayanSwap[];
      }

      await response.text().catch(() => {}); // release the socket before retrying
      const isTransient = response.status === 429 || response.status >= 500;
      if (!isTransient) {
        throw new NonRetryableError(`Mayan explorer responded ${response.status} for ${url}`);
      }
      if (attempt === REQUEST_RETRIES) {
        throw new Error(`Mayan explorer responded ${response.status} for ${url} after ${attempt + 1} attempts`);
      }
      const delay = retryAfterMs(response, attempt);
      console.warn(`[mayan] HTTP ${response.status} for ${url}; retrying in ${Math.round(delay / 1000)}s`);
      await waitWithSignal(delay, signal);
    } catch (error) {
      if (error instanceof NonRetryableError || isAbortError(error)) throw error;
      if (attempt === REQUEST_RETRIES) throw error;
      const delay = retryDelayMs(attempt);
      console.warn(
        `[mayan] ${(error as any)?.type ?? (error as Error)?.name ?? "network"} error for ${url}; ` +
          `retrying in ${Math.round(delay / 1000)}s (${attempt + 1}/${REQUEST_RETRIES})`
      );
      await waitWithSignal(delay, signal);
    }
  }

  throw new Error(`Mayan explorer paging exhausted its retries for ${url}`);
};

export type PagingResult = {
  partition: Partition;
  pages: number;
  swaps: number;
  /**
   * The offset cap was reached while swaps were still newer than the window start, so the partition
   * covers only part of the window and has to be split further.
   */
  truncated: boolean;
  /** The run's time budget ran out mid-walk, so this partition is only partly read. */
  expired: boolean;
  oldestSeen: number | null;
};

/**
 * The explorer offers no time filter without a privileged pass, so a window is covered by walking
 * the newest-first feed until it predates `fromMs`. Because the offset cap applies per query, the
 * walk is partitioned: one query per source chain, and a busy chain split again by service.
 */
export const forEachPage = async (
  partition: Partition,
  fromMs: number,
  onPage: (swaps: MayanSwap[]) => Promise<void>,
  signal?: AbortSignal,
  fetchImpl: typeof fetch = fetch,
  isExpired: () => boolean = () => false
): Promise<PagingResult> => {
  let offset = 0;
  let pages = 0;
  let swaps = 0;
  let oldestSeen: number | null = null;
  const result = (truncated: boolean, expired = false): PagingResult => ({
    partition,
    pages,
    swaps,
    truncated,
    expired,
    oldestSeen,
  });

  while (true) {
    throwIfAborted(signal);
    // A partition can outlive the job's budget on its own, so the deadline is checked between pages
    // rather than only on entry.
    if (isExpired()) return result(false, true);
    const page = await fetchPage(partition, offset, signal, fetchImpl);
    pages++;
    if (page.length === 0) return result(false);

    swaps += page.length;
    await onPage(page);

    const timestamps = page
      .map((swap) => Date.parse(swap.initiatedAt ?? ""))
      .filter((timestamp) => Number.isFinite(timestamp) && timestamp > 0);
    const oldestOnPage = timestamps.length ? Math.min(...timestamps) : null;
    if (oldestOnPage !== null && (oldestSeen === null || oldestOnPage < oldestSeen)) oldestSeen = oldestOnPage;

    const reachedWindowStart = oldestOnPage !== null && oldestOnPage < fromMs;
    if (reachedWindowStart || page.length < PAGE_SIZE) return result(false);

    offset += PAGE_SIZE;
    if (offset > MAX_OFFSET) return result(true);
  }
};

/**
 * Chain set this bridge reports on, mirroring the Mayan entry in bridgeNetworkData. `runMayan` does
 * the fetching, so these exist only to declare the chains that need a `bridges.config` row. They
 * throw rather than return data: the generic runner must never reach them while "mayan" is in
 * `bridgesToSkip` (src/utils/bridgePolicy.ts), and if it ever does the reason should be legible.
 */
const notRunnable = (chain: string) => async (): Promise<EventData[]> => {
  throw new Error(
    `Mayan is ingested by the runMayan handler, so its adapter cannot fetch ${chain}. ` +
      `Keep "mayan" in bridgesToSkip.`
  );
};

const adapter: BridgeAdapter = Object.fromEntries(CHAINS.map((chain) => [chain.slug, notRunnable(chain.slug)]));

export default adapter;
