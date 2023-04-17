import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const bridgeAddresses = {
  ethereum: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
  avax: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
  bsc: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
  fantom: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
  polygon: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
} as { [chain: string]: string };

const constructParams = (chain: string) => {
  let eventParams = [] as PartialContractEventParams[];
  const bridgeAddress = bridgeAddresses[chain];
  const depositParams = constructTransferParams(bridgeAddress, true, {
    excludeFrom: [bridgeAddress],
  });
  const withdrawParams = constructTransferParams(bridgeAddress, false, {
    excludeTo: [bridgeAddress],
  });
  eventParams.push(depositParams, withdrawParams);

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("allbridge", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
};

export default adapter;
