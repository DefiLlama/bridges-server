import { PRICES_API } from "./constants";
import { isValidPriceId } from "./priceIds";

const axios = require("axios");
const retry = require("async-retry");

const maxNumberOfPrices = 150;
const MAX_PRICE_REQUEST_URL_LENGTH = 3500;
const REQUEST_TIMEOUT = 30_000;
const RETRY_OPTS = { retries: 3, minTimeout: 1000, maxTimeout: 5000 };

export const getSingleLlamaPrice = async (
  chain: string,
  token: string,
  timestamp?: number,
  confidenceThreshold?: number
) => {
  const url = timestamp
    ? PRICES_API + `/historical/${timestamp}/${chain}:${token}`
    : PRICES_API + `/current/${chain}:${token}`;

  const res = await retry(async (_bail: any) => await axios.get(url, { timeout: REQUEST_TIMEOUT }), RETRY_OPTS);
  const price = res?.data?.coins?.[`${chain}:${token}`];
  if (!confidenceThreshold || !price || price.confidence > confidenceThreshold) {
    return price;
  }
  return null;
};

const NAME_MAPPING: Record<string, string> = {
  "b2-mainnet": "bsquared",
  xdai: "gnosis",
};

export type LlamaPriceFetchResult = {
  prices: Record<string, any>;
  failedBatches: number;
  totalBatches: number;
};

export const assertCompleteLlamaPriceFetch = (result: LlamaPriceFetchResult, context: string) => {
  if (result.failedBatches > 0) {
    throw new Error(
      `[PRICES] Refusing to persist ${context}: ${result.failedBatches}/${result.totalBatches} price batches failed.`
    );
  }
};

export const buildLlamaPriceBatches = (tokens: string[], timestamp?: number) => {
  const urlPrefix = timestamp ? `${PRICES_API}/historical/${timestamp}/` : `${PRICES_API}/current/`;
  const batches: string[][] = [];
  let batch: string[] = [];

  for (const token of tokens) {
    const candidate = [...batch, token];
    const candidateUrl = `${urlPrefix}${candidate.join(",")}`;
    if (
      batch.length > 0 &&
      (candidate.length > maxNumberOfPrices || candidateUrl.length > MAX_PRICE_REQUEST_URL_LENGTH)
    ) {
      batches.push(batch);
      batch = [token];
    } else {
      batch = candidate;
    }
  }

  if (batch.length > 0) batches.push(batch);
  return batches;
};

export const getLlamaPricesWithStatus = async (
  tokens: string[],
  timestamp?: number
): Promise<LlamaPriceFetchResult> => {
  const finalPrices: { [key: string]: any } = {};
  let failedBatches = 0;
  let totalBatches = 0;
  const validTokens = tokens.filter(isValidPriceId);
  if (validTokens.length !== tokens.length) {
    console.warn(`[PRICES] Ignoring ${tokens.length - validTokens.length} malformed price IDs`);
  }
  const mappedTokens = validTokens.map((token) => {
    const [prefix, id] = splitOnce(token, ":");
    const mappedPrefix = NAME_MAPPING[prefix] || prefix;
    return `${mappedPrefix}:${id}`;
  });

  const batches = buildLlamaPriceBatches(mappedTokens, timestamp);
  for (const batch of batches) {
    totalBatches++;
    const url = timestamp
      ? `${PRICES_API}/historical/${timestamp}/${batch.join(",")}`
      : `${PRICES_API}/current/${batch.join(",")}`;
    try {
      const res = await retry(async () => await axios.get(url, { timeout: REQUEST_TIMEOUT }), RETRY_OPTS);
      const prices = res?.data?.coins;
      Object.assign(finalPrices, prices);
    } catch (e) {
      failedBatches++;
      console.error(`[PRICES] Failed fetching prices for batch after retries, skipping batch. ${(e as any)?.message}`);
    }
  }

  const prices = Object.fromEntries(
    Object.entries(finalPrices).map(([key, value]) => {
      const [prefix, id] = splitOnce(key, ":");
      const originalPrefix = Object.entries(NAME_MAPPING).find(([, mappedName]) => mappedName === prefix)?.[0];
      return [`${originalPrefix || prefix}:${id}`, value];
    })
  );

  return { prices, failedBatches, totalBatches };
};

export const getLlamaPrices = async (tokens: string[], timestamp?: number): Promise<Record<string, any>> => {
  return (await getLlamaPricesWithStatus(tokens, timestamp)).prices;
};

function splitOnce(input: string, separator: string): string[] {
  const index = input.indexOf(separator);

  if (index === -1) {
    return [input];
  }

  const part1 = input.substring(0, index);
  const part2 = input.substring(index + separator.length);
  return [part1, part2];
}
