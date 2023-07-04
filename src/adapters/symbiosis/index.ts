import {BridgeAdapter, PartialContractEventParams} from "../../helpers/bridgeAdapter.type";
import {getTxDataFromEVMEventLogs} from "../../helpers/processTransactions";
import {events} from "./events";
import {contracts} from "./contracts";

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
    getTxDataFromEVMEventLogs("symbiosis", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  bsc: constructParams("bsc"),
  avalanche: constructParams("avax"),
  polygon: constructParams("polygon"),
  telos: constructParams("telos"),
  kava: constructParams("kava"),
  boba: constructParams("boba"),
  // boba_bnb: constructParams("boba_bnb"),
  // zksync: constructParams("zksync"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
  arbitrum_nova: constructParams("arbitrum_nova"),
  polygon_zkevm: constructParams("polygon_zkevm"),
};

export default adapter;
