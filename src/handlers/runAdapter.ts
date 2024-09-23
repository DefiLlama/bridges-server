import { wrapScheduledLambda } from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import { runAdapterToCurrentBlock } from "../utils/adapter";
import { sql } from "../utils/db";
import { BridgeNetwork } from "../data/types";

const handler = async (event: any) => {
  try {
    const bridgesToRun = event.bridgeIndices.map((index: number) => bridgeNetworks[index]);
    const promises = Promise.all(
      bridgesToRun.map(async (bridge: BridgeNetwork) => {
        return runAdapterToCurrentBlock(bridge, false, "ignore", event.lastRecordedBlocks);
      })
    );
    await promises;
    console.log(`Adapters of ${bridgesToRun.map((bridge: any) => bridge.bridgeDbName).join(", ")} ran successfully`);
  } catch (e) {
    console.error(`Adapter ${bridgeNetworks[event.bridgeIndex].bridgeDbName} failed ${JSON.stringify(e)}`);
  } finally {
    await sql.end();
  }
};

export default wrapScheduledLambda(handler);
