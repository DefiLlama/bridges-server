import {
  BridgeAdapter,
  PartialContractEventParams,
} from "../../helpers/bridgeAdapter.type";
import { getEVMEventLogs } from "../../helpers/eventLogs";
import { constructTransferParams } from "../../helpers/eventParams";

// 0xC564EE9f21Ed8A2d8E7e76c085740d5e4c5FaFbE is Multichain: Fantom Bridge (EOA)

const depositEventParams: PartialContractEventParams =
  constructTransferParams(
    "0xC564EE9f21Ed8A2d8E7e76c085740d5e4c5FaFbE",
    true
  );

const withdrawalEventParams: PartialContractEventParams =
  constructTransferParams(
    "0xC564EE9f21Ed8A2d8E7e76c085740d5e4c5FaFbE",
    false
  );

const constructParams = () => {
  const eventParams = [
    depositEventParams,
    withdrawalEventParams
  ];
  return async (fromBlock: number, toBlock: number) =>
    getEVMEventLogs("fantom", "ethereum", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  fantom: constructParams(),
};

export default adapter;
