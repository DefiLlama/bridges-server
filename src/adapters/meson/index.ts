import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const contractAddress = "0x25aB3Efd52e6470681CE037cD546Dc60726948D3"

const constructParams = (chain: string) => {
  let eventParams = [] as PartialContractEventParams[];
  const depositParams = constructTransferParams(contractAddress, true, {
    excludeFrom: [contractAddress],
  })
  const withdrawalParams = constructTransferParams(contractAddress, false, {
    excludeTo: [contractAddress],
  })
  eventParams.push(depositParams, withdrawalParams)
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("meson", chain as Chain, fromBlock, toBlock, eventParams)
}

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
  aurora: constructParams("aurora"),
  "zksync era": constructParams("era"),
  kava: constructParams("kava")
};

export default adapter;