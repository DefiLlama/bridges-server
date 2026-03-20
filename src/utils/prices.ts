import { PRICES_API } from "./constants";

const axios = require("axios");
const retry = require("async-retry");

const maxNumberOfPrices = 150;
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

export const getLlamaPrices = async (tokens: string[], timestamp?: number): Promise<Record<string, any>> => {
  const finalPrices: { [key: string]: any } = {};
  let remainingTokens = tokens.map((token) => {
    const [prefix, id] = splitOnce(token, ":");
    const mappedPrefix = NAME_MAPPING[prefix] || prefix;
    return `${mappedPrefix}:${id}`;
  });

  while (remainingTokens.length > 0) {
    const url = timestamp
      ? `${PRICES_API}/historical/${timestamp}/${remainingTokens.slice(0, maxNumberOfPrices).join(",")}`
      : `${PRICES_API}/current/${remainingTokens.slice(0, maxNumberOfPrices).join(",")}`;
    try {
      const res = await retry(async () => await axios.get(url, { timeout: REQUEST_TIMEOUT }), RETRY_OPTS);
      const prices = res?.data?.coins;
      Object.assign(finalPrices, prices);
    } catch (e) {
      console.error(`[PRICES] Failed fetching prices for batch after retries, skipping batch. ${(e as any)?.message}`);
    }
    remainingTokens = remainingTokens.slice(maxNumberOfPrices);
  }

  return Object.fromEntries(
    Object.entries(finalPrices).map(([key, value]) => {
      const [prefix, id] = splitOnce(key, ":");
      const originalPrefix = Object.entries(NAME_MAPPING).find(([, mappedName]) => mappedName === prefix)?.[0];
      return [`${originalPrefix || prefix}:${id}`, value];
    })
  );
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
