import { PRICES_API } from "./constants";
const axios = require("axios");
const retry = require("async-retry");

const maxNumberOfPrices = 150

export const getSingleLlamaPrice = async (chain: string, token: string, timestamp?: number, confidenceThreshold?: number) => {
  const url = timestamp
    ? PRICES_API + `/historical/${timestamp}/${chain}:${token}`
    : PRICES_API + `/current/${chain}:${token}`;
  const res = await retry(async (_bail: any) => await axios.get(url));
  const price = res?.data?.coins?.[`${chain}:${token}`]
  if ((!confidenceThreshold) || !price || price.confidence > confidenceThreshold) {
    return price
  }
  return null;
};

export const getLlamaPrices = async (tokens:string[], timestamp?: number) => {
    let finalPrices = {} as any
    let remainingTokens = tokens
    while (remainingTokens.length > 0) {
    const url = timestamp
      ? PRICES_API + `/historical/${timestamp}/${remainingTokens.slice(0, maxNumberOfPrices).reduce((acc, curr) => {return acc + curr + ','}, "").slice(0, -1)}`
      : PRICES_API + `/current/${remainingTokens.slice(0, maxNumberOfPrices).reduce((acc, curr) => {return acc + curr + ','}, "").slice(0, -1)}`;
    const res = await retry(async (_bail: any) => await axios.get(url));
    const prices = res?.data?.coins;
    finalPrices = {...finalPrices, ...prices}
    remainingTokens = remainingTokens.slice(maxNumberOfPrices)
    }
    return finalPrices;
  };