import { FunctionSignatureFilter } from "./bridgeAdapter.type";
const axios = require("axios");
const retry = require("async-retry");

const endpoint = "https://scan.merlinchain.io";

//const apiKey= "96e62071-b858-4046-a483-172ba199347e";

export const getTxsBlockRangeMerlinScan = async (
  address: string,
  startBlock: number,
  endBlock: number,
  functionSignatureFilter?: FunctionSignatureFilter
) => {
  let txList: any[] = []
  for(startBlock; startBlock <= endBlock; startBlock++ ){
    const txs: any[] = await getBlockTXbyAddress(address, startBlock);
    if(txs != null){
      txList = txList.concat(txs);
    }
  }
  console.log(JSON.stringify(txList));
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
  blockNumber: number,
) => {
  let res = await axios.get(
          `${endpoint}/api/trpc/transaction.getTransactions?input={"json":{"take":20,"desc":true,"block_number":${blockNumber},"cursor":null},"meta":{"values":{"cursor":["undefined"]}}}`
        )
  const data = res.data
  if(data.result.data.json?.count > 0) {
    //filter by address
    const txList: any[] = data.result.data.json.list.filter((tx: any) => {
      if(tx.to_address == address || tx.from_address == address) {
        return true
      }
      return false
    })
    if(txList.length != 0) {
      console.log(txList);
      return txList
    }
  }else if(data.includes('error')) {
    console.error(JSON.stringify(data.error.json.message));
  }
  return [];
}