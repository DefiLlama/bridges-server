import { wrapScheduledLambda } from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import { runAdapterToCurrentBlock } from "../utils/adapter";
import { BridgeNetwork } from "../data/types";
import { getLastRecordedBlocks } from "../utils/wrappa/postgres/query";

const handler = async (event: { bridgeName: string }) => {
  try {
    const { bridgeName } = event;

    if (!bridgeName) {
      throw new Error("Bridge name is required");
    }

    const bridge = bridgeNetworks.find((b: BridgeNetwork) => b.bridgeDbName === bridgeName);

    if (!bridge) {
      throw new Error(`Bridge ${bridgeName} not found`);
    }

    const lastRecordedBlocks = await getLastRecordedBlocks(bridgeName);

    console.log(`Running adapter for ${bridgeName}`);
    await runAdapterToCurrentBlock(bridge, true, "ignore", lastRecordedBlocks);
    console.log(`Adapter for ${bridgeName} ran successfully`);
  } catch (e) {
    console.error(`Adapter ${event.bridgeName} failed: ${JSON.stringify(e)}`);
    throw e;
  }
};

export default wrapScheduledLambda(handler);
