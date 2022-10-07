import {
  BridgeAdapter,
  PartialContractEventParams,
} from "../../helpers/bridgeAdapter.type";
import { getEVMEventLogs } from "../../helpers/eventLogs";
import { constructTransferParams } from "../../helpers/eventParams";

// 0x8EB8a3b98659Cce290402893d0123abb75E3ab28 is Avalanche: Bridge (EOA)

const depositEventParams: PartialContractEventParams =
  constructTransferParams(
    "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
    true
  );

const withdrawalEventParams: PartialContractEventParams =
  constructTransferParams(
    "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
    false
  );

const constructParams = () => {
  const eventParams = [
    depositEventParams,
    withdrawalEventParams
  ];
  return async (fromBlock: number, toBlock: number) =>
    getEVMEventLogs("avalanche", "ethereum", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
