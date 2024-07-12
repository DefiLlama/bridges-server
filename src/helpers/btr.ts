import { FunctionSignatureFilter } from "./bridgeAdapter.type";
const axios = require("axios");
const retry = require('retry')

export const getTxsBlockRangeBtrScan = async (
  address: string,
  startBlock: number,
  endBlock: number,
  functionSignatureFilter?: FunctionSignatureFilter
) => {
  let txList: any[] = await getBlockTXbyAddress(address, startBlock, endBlock);
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
    console.info(`No txs found for address ${address}.`);
    return [];
  }
};

const getBlockTXbyAddress = async (
  address: string,
  startBlock: number,
  endBlock: number,
) => {
  let res = await axios.get(
    `https://api.btrscan.com/scan/api?module=account&action=txlist&address=${address}&startBlock=${startBlock}&endBlock=${endBlock}&sort=asc`
  )
  const data = res.data
  if(data.message == 'OK' && data.status == 1 &&data.result.length != 0 ) {
    //filter by address
    const txList: any[] = data.result;
    return txList;
  }
  return []
}