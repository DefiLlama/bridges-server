import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { events } from "./events";
import { contracts } from "./contracts";

type SupportedChains = keyof typeof contracts;

const constructParams = (chain: SupportedChains) => {
  const eventParams: PartialContractEventParams[] = [];

  if (contracts[chain].portal) {
    eventParams.push({
      ...events.synthesizeRequestParams,
      target: contracts[chain].portal,
    });
    eventParams.push({
      ...events.burnCompletedParams,
      target: contracts[chain].portal,
    });
  }

  if (contracts[chain].synthesis) {
    eventParams.push({
      ...events.burnRequestParams,
      target: contracts[chain].synthesis,
    });
    eventParams.push({
      ...events.synthesizeCompletedParams,
      target: contracts[chain].synthesis,
    });
  }

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("symbiosis", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  bsc: constructParams("bsc"),
  avalanche: constructParams("avax"),
  polygon: constructParams("polygon"),
  telos: constructParams("telos"),
  kava: constructParams("kava"),
  boba: constructParams("boba"),
  "boba bnb": constructParams("boba_bnb"),
  "zksync era": constructParams("era"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
  "arbitrum nova": constructParams("arbitrum_nova"),
  "polygon zkevm": constructParams("polygon_zkevm"),
  linea: constructParams("linea"),
  base: constructParams("base"),
  mantle: constructParams("mantle"),
  // tron: constructParams("tron"),
  scroll: constructParams("scroll"),
  manta: constructParams("manta"),
};

export default adapter;
