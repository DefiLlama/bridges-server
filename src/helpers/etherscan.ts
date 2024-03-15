import { FunctionSignatureFilter } from "./bridgeAdapter.type";
const axios = require("axios");

const endpoints = {
  ethereum: "https://api.etherscan.io",
  polygon: "https://api.polygonscan.com",
  bsc: "https://api.bscscan.com",
  avax: "https://api.snowtrace.io",
  fantom: "https://api.ftmscan.com",
  arbitrum: "https://api.arbiscan.io",
  optimism: "https://api-optimistic.etherscan.io",
  aurora: "https://explorer.mainnet.aurora.dev/api",
  celo: "https://api.celoscan.io",
  linea: "https://api.lineascan.build/api",
  scroll: "https://api.scrollscan.com/api",
  base: "https://api.basescan.org/api",
  "zksync era": "https://block-explorer-api.mainnet.zksync.io/api",
  "mantle": "https://explorer.mantle.xyz/api",
  "polygon zkevm": "https://api-zkevm.polygonscan.com/api"
} as { [chain: string]: string };

const apiKeys = {
  ethereum: "5HQGXJR79NH8AUHR42Y94GKDIZKUMJAJVH",
  polygon: "AYPIRDI1CRI2MF6H2W11HT1CYYW55BM1NB",
  bsc: "ERJVEKXQ2M8HGD6QZDE2FXAH8NIRW3XRI9",
  avax: "1954NC5BEIT3N6H69CFBIAYUQ3A6FIZW3U",
  fantom: "QWYPA9TEQKJVX4MKXVBT9A2SVA1B4F6X44",
  arbitrum: "WH4E9QCMQTMQ9ZT2YEW1FJ3RQ3YUIAK5MA",
  optimism: "HZM43U7MPE279MMQV4GY3M6HJN4QPIYE1M",
  // aurora: "U3XVFVGWEITKHK74PJPRZXVS4MQAXPC2KN",
  celo: "K32MTI3Z84KVSQD752YQAFIINIMZ18BVFI",
  linea: "GABW9RW3ATKWYSUX7V4M8H7YAFDS4V3BS4",
  scroll: "UNHBX3FPTBK39SPHNSIR1V62BUUAQAF83J",
  base: "Q9N8XJNMK6YGZP1P8BT9UVWNZRH3H8C4WG",
  "polygon zkevm": "8Q8ZC95ZZXC56UHQZE2VPVUYC41G9E2BVZ"
} as { [chain: string]: string };

export const getTxsBlockRangeEtherscan = async (
  chain: string,
  address: string,
  startBlock: number,
  endBlock: number,
  functionSignatureFilter?: FunctionSignatureFilter
) => {
  const endpoint = endpoints[chain];
  const apiKey = apiKeys[chain];
  let res;
  if (!apiKey) {
    res = (
      await axios.get(
        `${endpoint}?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}`
      )
    ).data as any;
  } else {
    res = (
      await axios.get(
        `${endpoint}/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&apikey=${apiKey}`
      )
    ).data as any;
  }
  if (res.message === "OK") {
    const filteredResults = res.result.filter((tx: any) => {
      if (functionSignatureFilter) {
        const signature = tx.input.slice(0, 10); // 0x + 4 bytes of method id @todo bug to be reported
        // alternatively, we can use the method signature like const signature = tx.methodId;
        if (
          functionSignatureFilter.includeSignatures &&
          !functionSignatureFilter.includeSignatures.includes(signature)
        ) {
          return false;
        }
        if (
          functionSignatureFilter.excludeSignatures &&
          functionSignatureFilter.excludeSignatures.includes(signature)
        ) {
          return false;
        }
      }
      return true;
    });
    return filteredResults;
  } else if (res.message === "No transactions found") {
    console.info(`No Etherscan txs found for address ${address}.`);
    return [];
  }
  console.log(res);
  console.error(`WARNING: Etherscan did not return valid response for address ${address}.`);
  return [];
};

const etherscanDelay = 500; // in milliseconds

export const etherscanWait = () =>
  new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve("");
    }, etherscanDelay);
  });

export const wait = (ms: number) =>
  new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve("");
    }, ms);
  });

const locks = [] as ((value: unknown) => void)[];
export function getLock() {
  return new Promise((resolve) => {
    locks.push(resolve);
  });
}
function releaseLock() {
  const firstLock = locks.shift();
  if (firstLock !== undefined) {
    firstLock(null);
  }
}
function setTimer(timeBetweenTicks: number) {
  const timer = setInterval(() => {
    releaseLock();
  }, timeBetweenTicks);
  return timer;
}
setTimer(500); // Rate limit is 5 calls/s for etherscan's API