import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const gatewayAddresses = {
  ethereum: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
  bsc: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
  polygon: "0x6f015F16De9fC8791b234eF68D486d2bF203FBA8",
  avax: "0x5029C0EFf6C34351a0CEc334542cDb22c7928f78",
  fantom: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
  arbitrum: "0xe432150cce91c13a887f7D836923d5597adD8E31",
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
    await getTxDataFromEVMEventLogs("axelar", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
};

export default adapter;
