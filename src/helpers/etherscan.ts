import { FunctionSignatureFilter } from "./bridgeAdapter.type";
import { isNonRetryableError, NonRetryableError } from "../utils/errors";
import { claimDailyRequestBudget } from "../utils/cache";
import { createHash } from "node:crypto";
const axios = require("axios");
const retry = require("async-retry");

const ETHERSCAN_V2_API = "https://api.etherscan.io/v2/api";
const REQUEST_TIMEOUT_MS = 30_000;
export const EXPLORER_REQUEST_INTERVAL_MS = 350;
export const EXPLORER_PAGE_SIZE = 1000;
const MAX_EXPLORER_PAGES = 1000;
const DEFAULT_ETHERSCAN_DAILY_REQUEST_BUDGET = 90_000;

// Only chains served by the unified Etherscan V2 API belong here. Other explorers
// must be configured explicitly instead of silently falling back to deprecated V1 URLs.
const etherscanV2ChainIds: Record<string, string> = {
  ethereum: "1",
  bsc: "56",
  polygon: "137",
  optimism: "10",
  arbitrum: "42161",
  avax: "43114",
  celo: "42220",
  base: "8453",
  linea: "59144",
  blast: "81457",
  taiko: "167000",
  mantle: "5000",
  fraxtal: "252",
  xdai: "100",
  gnosis: "100",
  op_bnb: "204",
  opbnb: "204",
  wc: "480",
  "world chain": "480",
  moonbeam: "1284",
  apechain: "33139",
  berachain: "80094",
  sonic: "146",
  unichain: "130",
  abstract: "2741",
  monad: "143",
  hyperevm: "999",
  sei: "1329",
  megaeth: "4326",
};

const paidOnlyEtherscanChains = new Set(["bsc", "base", "optimism", "avax"]);

type ExplorerConfig = {
  endpoint: string;
  apiKey?: string;
  chainId?: string;
};

const envSuffix = (chain: string) => chain.toUpperCase().replace(/[^A-Z0-9]+/g, "_");

export const getExplorerConfig = (chain: string, env: NodeJS.ProcessEnv = process.env): ExplorerConfig => {
  chain = chain.trim().toLowerCase();
  const suffix = envSuffix(chain);
  const customEndpoint = env[`EXPLORER_API_URL_${suffix}`];
  if (customEndpoint) {
    return {
      endpoint: customEndpoint.endsWith("/api") ? customEndpoint : `${customEndpoint.replace(/\/$/, "")}/api`,
      apiKey: env[`EXPLORER_API_KEY_${suffix}`],
    };
  }

  const chainId = etherscanV2ChainIds[chain];
  if (!chainId) {
    throw new NonRetryableError(
      `No supported explorer configured for ${chain}. Set EXPLORER_API_URL_${suffix} and optionally EXPLORER_API_KEY_${suffix}.`
    );
  }
  if (!env.ETHERSCAN_API_KEY) {
    throw new NonRetryableError(`ETHERSCAN_API_KEY is required for Etherscan V2 chain ${chain}.`);
  }
  const plan = (env.ETHERSCAN_PLAN || "free").toLowerCase();
  if (paidOnlyEtherscanChains.has(chain) && plan === "free") {
    throw new NonRetryableError(
      `Etherscan Free Tier does not support txlist for ${chain}. Configure EXPLORER_API_URL_${suffix} or set ETHERSCAN_PLAN to the paid Jenkins plan.`
    );
  }
  return { endpoint: ETHERSCAN_V2_API, apiKey: env.ETHERSCAN_API_KEY, chainId };
};

const isRetryableExplorerError = (error: any) => {
  const status = error?.response?.status;
  if (status === 429 || status >= 500) return true;
  const message = String(error?.message ?? error?.response?.data?.result ?? "").toLowerCase();
  return ["rate limit", "timeout", "timed out", "temporar", "busy", "unavailable"].some((part) =>
    message.includes(part)
  );
};

let nextRequestAt = 0;

export type ExplorerRequestStats = {
  requests: number;
  successes: number;
  failures: number;
  cacheHits: number;
};

const explorerRequestStats = new Map<string, ExplorerRequestStats>();
const explorerTransactionCache = new Map<string, Promise<any[]>>();

const updateExplorerStats = (chain: string, field: keyof ExplorerRequestStats) => {
  const stats = explorerRequestStats.get(chain) ?? { requests: 0, successes: 0, failures: 0, cacheHits: 0 };
  stats[field]++;
  explorerRequestStats.set(chain, stats);
};

export const getExplorerRequestStats = (): Record<string, ExplorerRequestStats> =>
  Object.fromEntries([...explorerRequestStats.entries()].sort(([a], [b]) => a.localeCompare(b)));

const getDailyRequestBudget = () => {
  const parsed = Number(process.env.ETHERSCAN_DAILY_REQUEST_BUDGET ?? DEFAULT_ETHERSCAN_DAILY_REQUEST_BUDGET);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_ETHERSCAN_DAILY_REQUEST_BUDGET;
};

const getBudgetNamespace = (apiKey?: string) => {
  if (!apiKey) return "etherscan";
  const keyHash = createHash("sha256").update(apiKey).digest("hex").slice(0, 12);
  return `etherscan_${keyHash}`;
};

const rememberExplorerRequest = (key: string, request: Promise<any[]>) => {
  explorerTransactionCache.set(key, request);
  const forget = () => {
    if (explorerTransactionCache.get(key) === request) explorerTransactionCache.delete(key);
  };
  request.then(forget, forget);
};

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function getLock() {
  const now = Date.now();
  const requestAt = Math.max(now, nextRequestAt);
  nextRequestAt = requestAt + EXPLORER_REQUEST_INTERVAL_MS;
  if (requestAt > now) await wait(requestAt - now);
}

export const etherscanWait = () => wait(500);

export const parseExplorerTransactions = (data: any, address: string): any[] => {
  if (data?.status === "1" && data?.message === "OK" && Array.isArray(data.result)) return data.result;

  const responseText = `${data?.message ?? ""} ${typeof data?.result === "string" ? data.result : ""}`.toLowerCase();
  if (responseText.includes("no transactions found")) return [];

  if (["rate limit", "timeout", "temporar", "busy", "unavailable"].some((part) => responseText.includes(part))) {
    throw new Error(`Explorer temporarily failed for ${address}: ${responseText.trim()}`);
  }
  throw new NonRetryableError(
    `Explorer returned an invalid response for ${address}: ${responseText.trim() || "empty response"}`
  );
};

const getTransactionKey = (transaction: any) =>
  transaction?.hash ? String(transaction.hash).toLowerCase() : JSON.stringify(transaction);

export const collectPaginatedExplorerTransactions = async (
  fetchPage: (page: number) => Promise<any[]>,
  context: string,
  pageSize: number = EXPLORER_PAGE_SIZE
) => {
  const transactions: any[] = [];
  const seenTransactions = new Set<string>();

  for (let page = 1; page <= MAX_EXPLORER_PAGES; page++) {
    const pageTransactions = await fetchPage(page);
    for (const transaction of pageTransactions) {
      const key = getTransactionKey(transaction);
      if (seenTransactions.has(key)) {
        throw new NonRetryableError(
          `Explorer pagination returned duplicate transaction ${key} for ${context} on page ${page}; checkpoint will not advance.`
        );
      }
      seenTransactions.add(key);
      transactions.push(transaction);
    }

    if (pageTransactions.length < pageSize) return transactions;
  }

  throw new NonRetryableError(
    `Explorer pagination exceeded ${MAX_EXPLORER_PAGES} pages for ${context}; checkpoint will not advance.`
  );
};

export const getTxsBlockRangeEtherscan = async (
  chain: string,
  address: string,
  startBlock: number,
  endBlock: number,
  functionSignatureFilter?: FunctionSignatureFilter
) => {
  chain = chain.trim().toLowerCase();
  const config = getExplorerConfig(chain);
  const fetchPage = async (page: number): Promise<any[]> => {
    try {
      return await retry(
        async (bail: (error: Error) => never) => {
          await getLock();
          try {
            if (config.chainId) {
              const budget = await claimDailyRequestBudget(getBudgetNamespace(config.apiKey), getDailyRequestBudget());
              if (!budget.allowed) {
                return bail(
                  new NonRetryableError(
                    `Local Etherscan daily request budget exhausted at ${budget.count} requests; refusing to consume the provider hard limit.`
                  )
                );
              }
            }
            updateExplorerStats(chain, "requests");
            const response = await axios.get(config.endpoint, {
              timeout: REQUEST_TIMEOUT_MS,
              params: {
                chainid: config.chainId,
                module: "account",
                action: "txlist",
                address,
                startblock: startBlock,
                endblock: endBlock,
                page,
                offset: EXPLORER_PAGE_SIZE,
                sort: "asc",
                apikey: config.apiKey,
              },
            });
            const transactions = parseExplorerTransactions(response.data, address);
            updateExplorerStats(chain, "successes");
            return transactions;
          } catch (error: any) {
            updateExplorerStats(chain, "failures");
            if (isNonRetryableError(error) || !isRetryableExplorerError(error)) return bail(error);
            throw error;
          }
        },
        { retries: 3, factor: 2, minTimeout: 1000, maxTimeout: 10_000, randomize: true }
      );
    } catch (error: any) {
      if (isNonRetryableError(error)) throw error;
      throw new NonRetryableError(
        `Explorer request for ${chain}:${address} page ${page} failed after retries: ${error?.message ?? String(error)}`
      );
    }
  };

  const cacheKey = `${config.endpoint}|${
    config.chainId ?? "custom"
  }|${chain}|${address.toLowerCase()}|${startBlock}|${endBlock}`;
  let transactionRequest = explorerTransactionCache.get(cacheKey);
  if (transactionRequest) {
    updateExplorerStats(chain, "cacheHits");
  } else {
    transactionRequest = collectPaginatedExplorerTransactions(fetchPage, `${chain}:${address}`);
    rememberExplorerRequest(cacheKey, transactionRequest);
    transactionRequest.catch(() => explorerTransactionCache.delete(cacheKey));
  }
  const transactions = await transactionRequest;

  return transactions.filter((tx: any) => {
    if (!functionSignatureFilter) return true;
    const signature = String(tx?.input ?? "").slice(0, 10);
    if (functionSignatureFilter.includeSignatures && !functionSignatureFilter.includeSignatures.includes(signature)) {
      return false;
    }
    if (functionSignatureFilter.excludeSignatures && functionSignatureFilter.excludeSignatures.includes(signature)) {
      return false;
    }
    return true;
  });
};
