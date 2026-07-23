import { AdapterRunContext, BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { EventData } from "../../utils/types";
import { getTimestamp } from "@defillama/sdk/build/util";
import { ethers } from "ethers";
import fetch from "node-fetch";
import {
  isAbortError,
  isNonRetryableError,
  NonRetryableError,
  throwIfAborted,
  waitWithSignal,
} from "../../utils/errors";
const retry = require("async-retry");

const API_BASE_URL = (process.env.ONESEC_API_BASE_URL || "https://1sec.to/api").replace(/\/$/, "");
const BATCH_SIZE = 100;
const REQUEST_INTERVAL_MS = 1_000;
const transactionRequestCache = new Map<string, Promise<OneSecTransaction[]>>();
let nextRequestAt = 0;
let requestQueue: Promise<void> = Promise.resolve();

const icpNativeTokens: Record<string, string> = {
  ICP: "0x00f3C42833C3170159af4E92dbb451Fb3F708917",
  BOB: "0xecc5f868AdD75F4ff9FD00bbBDE12C35BA2C9C89",
  CHAT: "0xDb95092C454235E7e666c4E226dBBbCdeb499d25",
  GLDT: "0x86856814e74456893Cfc8946BedcBb472b5fA856",
};

const evmNativeTokens: Record<string, Record<string, string>> = {
  USDC: {
    Ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    Arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    Base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
  USDT: {
    Ethereum: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  cbBTC: {
    Ethereum: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    Arbitrum: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    Base: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
  },
};

const chainMapping: Record<string, string> = {
  Ethereum: "ethereum",
  Arbitrum: "arbitrum",
  Base: "base",
};

interface OneSecTransaction {
  txHash: string;
  blockNumber: number;
  timestamp: number;
  token: string;
  amount: string;
  fromChain: string;
  toChain: string;
  from: string;
  to: string;
}

interface ApiResponse {
  transactions: OneSecTransaction[];
}

const getOneSecLock = async (signal?: AbortSignal) => {
  const current = requestQueue
    .catch(() => {})
    .then(async () => {
      const now = Date.now();
      const requestAt = Math.max(now, nextRequestAt);
      nextRequestAt = requestAt + REQUEST_INTERVAL_MS;
      if (requestAt > now) await waitWithSignal(requestAt - now, signal);
    });
  requestQueue = current.then(
    () => undefined,
    () => undefined
  );
  return current;
};

const fetchTransactions = async (
  fromTimestamp: number,
  toTimestamp: number,
  signal?: AbortSignal
): Promise<OneSecTransaction[]> => {
  const url = `${API_BASE_URL}/transactions?from=${fromTimestamp}&to=${toTimestamp}`;

  return retry(
    async (bail: (error: Error) => never) => {
      throwIfAborted(signal);
      try {
        await getOneSecLock(signal);
        const response = await fetch(url, {
          timeout: 30000,
          signal,
          headers: {
            accept: "application/json",
            "user-agent": "bridges-server/1.0",
          },
        });
        if (!response.ok) {
          const cloudflareChallenge = response.headers.get("cf-mitigated") === "challenge";
          const error = new Error(
            cloudflareChallenge
              ? `HTTP ${response.status}: 1sec API is blocked by a Cloudflare challenge; configure ONESEC_API_BASE_URL to an allowlisted API origin`
              : `HTTP ${response.status} fetching transactions`
          );
          if (response.status !== 429 && response.status < 500) return bail(new NonRetryableError(error.message));
          throw error;
        }
        const data = (await response.json()) as ApiResponse;
        if (!Array.isArray(data?.transactions)) {
          return bail(new NonRetryableError("1sec API returned an invalid transactions response"));
        }
        return data.transactions;
      } catch (error) {
        if (isAbortError(error) || signal?.aborted || isNonRetryableError(error)) return bail(error as Error);
        throw error;
      }
    },
    {
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 10000,
    }
  );
};

const MAX_PAGES = 100;

const fetchAllTransactions = async (
  fromTimestamp: number,
  toTimestamp: number,
  signal?: AbortSignal
): Promise<OneSecTransaction[]> => {
  const allTransactions: OneSecTransaction[] = [];
  const seen = new Set<string>();
  let currentFrom = fromTimestamp;

  for (let page = 0; page < MAX_PAGES; page++) {
    throwIfAborted(signal);
    const transactions = await fetchTransactions(currentFrom, toTimestamp, signal);

    if (transactions.length === 0) return allTransactions;

    for (const transaction of transactions) {
      if (!transaction?.txHash || seen.has(transaction.txHash)) continue;
      seen.add(transaction.txHash);
      allTransactions.push(transaction);
    }

    if (transactions.length < BATCH_SIZE) return allTransactions;

    const lastTx = transactions[transactions.length - 1];
    if (!Number.isFinite(lastTx?.timestamp) || lastTx.timestamp <= currentFrom) {
      throw new NonRetryableError(`1sec pagination did not advance after page ${page + 1}`);
    }
    currentFrom = lastTx.timestamp;

    await waitWithSignal(200, signal);
  }

  throw new NonRetryableError(
    `1sec pagination exceeded ${MAX_PAGES} pages for ${fromTimestamp}-${toTimestamp}; refusing to advance checkpoint`
  );
};

const getCachedTransactions = (fromTimestamp: number, toTimestamp: number, signal?: AbortSignal) => {
  const key = `${fromTimestamp}:${toTimestamp}`;
  let request = transactionRequestCache.get(key);
  if (!request) {
    request = fetchAllTransactions(fromTimestamp, toTimestamp, signal);
    transactionRequestCache.set(key, request);
    const forget = () => {
      if (transactionRequestCache.get(key) === request) transactionRequestCache.delete(key);
    };
    request.then(forget, forget);
  }
  return request;
};

const getTokenAddress = (token: string, evmChain: string): string | null => {
  if (icpNativeTokens[token]) {
    return icpNativeTokens[token];
  }
  if (evmNativeTokens[token] && evmNativeTokens[token][evmChain]) {
    return evmNativeTokens[token][evmChain];
  }
  return null;
};

const isIcpNativeToken = (token: string): boolean => {
  return token in icpNativeTokens;
};

const convertToEventData = (tx: OneSecTransaction, targetChain: string): EventData | null => {
  const evmChain = tx.fromChain === "ICP" ? tx.toChain : tx.fromChain;

  if (chainMapping[evmChain] !== targetChain) {
    return null;
  }

  const tokenAddress = getTokenAddress(tx.token, evmChain);
  if (!tokenAddress) {
    console.warn(`Unknown token ${tx.token} for chain ${evmChain}`);
    return null;
  }

  let isDeposit: boolean;
  if (isIcpNativeToken(tx.token)) {
    isDeposit = tx.fromChain === "ICP";
  } else {
    isDeposit = tx.fromChain !== "ICP";
  }

  return {
    blockNumber: tx.blockNumber,
    txHash: tx.txHash,
    from: tx.from,
    to: tx.to,
    token: tokenAddress,
    amount: ethers.BigNumber.from(tx.amount),
    isDeposit,
    timestamp: tx.timestamp * 1000,
  };
};

const constructParams = (chain: string) => {
  return async (fromBlock: number, toBlock: number, context?: AdapterRunContext): Promise<EventData[]> => {
    const signal = context?.signal;
    throwIfAborted(signal);
    const [fromTimestamp, toTimestamp] = await retry(async (bail: (error: Error) => never) => {
      throwIfAborted(signal);
      try {
        return await Promise.all([getTimestamp(fromBlock, chain), getTimestamp(toBlock, chain)]);
      } catch (error) {
        if (isAbortError(error) || signal?.aborted) return bail(error as Error);
        throw error;
      }
    });

    const transactions = await getCachedTransactions(fromTimestamp, toTimestamp, signal);

    const events: EventData[] = [];
    for (const tx of transactions) {
      const event = convertToEventData(tx, chain);
      if (event) {
        events.push(event);
      }
    }

    return events;
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
  base: constructParams("base"),
};

export default adapter;
