import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { events } from "./events";
import { contracts } from "./contracts";
import { AddressZero, CHAIN_ADAPTER_MAP, CHAINS_MAP } from "./constants";

const buildAdapter = (): BridgeAdapter => {
  const eventParams: PartialContractEventParams[] = [];

  const adapter: BridgeAdapter = {}

  contracts.forEach(({ chainId, portal, synthesis }) => {
    if (portal !== AddressZero) {
      eventParams.push({
        ...events.synthesizeRequestParams,
        target: portal,
      });
      eventParams.push({
        ...events.burnCompletedParams,
        target: portal,
      });
    }

    if (synthesis !== AddressZero) {
      eventParams.push({
        ...events.burnRequestParams,
        target: synthesis,
      });
      eventParams.push({
        ...events.synthesizeCompletedParams,
        target: synthesis,
      });
    }

    const chainKey = CHAINS_MAP[chainId]
    const adapterKey = CHAIN_ADAPTER_MAP[chainKey] || chainKey
    adapter[adapterKey] = async (fromBlock: number, toBlock: number) => {
      return getTxDataFromEVMEventLogs("symbiosis", chainKey as Chain, fromBlock, toBlock, eventParams);
    }
  })

  return adapter
};

const adapter: BridgeAdapter = buildAdapter();

export default adapter;
