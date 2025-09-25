import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import fetch from "node-fetch";
import { EventData } from "../../utils/types";
import { RelayRequestsResponse } from "./types";
import { ethers } from "ethers";
const retry = require("async-retry");

const requestQueues = new Map<string, Promise<any>>();

enum ApiErrorType {
  NETWORK = "network",
  API_LIMIT = "api_limit",
  DATA_PARSING = "data_parsing",
  UNKNOWN = "unknown",
}

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

const parseUsdAmount = (amountUsd?: string): ethers.BigNumber => {
  if (!amountUsd) return ethers.BigNumber.from(0);

  const parsed = parseFloat(amountUsd);
  if (isNaN(parsed) || parsed <= 0) return ethers.BigNumber.from(0);

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
  continuation?: string
): Promise<RelayRequestsResponse> => {
  let url = `https://api.relay.link/requests/v2?startTimestamp=${startTimestamp}&endTimestamp=${endTimestamp}&limit=50&referrer=`;
  if (continuation) url = `${url}&continuation=${continuation}`;

  return retry(
    async () => {
      const response = await fetch(url, { timeout: 30000 });
      if (!response.ok) {
        const errorType =
          response.status === 429
            ? ApiErrorType.API_LIMIT
            : response.status >= 500
              ? ApiErrorType.NETWORK
              : ApiErrorType.UNKNOWN;
        const error = new Error(
          `[${errorType}] HTTP ${response.status} for ts ${startTimestamp}-${endTimestamp}`
        );
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          (error as any).name = "NoRetryError";
        }
        throw error;
      }
      return response.json();
    },
    {
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 10000,
      randomize: true,
      onRetry: (error: any) => {
        if (error.name === "NoRetryError") throw error;
      },
    }
  );
};

const rateLimitedFetchByTime = async (
  startTimestamp: number,
  endTimestamp: number,
  continuation?: string
): Promise<RelayRequestsResponse> => {
  const delay = continuation ? 500 : 200;
  const queueKey = `${startTimestamp}:${endTimestamp}`;
  const lastRequest = requestQueues.get(queueKey) || Promise.resolve();
  const currentRequest = lastRequest
    .then(() => new Promise((resolve) => setTimeout(resolve, delay)))
    .then(() => fetchRequestsByTime(startTimestamp, endTimestamp, continuation));
  requestQueues.set(queueKey, currentRequest);
  return currentRequest;
};


export const forEachRequestsByTimePage = async (
  startTimestamp: number,
  endTimestamp: number,
  onPage: (requests: NonNullable<RelayRequestsResponse["requests"]>) => Promise<void> | void
): Promise<void> => {
  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 3;
  console.log(`Streaming requests for ts ${startTimestamp}-${endTimestamp}`);

  try {
    const first = await rateLimitedFetchByTime(startTimestamp, endTimestamp);
    const firstPage = first.requests ?? [];
    if (firstPage.length) {
      await onPage(firstPage);
    } else {
      console.log(`No requests in first page for ts ${startTimestamp}-${endTimestamp}`);
    }

    let continuation = first.continuation;
    let pageCount = firstPage.length ? 1 : 0;
    let totalRequests = firstPage.length;
    const maxPages = 1000;

    while (continuation !== undefined && pageCount < maxPages) {
      try {
        const page = await rateLimitedFetchByTime(startTimestamp, endTimestamp, continuation);
        continuation = page.continuation;
        const reqs = page.requests ?? [];
        if (reqs.length) await onPage(reqs);
        pageCount += 1;
        totalRequests += reqs.length;
        consecutiveErrors = 0;
      } catch (error) {
        consecutiveErrors++;
        console.error(
          `Pagination error ${consecutiveErrors}/${maxConsecutiveErrors} while streaming ts ${startTimestamp}-${endTimestamp}:`,
          error
        );
        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.error(`Circuit breaker activated after ${consecutiveErrors} consecutive errors`);
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, consecutiveErrors) * 1000));
      }
    }

    if (pageCount >= maxPages && continuation) {
      console.warn(`Hit pagination page limit for ts ${startTimestamp}-${endTimestamp}. Some data may be missing.`);
    }
  } catch (error) {
    console.error(`Critical error streaming requests for ts ${startTimestamp}-${endTimestamp}:`, error);
  }
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
  hychain: 2911,
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
};

export const chainIdToSlug: Record<number, string> = Object.fromEntries(
  Object.entries(slugToChainId).map(([slug, id]) => [id, slug])
) as Record<number, string>;

const adapter = Object.fromEntries(
  Object.entries(slugToChainId).map(([slug, id]) => [slug, true])
) as any

export default adapter;
