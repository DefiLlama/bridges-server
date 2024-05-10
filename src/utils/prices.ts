import { PRICES_API } from "./constants";
const axios = require("axios");
const retry = require("async-retry");

const maxNumberOfPrices = 150;

export const getSingleLlamaPrice = async (
  chain: string,
  token: string,
  timestamp?: number,
  confidenceThreshold?: number
) => {
  const url = timestamp
    ? PRICES_API + `/historical/${timestamp}/${chain}:${token}`
    : PRICES_API + `/current/${chain}:${token}`;
  const res = await retry(async (_bail: any) => await axios.get(url));
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

export const getLlamaPrices = async (tokens: string[], timestamp?: number) => {
  const finalPrices: { [key: string]: any } = {};
  let remainingTokens = tokens.map((token) => {
    const [prefix, id] = token.split(":");
    const mappedPrefix = NAME_MAPPING[prefix] || prefix;
    return `${mappedPrefix}:${id}`;
  });

  while (remainingTokens.length > 0) {
    const url = timestamp
      ? `${PRICES_API}/historical/${timestamp}/${remainingTokens.slice(0, maxNumberOfPrices).join(",")}`
      : `${PRICES_API}/current/${remainingTokens.slice(0, maxNumberOfPrices).join(",")}`;
    const res = await retry(async () => await axios.get(url));
    const prices = res?.data?.coins;
    Object.assign(finalPrices, prices);
    remainingTokens = remainingTokens.slice(maxNumberOfPrices);
  }

  return Object.fromEntries(
    Object.entries(finalPrices).map(([key, value]) => {
      const [prefix, id] = key.split(":");
      const originalPrefix = Object.entries(NAME_MAPPING).find(([, mappedName]) => mappedName === prefix)?.[0];
      return [`${originalPrefix || prefix}:${id}`, value];
    })
  );
};
