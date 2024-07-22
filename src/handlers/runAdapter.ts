import { wrapScheduledLambda } from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import { runAdapterToCurrentBlock } from "../utils/adapter";
import { sql } from "../utils/db";

const handler = async (event: any) => {
  try {
    await runAdapterToCurrentBlock(bridgeNetworks[event.bridgeIndex], false, "ignore", event.lastRecordedBlocks);
  } catch (e) {
    console.error(`Adapter ${bridgeNetworks[event.bridgeIndex].bridgeDbName} failed ${JSON.stringify(e)}`);
  } finally {
    await sql.end();
  }
};

export default wrapScheduledLambda(handler);
