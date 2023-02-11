import { wrapScheduledLambda } from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import { runAdapterToCurrentBlock } from "../utils/adapter";

const handler = async (event: any) => {
    await runAdapterToCurrentBlock(bridgeNetworks[event.bridgeIndex], true, "ignore")
};

export default wrapScheduledLambda(handler);
