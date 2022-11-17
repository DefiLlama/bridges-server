import {
  BridgeAdapter,
  PartialContractEventParams,
} from "../../helpers/bridgeAdapter.type";
import {getTxDataFromEVMEventLogs} from "../../helpers/processTransactions";
import {constructTransferParams} from "../../helpers/eventParams";

const contracts = {
  ethereum: {
    pools: [
      '0xB827b15adA62D78F5cb90243bc4755cf4B9d1B0e' // USDT
    ]
  },
  bsc: {
    pools: [
      '0x179aaD597399B9ae078acFE2B746C09117799ca0' //BUSD
    ]
  }
}
const constructParams = (chain: keyof typeof contracts) => {
  const eventParams: PartialContractEventParams[] = [];

  for (const poolAddress of contracts[chain].pools) {
    eventParams.push(constructTransferParams(
      poolAddress,
      true
    ),constructTransferParams(
      poolAddress,
      false
    ));

  }

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("allbridge", chain, fromBlock, toBlock, eventParams);

}
const adapter: BridgeAdapter = {
  ethereum: constructParams('ethereum'),
  bsc: constructParams('bsc'),
};

export default adapter;
