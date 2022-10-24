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

const test = async () => {
  const txs = await getTransactionsBlockRange("bsc", "0x4b3B4120d4D7975455d8C2894228789c91a247F8", 22459463, 22461753);
  const hashes = txs.map((tx: any) => tx.hash);

  const transactions = await getNativeTokenTransfersFromHash(
    "multichain",
    "bsc",
    hashes,
    "0x4b3B4120d4D7975455d8C2894228789c91a247F8",
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    ["0x535741", "0x"]
  );
};

test();
