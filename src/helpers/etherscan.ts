import { getNativeTokenTransfersFromHash } from "./processTransactions";
const axios = require("axios");
const retry = require("async-retry");

const endpoints = {
  ethereum: "https://etherscan.io",
  polygon: "https://polygonscan.com",
  bsc: "https://api.bscscan.com",
  avax: "https://snowtrace.io",
  fantom: "https://ftmscan.com",
  arbitrum: "https://arbiscan.io",
  optimism: "https://api-optimistic.etherscan.io",
} as { [chain: string]: string };

const apiKeys = {
  ethereum: "",
  polygon: "",
  bsc: "ERJVEKXQ2M8HGD6QZDE2FXAH8NIRW3XRI9",
  avax: "",
  fantom: "",
  arbitrum: "",
  optimism: "",
} as { [chain: string]: string };

export const getTransactionsBlockRange = async (
  chain: string,
  address: string,
  startBlock: number,
  endBlock: number
) => {
  const endpoint = endpoints[chain];
  const apiKey = apiKeys[chain];
  const res = (
    await retry(
      async (_bail: any) =>
        await axios.get(
          `${endpoint}/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&apikey=${apiKey}`
        )
    )
  ).data as any;
  if (res.message === "OK") {
    return res.result;
  }
  return null;
};
