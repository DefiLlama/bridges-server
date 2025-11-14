import { FunctionSignatureFilter } from "./bridgeAdapter.type";
const axios = require("axios");
const retry = require("async-retry");

const endpoints = {
  merlin: "https://scan.merlinchain.io",
  "b2-mainnet": "https://explorer.bsquared.network",
  "rsk": "https://rootstock.blockscout.com",
} as { [chain: string]: string };

export const getTxsBlockRangeL2Scan = async (
  chain: string,
  address: string,
  startBlock: number,
  endBlock: number,
  functionSignatureFilter?: FunctionSignatureFilter
) => {
  let txList: any[] = await getBlockTXbyAddress(chain, address, startBlock, endBlock);
  // console.log(JSON.stringify(txList));
  if (txList.length > 0) {
    const filteredResults = txList.filter((tx: any) => {
      if (functionSignatureFilter) {
        const signature = tx.input.slice(0, 10);
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
  } else {
    return [];
  }
};

const getBlockTXbyAddress = async (
  chain: string,
  address: string,
  startBlock: number,
  endBlock: number,
) => {
  const endpoint = endpoints[chain];
  let txList: any[] = []
  let page = 1
  while(true) {
    let res = await retry(
      () =>
        axios.get(
          `${endpoint}/api?module=account&action=txlist&address=${address}&endblock=${endBlock}&sort=asc&startblock=${startBlock}&offset=1000&page=${page}`
        ),
      { factor: 1, retries: 3 }
    )
    if (res.data.message == 'OK' && res.data.result.length != 0) {
      txList = txList.concat(res.data.result)
    } else {
      break;
    }
    page++
  }
  return txList;
}
