const axios = require("axios");

const endpoints = {
  ethereum: "https://api.etherscan.io",
  polygon: "https://api.polygonscan.com",
  bsc: "https://api.bscscan.com",
  avax: "https://api.snowtrace.io",
  fantom: "https://api.ftmscan.com",
  arbitrum: "https://api.arbiscan.io",
  optimism: "https://api-optimistic.etherscan.io",
  aurora: "https://api.aurorascan.dev"
} as { [chain: string]: string };

const apiKeys = {
  ethereum: "5HQGXJR79NH8AUHR42Y94GKDIZKUMJAJVH",
  polygon: "AYPIRDI1CRI2MF6H2W11HT1CYYW55BM1NB",
  bsc: "ERJVEKXQ2M8HGD6QZDE2FXAH8NIRW3XRI9",
  avax: "1954NC5BEIT3N6H69CFBIAYUQ3A6FIZW3U",
  fantom: "QWYPA9TEQKJVX4MKXVBT9A2SVA1B4F6X44",
  arbitrum: "WH4E9QCMQTMQ9ZT2YEW1FJ3RQ3YUIAK5MA",
  optimism: "HZM43U7MPE279MMQV4GY3M6HJN4QPIYE1M",
  aurora: "U3XVFVGWEITKHK74PJPRZXVS4MQAXPC2KN"
} as { [chain: string]: string };

export const getTxsBlockRangeEtherscan = async (
  chain: string,
  address: string,
  startBlock: number,
  endBlock: number,
  matchFunctionSignatures?: string[]
) => {
  const endpoint = endpoints[chain];
  const apiKey = apiKeys[chain];
  const res = (
        await axios.get(
          `${endpoint}/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&apikey=${apiKey}`
        )
  ).data as any;
  if (res.message === "OK") {
    const filteredResults = res.result.filter((tx: any) => {
      if (matchFunctionSignatures) {
        const signature = tx.input.slice(0, 8);
        if (matchFunctionSignatures.includes(signature)) {
          return true;
        } else {
          console.info(`Tx did not have input data matching given filter for address ${address}, SKIPPING tx.`);
          return false;
        }
      }
      return true;
    });
    return filteredResults;
  } else if (res.message === "No transactions found") {
    console.info(`No Etherscan txs found for address ${address}.`);
    return []
  }
  console.log(res)
  console.error(`WARNING: Etherscan did not return valid response for address ${address}.`);
  return [];
};

export const wait = (time: number) => new Promise((resolve, _reject) => {
    setTimeout(() => {
        resolve("");
    }, time)
  });
