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
  "zksync era": "https://block-explorer-api.mainnet.zksync.io/api",
  "mantle": "https://explorer.mantle.xyz/api",
  base: "https://api.basescan.org",
  linea: "https://api.lineascan.build",
  scroll: "https://api.scrollscan.com",
  blast: "https://api.blastscan.io",
  polygon_zkevm: "https://api-zkevm.polygonscan.com",
  arbitrum_nova: "https://api-nova.arbiscan.io",
  era: "https://api-era.zksync.network",
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
  base: "9SH8V4KKINTQ1WA6XSGKX34T7CS3VBMEVS",
  linea: "BHIMJVAKNVNXWFKICD8P93M8CKBQQ8CBU9",
  blast: "7XS7KGJ5KFK97UW8QEQRFUB5Q7EID5K6JH",
  scroll: "CG49F8MBGMU9YQF51IU5D1I2PIWZQ2WP4F",
  arbitrum_nova: "SZZE864TZH3MGRUUDPRPUS7NF8MAFZBDAZ",
  polygon_zkevm: "XKFP275U27W7AI4NGUIT7VGEQ179P4XA1S",
  era: "9HJZA6X8DEJ46WHMM2UEJ5WCXPG31C7EWI",
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
