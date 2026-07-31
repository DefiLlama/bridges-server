import fetch from "node-fetch";
import { ethers } from "ethers";
import { EventData } from "../../utils/types";
import {
  isAbortError,
  isNonRetryableError,
  NonRetryableError,
  throwIfAborted,
  waitWithSignal,
} from "../../utils/errors";

// Pages Layerswap's public explorer feed and turns each completed swap into a deposit (source leg) +
// withdraw (dest leg), priced in USD. Fetch/store runs in the dedicated `runLayerswap` handler.
const DEFAULT_EXPLORER_URL = "https://api.layerswap.io/api/v2/explorer";
const PAGE_SIZE = 200;
const MAX_PAGES = 1000;
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

// Layerswap API network name -> bridges-server chain key.
export const networkNameToSlug: Record<string, string> = {
  ETHEREUM_MAINNET: "ethereum",
  ARBITRUM_MAINNET: "arbitrum",
  ARBITRUMNOVA_MAINNET: "arbitrum nova",
  OPTIMISM_MAINNET: "optimism",
  BASE_MAINNET: "base",
  LINEA_MAINNET: "linea",
  BLAST_MAINNET: "blast",
  SCROLL_MAINNET: "scroll",
  BSC_MAINNET: "bsc",
  XLAYER_MAINNET: "xlayer",
  TAIKO_MAINNET: "taiko",
  ZKSYNCERA_MAINNET: "zksync era",
  MODE_MAINNET: "mode",
  MANTA_MAINNET: "manta",
  POLYGONZK_MAINNET: "polygon zkevm",
  POLYGON_MAINNET: "polygon",
  AVAX_MAINNET: "avalanche",
  OPBNB_MAINNET: "opbnb",
  GRAVITY_MAINNET: "gravity",
  BOB_MAINNET: "bob",
  MANTLE_MAINNET: "mantle",
  ZORA_MAINNET: "zora",
  FRAXTAL_MAINNET: "fraxtal",
  FUSE_MAINNET: "fuse",
  GNOSIS_MAINNET: "gnosis",
  ANCIENT8_MAINNET: "ancient8",
  CELO_MAINNET: "celo",
  IMMUTABLEZK_MAINNET: "immutable zkevm",
  KAIA_MAINNET: "kaia",
  LISK_MAINNET: "lisk",
  RARI_MAINNET: "rari",
  SHAPE_MAINNET: "shape",
  SUPERSEED_MAINNET: "superseed",
  WORLDCHAIN_MAINNET: "wc",
  XAI_MAINNET: "xai",
  ZIRCUIT_MAINNET: "zircuit",
  SEI_MAINNET: "sei",
  ZEROG_MAINNET: "0g",
  ABSTRACT_MAINNET: "abstract",
  BERACHAIN_MAINNET: "berachain",
  FLARE_MAINNET: "flare",
  HYPEREVM_MAINNET: "hyperliquid",
  INK_MAINNET: "ink",
  KATANA_MAINNET: "katana",
  LIGHTLINK_MAINNET: "lightlink",
  MEGAETH_MAINNET: "megaeth",
  MONAD_MAINNET: "monad",
  MORPH_MAINNET: "morph",
  PLASMA_MAINNET: "plasma",
  ROBINHOOD_MAINNET: "robinhood",
  RONIN_MAINNET: "ronin",
  ROOTSTOCK_MAINNET: "rootstock",
  SONEIUM_MAINNET: "soneium",
  SONIC_MAINNET: "sonic",
  SOPHON_MAINNET: "sophon",
  SUPERPOSITION_MAINNET: "superposition",
  STABLE_MAINNET: "stable",
  TELOS_MAINNET: "telos",
  TEMPO_MAINNET: "tempo",
  UNICHAIN_MAINNET: "unichain",
  BITCOIN_MAINNET: "bitcoin",
  SOLANA_MAINNET: "solana",
  ECLIPSE_MAINNET: "eclipse",
  STARKNET_MAINNET: "starknet",
  PARADEX_MAINNET: "paradex",
  TON_MAINNET: "ton",
  TRON_MAINNET: "tron",
  HYPERLIQUID_MAINNET: "hyperliquid",
  FUEL_MAINNET: "fuel",
};

type FeedToken = { contract: string | null };
type FeedTx = {
  type: string;
  transaction_hash: string | null;
  timestamp?: string | null;
  amount: number;
  amount_in_usd?: number | null;
  from?: string | null;
  to?: string | null;
};
type FeedSwap = {
  swap: {
    id: string;
    created_date: string;
    close_date: string;
    source_network: { name: string };
    source_token: FeedToken;
    destination_network: { name: string };
    destination_token: FeedToken;
    metadata: { sequence_number: number };
    transactions: FeedTx[];
  };
};

// Whole-dollar USD, paired with isUSDVolume. Matches relay/cashmere, which round the same way.
// Note the consequence: a leg under $0.50 rounds to zero, and both the caller below and
// aggregation discard zero-amount rows, so it is dropped entirely - losing its tx count as well
// as its (negligible) volume. Measured at ~2.4% of legs. Deliberate and conservative.
const roundUsd = (value: number): ethers.BigNumber => {
  if (!isFinite(value) || value <= 0) return ethers.BigNumber.from(0);
  return ethers.BigNumber.from(Math.round(value));
};

const legUsd = (tx: FeedTx | undefined): ethers.BigNumber => {
  if (!tx) return ethers.BigNumber.from(0);
  if (tx.amount_in_usd != null) return roundUsd(tx.amount_in_usd);
  return ethers.BigNumber.from(0);
};

// Real address from the feed, or "0x" if missing/zero (aggregation drops zero-address rows).
const cleanAddr = (addr?: string | null): string => (addr && addr.toLowerCase() !== NULL_ADDRESS ? addr : "0x");

const parseTimestamp = (...values: Array<string | null | undefined>): number => {
  for (const value of values) {
    if (!value) continue;
    const timestamp = new Date(value).getTime();
    if (Number.isFinite(timestamp) && timestamp > 0) return timestamp;
  }
  return NaN;
};

export const convertSwapToEvent = (
  item: FeedSwap
): { deposit?: EventData; withdraw?: EventData; depositChain?: string; withdrawChain?: string } => {
  const s = item.swap;
  const input = s.transactions?.find((t) => t.type === "input" && t.transaction_hash);
  const output = s.transactions?.find((t) => t.type === "output" && t.transaction_hash);
  // Each leg carries its own on-chain time (relay does the same). The feed is paged by close_date,
  // so a slow swap inserts a deposit row older than the window `aggregateAll` rebuilds (36h) and
  // that leg is never counted. Measured: p50 18s, p90 47s, but 0.1% of swaps exceed 36h (~2/day,
  // ~0.05% of volume, tail up to 30 days). Accepted rather than tracking and re-aggregating buckets.
  const depositTimestamp = parseTimestamp(input?.timestamp, s.created_date);
  const withdrawTimestamp = parseTimestamp(output?.timestamp, s.close_date, s.created_date);
  const depositChain = networkNameToSlug[s.source_network?.name];
  const withdrawChain = networkNameToSlug[s.destination_network?.name];
  const depositUsd = legUsd(input);
  const withdrawUsd = legUsd(output);

  return {
    depositChain,
    withdrawChain,
    deposit:
      input && depositChain && Number.isFinite(depositTimestamp) && depositUsd.gt(0)
        ? {
            blockNumber: 0,
            txHash: input.transaction_hash!,
            timestamp: depositTimestamp,
            from: cleanAddr(input.from),
            to: cleanAddr(input.to),
            token: s.source_token?.contract ?? NULL_ADDRESS,
            amount: depositUsd,
            isDeposit: true,
            isUSDVolume: true,
          }
        : undefined,
    withdraw:
      output && withdrawChain && Number.isFinite(withdrawTimestamp) && withdrawUsd.gt(0)
        ? {
            blockNumber: 0,
            txHash: output.transaction_hash!,
            timestamp: withdrawTimestamp,
            from: cleanAddr(output.from),
            to: cleanAddr(output.to),
            token: s.destination_token?.contract ?? NULL_ADDRESS,
            amount: withdrawUsd,
            isDeposit: false,
            isUSDVolume: true,
          }
        : undefined,
  };
};

const REQUEST_RETRIES = 5;
const REQUEST_TIMEOUT_MS = 30_000;
const REQUEST_BASE_RETRY_MS = 2_000;
const REQUEST_MAX_RETRY_MS = 30_000;

const backoffMs = (attempt: number): number => Math.min(REQUEST_BASE_RETRY_MS * 2 ** attempt, REQUEST_MAX_RETRY_MS);

// Retry-After (429) if the server sends it, otherwise exponential backoff.
const getRetryDelay = (res: any, attempt: number): number => {
  const retryAfter = Number(res?.headers?.get?.("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) return retryAfter * 1000;
  return backoffMs(attempt);
};

const getExplorerUrl = (): string => process.env.LAYERSWAP_EXPLORER_URL || DEFAULT_EXPLORER_URL;

export const buildExplorerUrl = (startingAfter?: string, explorerUrl = getExplorerUrl()): string => {
  const url = new URL(explorerUrl);
  url.searchParams.set("statuses", "1");
  url.searchParams.set("compact", "true");
  url.searchParams.set("limit", String(PAGE_SIZE));
  if (startingAfter) url.searchParams.set("starting_after", startingAfter);
  return url.toString();
};

export const fetchPage = async (
  startingAfter?: string,
  signal?: AbortSignal,
  fetchImpl: typeof fetch = fetch
): Promise<FeedSwap[]> => {
  const url = buildExplorerUrl(startingAfter);

  for (let attempt = 0; attempt <= REQUEST_RETRIES; attempt++) {
    throwIfAborted(signal);
    try {
      const res = await fetchImpl(url, { timeout: REQUEST_TIMEOUT_MS, signal });
      if (res.ok) {
        const json: any = await res.json();
        if (!Array.isArray(json?.data)) {
          throw new NonRetryableError(`Layerswap explorer returned invalid data for ${url}`);
        }
        return json.data as FeedSwap[];
      }
      await res.text().catch(() => {}); // drain body so the socket is freed before retrying
      // Retry rate-limits (429) and server errors (5xx); a 4xx is a client error, so fail fast.
      if (!(res.status === 429 || res.status >= 500)) {
        throw new NonRetryableError(`Layerswap explorer HTTP ${res.status} for ${url}`);
      }
      if (attempt === REQUEST_RETRIES) throw new Error(`Layerswap explorer HTTP ${res.status} for ${url}`);
      await waitWithSignal(getRetryDelay(res, attempt), signal);
    } catch (err: any) {
      // An abort is a cancellation, not a transient failure - retrying it would defeat the signal.
      if (isAbortError(err) || signal?.aborted) throw err;
      if (isNonRetryableError(err) || attempt === REQUEST_RETRIES) throw err;
      await waitWithSignal(backoffMs(attempt), signal);
    }
  }
  throw new Error(`Layerswap explorer: exhausted retries for ${url}`);
};

type SwapPaginationResult = {
  pages: number;
  swaps: number;
  stopReason: "empty" | "close-date-cutoff";
};

// Discovers the completion feed newest -> oldest, then hands pages to the caller oldest -> newest.
// Committing in that order keeps a transaction-derived checkpoint behind any work left after a crash.
export const forEachSwapPage = async (
  sinceCloseTs: number,
  onPage: (swaps: FeedSwap[]) => Promise<void>,
  signal?: AbortSignal,
  fetchImpl: typeof fetch = fetch
): Promise<SwapPaginationResult> => {
  let cursor: string | undefined;
  let pages = 0;
  let totalSwaps = 0;
  const pendingPages: FeedSwap[][] = [];
  let result: SwapPaginationResult | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    throwIfAborted(signal);
    const swaps = await fetchPage(cursor, signal, fetchImpl);
    if (!swaps.length) {
      result = { pages, swaps: totalSwaps, stopReason: "empty" };
      break;
    }

    const closeTimestamps = swaps.map((x) => parseTimestamp(x.swap?.close_date));
    if (closeTimestamps.some((timestamp) => !Number.isFinite(timestamp))) {
      throw new NonRetryableError(`Layerswap explorer page after ${cursor ?? "start"} contains an invalid close_date`);
    }

    pendingPages.push(swaps);
    pages += 1;
    totalSwaps += swaps.length;

    const oldestCloseTimestamp = Math.min(...closeTimestamps);
    if (oldestCloseTimestamp < sinceCloseTs) {
      result = { pages, swaps: totalSwaps, stopReason: "close-date-cutoff" };
      break;
    }

    const nextCursor = swaps[swaps.length - 1]?.swap?.id;
    if (!nextCursor) {
      throw new NonRetryableError(`Layerswap explorer page after ${cursor ?? "start"} is missing its last swap id`);
    }
    if (nextCursor === cursor) {
      throw new NonRetryableError(`Layerswap explorer cursor did not advance past ${cursor}`);
    }
    cursor = nextCursor;
  }

  // Every page is buffered before the first write, so hitting this limit discards the whole run.
  // Any bulk backfill needs its own streaming path rather than this function.
  if (!result) {
    throw new NonRetryableError(`Layerswap explorer hit the ${MAX_PAGES}-page safety limit`);
  }

  for (let page = pendingPages.length - 1; page >= 0; page--) {
    throwIfAborted(signal);
    await onPage(pendingPages[page]);
  }

  return result;
};

// Stub adapter (real work is in runLayerswap); keys are the chains we create bridges.config rows for.
// The values are `true`, not functions, so this only works because "layerswap" is in `bridgesToSkip`
// (src/utils/bridgePolicy.ts). The generic runner calls `adapter[chain](from, to, ctx)`, and a truthy
// non-function slips past its "Chain not found" guard - so un-skipping this bridge, or running
// `npm run test layerswap`, throws `adapterChainEventsFn is not a function`.
const adapter = Object.fromEntries(
  Array.from(new Set(Object.values(networkNameToSlug))).map((slug) => [slug, true])
) as any;

export default adapter;
