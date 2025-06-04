import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const bridgeAddresses: Record<string, string> = {
  ethereum: "0x3fDEe07b0756651152BF11c8D170D72d7eBbEc49",
  arbitrum: "0x3fDEe07b0756651152BF11c8D170D72d7eBbEc49",
  bera: "0x3fDEe07b0756651152BF11c8D170D72d7eBbEc49",
  unichain: "0x3fDEe07b0756651152BF11c8D170D72d7eBbEc49",
  hyperliquid: "0x3fDEe07b0756651152BF11c8D170D72d7eBbEc49",
  starknet: "0x047AEEC489b9f722A3afB8482109538CeFA547C096141b04f808214826E8Fc71",
  base: "0x3fDEe07b0756651152BF11c8D170D72d7eBbEc49",
  bitcoin: "bc1qj3h9wazx6dh3lkm6u8cka8krdm36tujtgw0uv9"
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
