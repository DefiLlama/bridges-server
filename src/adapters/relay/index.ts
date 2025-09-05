import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import fetch from "node-fetch";
import { EventData } from "../../utils/types";
import { RelayRequestsResponse } from "./types";
import { ethers } from "ethers";
const retry = require("async-retry");

const requestQueues = new Map<number, Promise<any>>();

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
  130: 25000000,
  146: 1000000,
  1329: 118912096,
  1625: 100000,
  1868: 100000,
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
  43111: 100000,
  43114: 44583244,
  48900: 100000,
  55244: 30,
  57073: 275058,
  59144: 1814719,
  60808: 275964,
  70700: 19,
  70701: 1543,
  80094: 9000000,
  81457: 216675,
  98866: 100000,
  167000: 1100000,
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

const convertRequestToEvent = (
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

const fetchRequests = async (
  chainId: number,
  fromBlock: number,
  toBlock: number,
  continuation?: string
): Promise<RelayRequestsResponse> => {
  let url = `https://api.relay.link/requests/v2?chainId=${chainId}&startBlock=${fromBlock}&endBlock=${toBlock}&referrer=`;

  if (continuation) {
    url = `${url}&continuation=${continuation}`;
  }

  return retry(
    async () => {
      const response = await fetch(url, {
        timeout: 30000, // 30 second timeout
      });

      if (!response.ok) {
        const errorType =
          response.status === 429
            ? ApiErrorType.API_LIMIT
            : response.status >= 500
            ? ApiErrorType.NETWORK
            : ApiErrorType.UNKNOWN;

        const error = new Error(
          `[${errorType}] HTTP ${response.status} for chainId ${chainId}, blocks ${fromBlock}-${toBlock}`
        );

        // Don't retry 4xx errors except rate limits
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
      randomize: true, // Add jitter to prevent thundering herd
      onRetry: (error: any) => {
        // Don't retry certain errors by throwing immediately
        if (error.name === "NoRetryError") {
          throw error;
        }
      },
    }
  );
};

const rateLimitedFetch = async (
  chainId: number,
  fromBlock: number,
  toBlock: number,
  continuation?: string
): Promise<RelayRequestsResponse> => {
  // Chain-specific rate limiting with longer delays for pagination
  const delay = continuation ? 500 : 200;

  // Queue requests per chain to prevent API overload
  const lastRequest = requestQueues.get(chainId) || Promise.resolve();

  const currentRequest = lastRequest
    .then(() => new Promise((resolve) => setTimeout(resolve, delay)))
    .then(() => fetchRequests(chainId, fromBlock, toBlock, continuation));

  requestQueues.set(chainId, currentRequest);
  return currentRequest;
};

const fetchAllRequests = async (
  chainId: number,
  fromBlock: number,
  toBlock: number
): Promise<RelayRequestsResponse["requests"]> => {
  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 3;

  try {
    let allRequests: RelayRequestsResponse["requests"] = [];
    const response = await rateLimitedFetch(chainId, fromBlock, toBlock);
    allRequests = [...(response.requests ?? [])];
    consecutiveErrors = 0;

    let continuation = response.continuation;
    let requestCount = 0;
    const maxRequests = 1000;

    while (continuation !== undefined && requestCount < maxRequests) {
      try {
        const paginatedResponse = await rateLimitedFetch(chainId, fromBlock, toBlock, continuation);
        continuation = paginatedResponse.continuation;
        allRequests = [...allRequests, ...(paginatedResponse.requests ?? [])];
        requestCount++;
        consecutiveErrors = 0;
      } catch (error) {
        consecutiveErrors++;
        console.error(
          `Pagination error ${consecutiveErrors}/${maxConsecutiveErrors} for chainId ${chainId}, blocks ${fromBlock}-${toBlock}:`,
          error
        );

        // Circuit breaker: stop pagination on sustained failures
        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.error(
            `Circuit breaker activated for chainId ${chainId} after ${consecutiveErrors} consecutive errors`
          );
          break;
        }

        // Exponential backoff for errors
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, consecutiveErrors) * 1000));
      }
    }

    if (requestCount >= maxRequests && continuation) {
      console.warn(
        `Hit pagination limit for chainId ${chainId}, blocks ${fromBlock}-${toBlock}. Some data may be missing.`
      );
    }

    return allRequests;
  } catch (error) {
    console.error(`Critical error fetching requests for chainId ${chainId}, blocks ${fromBlock}-${toBlock}:`, error);
    return [];
  }
};

const constructParams = (chainId: number) => {
  return async (fromBlock: number, toBlock: number): Promise<EventData[]> => {
    const startingBlock = startingBlocks[chainId];
    if (startingBlock !== undefined && toBlock < startingBlock) {
      return [];
    }

    const requests = await fetchAllRequests(chainId, fromBlock, toBlock);
    const events: EventData[] = [];

    requests?.forEach((request) => {
      try {
        const event = convertRequestToEvent(request);
        if (event.depositChainId === chainId && event.deposit) {
          events.push(event.deposit);
        }
        if (event.withdrawChainId === chainId && event.withdraw) {
          events.push(event.withdraw);
        }
      } catch (error) {
        console.error(`Error processing request ${request.id}:`, error);
      }
    });

    return events;
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(1),
  optimism: constructParams(10),
  bsc: constructParams(56),
  gnosis: constructParams(100),
  unichain: constructParams(130),
  polygon: constructParams(137),
  sonic: constructParams(146),
  mint: constructParams(185),
  boba: constructParams(288),
  zksync: constructParams(324),
  shape: constructParams(360),
  "world-chain": constructParams(480),
  redstone: constructParams(690),
  "polygon-zkevm": constructParams(1101),
  lisk: constructParams(1135),
  sei: constructParams(1329),
  gravity: constructParams(1625),
  soneium: constructParams(1868),
  abstract: constructParams(2741),
  hychain: constructParams(2911),
  mantle: constructParams(5000),
  cyber: constructParams(7560),
  B3: constructParams(8333),
  base: constructParams(8453),
  arbitrum: constructParams(42161),
  "arbitrum-nova": constructParams(42170),
  hemi: constructParams(43111),
  avalanche: constructParams(43114),
  zircuit: constructParams(48900),
  superposition: constructParams(55244),
  linea: constructParams(59144),
  bob: constructParams(60808),
  apex: constructParams(70700),
  boss: constructParams(70701),
  berachain: constructParams(80094),
  blast: constructParams(81457),
  plume: constructParams(98866),
  taiko: constructParams(167000),
  scroll: constructParams(534352),
  "zero-network": constructParams(543210),
  xai: constructParams(660279),
  forma: constructParams(984122),
  solana: constructParams(792703809),
  ancient8: constructParams(888888888),
  rari: constructParams(1380012617),
  bitcoin: constructParams(8253038),
  degen: constructParams(666666666),
  funki: constructParams(33979),
  mode: constructParams(34443),
  "proof-of-play": constructParams(70700),
  "proof-of-play-boss": constructParams(70701),
};

export default adapter;
