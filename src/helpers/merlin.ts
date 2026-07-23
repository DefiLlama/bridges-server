import { FunctionSignatureFilter } from "./bridgeAdapter.type";
import { formatError, isAbortError, NonRetryableError, throwIfAborted, waitWithSignal } from "../utils/errors";
const axios = require("axios");
const retry = require("async-retry");

const MERLIN_API_URL = "https://scan.merlinchain.io/api";
const MERLIN_PAGE_SIZE = 1000;
const MERLIN_MAX_PAGES = 1000;
const MERLIN_REQUEST_TIMEOUT_MS = 30_000;
export const MERLIN_REQUEST_INTERVAL_MS = 1_100;

let nextRequestAt = 0;
let requestQueue: Promise<void> = Promise.resolve();
const transactionCache = new Map<string, Promise<any[]>>();

export const getMerlinRetryAfterMs = (error: any, attempt: number) => {
  const retryAfter = Number(error?.response?.headers?.["retry-after"]);
  if (Number.isFinite(retryAfter) && retryAfter >= 0) return retryAfter * 1000;
  const rateLimitReset = Number(error?.response?.headers?.["x-ratelimit-reset"]);
  if (Number.isFinite(rateLimitReset) && rateLimitReset >= 0) return rateLimitReset;
  return Math.min(2_000 * 2 ** attempt, 30_000);
};

const getMerlinLock = async (signal?: AbortSignal) => {
  const current = requestQueue
    .catch(() => {})
    .then(async () => {
      const now = Date.now();
      const requestAt = Math.max(now, nextRequestAt);
      nextRequestAt = requestAt + MERLIN_REQUEST_INTERVAL_MS;
      if (requestAt > now) await waitWithSignal(requestAt - now, signal);
    });
  requestQueue = current.then(
    () => undefined,
    () => undefined
  );
  return current;
};

const fetchMerlinPage = async (
  address: string,
  startBlock: number,
  endBlock: number,
  page: number,
  signal?: AbortSignal
): Promise<any[]> =>
  retry(
    async (bail: (error: Error) => never, attempt: number) => {
      throwIfAborted(signal);
      await getMerlinLock(signal);
      try {
        const response = await axios.get(MERLIN_API_URL, {
          timeout: MERLIN_REQUEST_TIMEOUT_MS,
          params: {
            module: "account",
            action: "txlist",
            address,
            endblock: endBlock,
            sort: "asc",
            startblock: startBlock,
            offset: MERLIN_PAGE_SIZE,
            page,
          },
        });
        if (response.data?.message === "No transactions found") return [];
        if (response.data?.message !== "OK" || !Array.isArray(response.data?.result)) {
          return bail(
            new NonRetryableError(
              `Merlin explorer returned an invalid response for ${address} page ${page}: ${formatError(response.data)}`
            )
          );
        }
        return response.data.result;
      } catch (error: any) {
        if (isAbortError(error) || signal?.aborted) return bail(error);
        const status = error?.response?.status;
        if (status !== 429 && !(status >= 500)) {
          return bail(new NonRetryableError(`Merlin explorer request failed: ${formatError(error)}`));
        }
        await waitWithSignal(getMerlinRetryAfterMs(error, attempt), signal);
        throw error;
      }
    },
    { retries: 4, factor: 1, minTimeout: 0, maxTimeout: 0 }
  );

const collectMerlinTransactions = async (
  address: string,
  startBlock: number,
  endBlock: number,
  signal?: AbortSignal
) => {
  const transactions: any[] = [];
  const seen = new Set<string>();
  for (let page = 1; page <= MERLIN_MAX_PAGES; page++) {
    const pageTransactions = await fetchMerlinPage(address, startBlock, endBlock, page, signal);
    for (const transaction of pageTransactions) {
      const key = String(transaction?.hash ?? JSON.stringify(transaction)).toLowerCase();
      if (seen.has(key)) {
        throw new NonRetryableError(
          `Merlin pagination returned duplicate transaction ${key} for ${address} on page ${page}.`
        );
      }
      seen.add(key);
      transactions.push(transaction);
    }
    if (pageTransactions.length < MERLIN_PAGE_SIZE) return transactions;
  }
  throw new NonRetryableError(`Merlin pagination exceeded ${MERLIN_MAX_PAGES} pages for ${address}.`);
};

export const getTxsBlockRangeMerlinScan = async (
  address: string,
  startBlock: number,
  endBlock: number,
  functionSignatureFilter?: FunctionSignatureFilter,
  signal?: AbortSignal
) => {
  const cacheKey = `${address.toLowerCase()}:${startBlock}:${endBlock}`;
  let request = transactionCache.get(cacheKey);
  if (!request) {
    request = collectMerlinTransactions(address, startBlock, endBlock, signal);
    transactionCache.set(cacheKey, request);
    const forget = () => {
      if (transactionCache.get(cacheKey) === request) transactionCache.delete(cacheKey);
    };
    request.then(forget, forget);
  }
  const transactions = await request;
  if (!functionSignatureFilter) return transactions;
  return transactions.filter((tx: any) => {
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
