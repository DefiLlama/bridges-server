import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import fetch from "node-fetch";
import { EventData } from "../../utils/types";
import { RelayRequestsResponse } from "./types";
import { ethers } from "ethers";
import {
  isAbortError,
  isNonRetryableError,
  NonRetryableError,
  throwIfAborted,
  waitWithSignal,
} from "../../utils/errors";

let requestQueue: Promise<void> = Promise.resolve();

const PAGE_LIMIT = 50;
const REQUEST_RETRIES = 8;
const REQUEST_BASE_RETRY_MS = 5_000;
const REQUEST_MAX_RETRY_MS = 60_000;
const REQUEST_TIMEOUT_MS = 60_000;
const REQUEST_INTERVAL_MS = 250;
const MAX_PAGES_PER_WINDOW = 5_000;

/**
 * Relay is a cross-chain payments system that enables low cost instant bridging and cross-chain execution.
 * Contract addresses: https://docs.relay.link/resources/contract-addresses
 *
 */

const startingBlocks: Record<string, number> = {
  1: 18976112,
  10: 114647896,
  56: 39739873,
  100: 33619680,
  137: 55172593,
  185: 3417903,
  288: 2353048,
  324: 25006838,
  360: 2691201,
  480: 3466510,
  690: 254553,
  1101: 12491343,
  1135: 761002,
  1329: 118912096,
  2741: 4116,
  2911: 2136055,
  4321: 138647,
  5000: 72911632,
  5112: 1462668,
  7560: 896262,
  8333: 144055,
  8453: 9046270,
  17071: 58343,
  33139: 636958,
  33979: 238923,
  34443: 7297896,
  42161: 169028419,
  42170: 38963884,
  43114: 44583244,
  55244: 30,
  57073: 275058,
  59144: 1814719,
  60808: 275964,
  70700: 19,
  70701: 1543,
  81457: 216675,
  534352: 5560094,
  543210: 1282,
  660279: 4759873,
  984122: 2655107,
  7777777: 9094029,
  8253038: 865885,
  666666666: 1310814,
  792703809: 279758248,
  888888888: 1278785,
  1380012617: 205727,
};

const MAX_USD_AMOUNT = 10_000_000;
const getRetryDelay = (response: any, attempt: number) => {
  const retryAfter = Number(response.headers?.get?.("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) return retryAfter * 1000;
  return Math.min(REQUEST_BASE_RETRY_MS * 2 ** attempt, REQUEST_MAX_RETRY_MS);
};

export const makeRequestsUrl = (
  startTimestamp: number,
  endTimestamp: number,
  continuation?: string,
  chainId?: number
) => {
  const params = new URLSearchParams({
    startTimestamp: String(startTimestamp),
    endTimestamp: String(endTimestamp),
    limit: String(PAGE_LIMIT),
    referrer: "",
    sortBy: "updatedAt",
    sortDirection: "asc",
  });
  if (continuation) params.set("continuation", continuation);
  if (chainId !== undefined) params.set("chainId", String(chainId));
  return `https://api.relay.link/requests/v2?${params.toString()}`;
};

export const parseRelayRequestsResponse = (data: unknown): RelayRequestsResponse => {
  if (!data || typeof data !== "object" || !Array.isArray((data as RelayRequestsResponse).requests)) {
    throw new NonRetryableError("Relay API returned a response without a requests array.");
  }
  const response = data as RelayRequestsResponse;
  const continuation = response.continuation;
  if (continuation !== undefined && typeof continuation !== "string") {
    throw new NonRetryableError("Relay API returned a non-string continuation token.");
  }

  for (const [index, request] of response.requests!.entries()) {
    if (!request || typeof request !== "object" || Array.isArray(request)) {
      throw new NonRetryableError(`Relay API returned an invalid request at index ${index}.`);
    }
    if (typeof request.id !== "string" || request.id.trim().length === 0) {
      throw new NonRetryableError(`Relay API returned a request without an id at index ${index}.`);
    }
    if (
      typeof request.updatedAt !== "string" ||
      request.updatedAt.trim().length === 0 ||
      !Number.isFinite(Date.parse(request.updatedAt))
    ) {
      throw new NonRetryableError(`Relay API returned a request with an invalid updatedAt at index ${index}.`);
    }
    if (
      request.data !== undefined &&
      (!request.data || typeof request.data !== "object" || Array.isArray(request.data))
    ) {
      throw new NonRetryableError(`Relay API returned a request with invalid data at index ${index}.`);
    }
  }

  return response;
};

const parseUsdAmount = (amountUsd?: string): ethers.BigNumber => {
  if (!amountUsd) return ethers.BigNumber.from(0);

  const parsed = parseFloat(amountUsd);
  if (isNaN(parsed) || parsed <= 0) return ethers.BigNumber.from(0);

  if (parsed > MAX_USD_AMOUNT) {
    console.warn(`[relay] Skipping suspicious USD amount: ${parsed}`);
    return ethers.BigNumber.from(0);
  }

  return ethers.BigNumber.from(Math.round(parsed));
};

export const convertRequestToEvent = (
  request: NonNullable<RelayRequestsResponse["requests"]>["0"]
): { deposit?: EventData; withdraw?: EventData; depositChainId?: number; withdrawChainId?: number } => {
  const deposit = request.data?.metadata?.currencyIn;
  const withdraw = request.data?.metadata?.currencyOut;

  const depositTx = request.data?.inTxs?.[0];
  const withdrawTx = request.data?.outTxs?.[0];

  const depositAmount = parseUsdAmount(deposit?.amountUsd);
  const withdrawAmount = parseUsdAmount(withdraw?.amountUsd);

  // Improved timestamp fallback chain for consistency
  const getTimestamp = (tx: any, fallback?: any, request?: any) => {
    // 1. Primary: transaction timestamp (in seconds, convert to ms)
    if (tx?.timestamp) return tx.timestamp * 1000;

    // 2. Fallback: other transaction timestamp
    if (fallback?.timestamp) return fallback.timestamp * 1000;

    // 3. Fallback: request creation time (ISO string)
    if (request?.createdAt) return new Date(request.createdAt).getTime();

    // 4. Fallback: request update time
    if (request?.updatedAt) return new Date(request.updatedAt).getTime();

    // 5. Last resort: current time (shouldn't happen in production)
    return Date.now();
  };

  return {
    depositChainId: depositTx?.chainId,
    deposit:
      depositTx && depositTx.data && deposit && depositAmount.gt(0)
        ? {
            blockNumber: depositTx.block!,
            txHash: depositTx.hash as string,
            timestamp: getTimestamp(depositTx, withdrawTx, request),
            from: (depositTx.data as any).from
              ? (depositTx.data as any).from
              : depositTx.data
              ? (depositTx.data as any).signer
              : undefined,
            to: (depositTx.data as any).to
              ? (depositTx.data as any).to
              : withdrawTx?.data
              ? (withdrawTx.data as any).signer
              : undefined,
            token: deposit?.currency?.address!,
            amount: depositAmount,
            isDeposit: true,
            isUSDVolume: true,
          }
        : undefined,
    withdrawChainId: withdrawTx?.chainId,
    withdraw:
      withdrawTx && withdrawTx.data && withdraw && withdrawAmount.gt(0)
        ? {
            blockNumber: withdrawTx.block!,
            txHash: withdrawTx.hash!,
            timestamp: getTimestamp(withdrawTx, depositTx, request),
            from: (withdrawTx.data as any).from
              ? (withdrawTx.data as any).from
              : withdrawTx.data
              ? (withdrawTx.data as any).signer
              : undefined,
            to: (withdrawTx.data as any).to ? (withdrawTx.data as any).to : request.data?.metadata?.recipient,
            token: withdraw?.currency?.address!,
            amount: withdrawAmount,
            isDeposit: false,
            isUSDVolume: true,
          }
        : undefined,
  };
};

const fetchRequestsByTime = async (
  startTimestamp: number,
  endTimestamp: number,
  continuation?: string,
  chainId?: number,
  signal?: AbortSignal
): Promise<RelayRequestsResponse> => {
  const apiKey = process.env.RELAY_API_KEY;
  if (!apiKey) throw new Error("RELAY_API_KEY is required for Relay adapter requests.");

  const url = makeRequestsUrl(startTimestamp, endTimestamp, continuation, chainId);

  for (let attempt = 0; attempt <= REQUEST_RETRIES; attempt++) {
    throwIfAborted(signal);
    try {
      const response = await fetch(url, {
        timeout: REQUEST_TIMEOUT_MS,
        headers: { "x-api-key": apiKey },
        signal,
      });

      if (response.ok) return parseRelayRequestsResponse(await response.json());

      const retryable = response.status === 429 || response.status >= 500;
      const body = await response.text().catch(() => "");
      if (!retryable || attempt === REQUEST_RETRIES) {
        const error: any = new Error(
          `Relay API failed for ${startTimestamp}-${endTimestamp} continuation=${continuation ?? "first"}: ` +
            `HTTP ${response.status} ${body}`
        );
        error.retryable = retryable;
        throw error;
      }

      const delay = getRetryDelay(response, attempt);
      console.warn(
        `[relay] HTTP ${response.status}; retrying in ${Math.round(delay / 1000)}s ` +
          `(${attempt + 1}/${REQUEST_RETRIES}) for ts ${startTimestamp}-${endTimestamp}`
      );
      await waitWithSignal(delay, signal);
    } catch (error: any) {
      if (isAbortError(error) || signal?.aborted) throw error;
      if (isNonRetryableError(error) || error?.retryable === false || attempt === REQUEST_RETRIES) throw error;
      const delay = Math.min(REQUEST_BASE_RETRY_MS * 2 ** attempt, REQUEST_MAX_RETRY_MS);
      console.warn(
        `[relay] ${error?.type ?? error?.name ?? "network"} error; retrying in ` +
          `${Math.round(delay / 1000)}s (${attempt + 1}/${REQUEST_RETRIES}) for ts ${startTimestamp}-${endTimestamp}`
      );
      await waitWithSignal(delay, signal);
    }
  }

  throw new Error("Unreachable Relay retry state.");
};

const rateLimitedFetchByTime = async (
  startTimestamp: number,
  endTimestamp: number,
  continuation?: string,
  chainId?: number,
  signal?: AbortSignal
): Promise<RelayRequestsResponse> => {
  const currentRequest = requestQueue
    .catch(() => {})
    .then(() => waitWithSignal(REQUEST_INTERVAL_MS, signal))
    .then(() => fetchRequestsByTime(startTimestamp, endTimestamp, continuation, chainId, signal));
  requestQueue = currentRequest.then(
    () => undefined,
    () => undefined
  );
  return currentRequest;
};

export const forEachRequestsByTimePage = async (
  startTimestamp: number,
  endTimestamp: number,
  onPage: (requests: NonNullable<RelayRequestsResponse["requests"]>) => Promise<void> | void,
  chainId?: number,
  signal?: AbortSignal
): Promise<{ pages: number; requests: number }> => {
  console.log(`Streaming requests for ts ${startTimestamp}-${endTimestamp}`);

  let continuation: string | undefined;
  let pageCount = 0;
  let totalRequests = 0;
  const seenContinuations = new Set<string>();

  do {
    throwIfAborted(signal);
    const page = await rateLimitedFetchByTime(startTimestamp, endTimestamp, continuation, chainId, signal);
    const nextContinuation = page.continuation || undefined;
    if (nextContinuation) {
      if (seenContinuations.has(nextContinuation)) {
        throw new Error(
          `Relay pagination repeated continuation ${nextContinuation} for ts ${startTimestamp}-${endTimestamp}.`
        );
      }
      seenContinuations.add(nextContinuation);
    }
    continuation = nextContinuation;
    const reqs = page.requests ?? [];

    pageCount += 1;
    totalRequests += reqs.length;
    if (reqs.length) {
      await onPage(reqs);
    } else if (pageCount === 1) {
      console.log(`No requests in first page for ts ${startTimestamp}-${endTimestamp}`);
    }

    if (pageCount >= MAX_PAGES_PER_WINDOW && continuation) {
      throw new Error(`Hit Relay pagination page limit for ts ${startTimestamp}-${endTimestamp}.`);
    }
  } while (continuation);

  console.log(`Processed ${totalRequests} requests across ${pageCount} pages for ts ${startTimestamp}-${endTimestamp}`);
  return { pages: pageCount, requests: totalRequests };
};

export const slugToChainId: Record<string, number> = {
  ethereum: 1,
  optimism: 10,
  bsc: 56,
  gnosis: 100,
  polygon: 137,
  mint: 185,
  boba: 288,
  zksync: 324,
  shape: 360,
  "world-chain": 480,
  redstone: 690,
  "polygon-zkevm": 1101,
  lisk: 1135,
  sei: 1329,
  hyperliquid: 1337,
  hychain: 2911,
  ronin: 2020,
  somnia: 5031,
  mantle: 5000,
  ham: 5112,
  cyber: 7560,
  B3: 8333,
  base: 8453,
  arbitrum: 42161,
  "arbitrum-nova": 42170,
  avalanche: 43114,
  superposition: 55244,
  linea: 59144,
  bob: 60808,
  apex: 70700,
  boss: 70701,
  blast: 81457,
  scroll: 534352,
  "zero-network": 543210,
  xai: 660279,
  forma: 984122,
  solana: 792703809,
  ancient8: 888888888,
  rari: 1380012617,
  bitcoin: 8253038,
  degen: 666666666,
  funki: 33979,
  mode: 34443,
  "proof-of-play": 70700,
  "proof-of-play-boss": 70701,
  katana: 747474,
  monad: 143,
  robinhood: 4663,
};

export const chainIdToSlug: Record<number, string> = Object.fromEntries(
  Object.entries(slugToChainId).map(([slug, id]) => [id, slug])
) as Record<number, string>;

const adapter = Object.fromEntries(Object.entries(slugToChainId).map(([slug, _id]) => [slug, true])) as any;

export default adapter;
