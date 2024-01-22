import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const bridgeAddresses: Record<string, string> = {
  ethereum: "0xA5E38d098b54C00F10e32E51647086232a9A0afD",
  arbitrum: "0x203DAC25763aE783Ad532A035FfF33d8df9437eE",
};

const constructParams = (chain: string) => {
  let eventParams = [] as PartialContractEventParams[];
  const bridgeAddress = bridgeAddresses[chain];

  const depositParams = constructTransferParams(bridgeAddress, true, {}, {}, chain);
  const withdrawParams = constructTransferParams(bridgeAddress, false, {}, {}, chain);

  eventParams = [depositParams, withdrawParams];

  return async (fromBlock: number, toBlock: number) => {
    return getTxDataFromEVMEventLogs("garden", chain as Chain, fromBlock, toBlock, eventParams);
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
};

export default adapter;
