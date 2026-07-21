import { FunctionSignatureFilter } from "./bridgeAdapter.type";
import { isNonRetryableError, NonRetryableError } from "../utils/errors";
const axios = require("axios");
const retry = require("async-retry");

const ETHERSCAN_V2_API = "https://api.etherscan.io/v2/api";
const REQUEST_TIMEOUT_MS = 30_000;
export const EXPLORER_REQUEST_INTERVAL_MS = 350;
export const EXPLORER_PAGE_SIZE = 1000;
const MAX_EXPLORER_PAGES = 1000;

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
};

type ExplorerConfig = {
  endpoint: string;
  apiKey?: string;
  chainId?: string;
};

const envSuffix = (chain: string) => chain.toUpperCase().replace(/[^A-Z0-9]+/g, "_");

export const getExplorerConfig = (chain: string, env: NodeJS.ProcessEnv = process.env): ExplorerConfig => {
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
  const config = getExplorerConfig(chain);
  const fetchPage = async (page: number): Promise<any[]> => {
    try {
      return await retry(
        async (bail: (error: Error) => never) => {
          await getLock();
          try {
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
            return parseExplorerTransactions(response.data, address);
          } catch (error: any) {
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

  const transactions = await collectPaginatedExplorerTransactions(fetchPage, `${chain}:${address}`);

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
