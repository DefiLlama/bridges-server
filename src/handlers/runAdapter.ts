import { wrapScheduledLambda } from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import { runAdapterToCurrentBlock } from "../utils/adapter";

const handler = async (event: any) => {
  await runAdapterToCurrentBlock(bridgeNetworks[event.bridgeIndex], false, "upsert", event.lastRecordedBlocks);
};

export default wrapScheduledLambda(handler);
