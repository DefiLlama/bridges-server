import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const gatewayAddresses = {
  ethereum: "0x22715dfF101D33B2a14a4834f7C527902Bc42899",
  bsc: "0x587AaA2150AD416bAD6b9919FDfF2D78BE11383B",
  polygon: "0x9092fCF5Ea1E22f2922eEa132D2931CDd795ab53",
  optimism: "0x1B3aE33ff0241999854C05B0CdF821DE55A4404A",
  arbitrum: "0x99a68649E927774680e9D3387BF8cCbF93B45230",
} as {
  [chain: string]: string;
};

const nullAddress = "0x0000000000000000000000000000000000000000";

const constructParams = (chain: string) => {
  let eventParams = [] as PartialContractEventParams[];
  const addy = gatewayAddresses[chain];

  const deposit = constructTransferParams(addy, true, {
    excludeFrom: [addy, nullAddress],
    excludeTo: [nullAddress],
    includeTo: [addy],
  });

  const withdraw = constructTransferParams(addy, false, {
    excludeFrom: [nullAddress],
    excludeTo: [nullAddress, addy],
    includeFrom: [addy],
  });

  eventParams.push(deposit, withdraw);

  return async (fromBlock: number, toBlock: number) =>
    await getTxDataFromEVMEventLogs("crowdswap", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  polygon: constructParams("polygon"),
  bsc: constructParams("bsc"),
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
};

export default adapter;
