import { wrapScheduledLambda } from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import { runAdapterToCurrentBlock } from "../utils/adapter";
import { sql } from "../utils/db";
import { BridgeNetwork } from "../data/types";

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

    const lastRecordedBlocks = await sql`SELECT jsonb_object_agg(bridge_id::text, subresult) as result
    FROM (
        SELECT bridge_id, jsonb_build_object('startBlock', MIN(tx_block), 'endBlock', MAX(tx_block)) as subresult
        FROM bridges.transactions
        GROUP BY bridge_id
    ) subquery;
    `;

    console.log(`Running adapter for ${bridgeName}`);
    await runAdapterToCurrentBlock(bridge, true, "ignore", lastRecordedBlocks[0].result);
    console.log(`Adapter for ${bridgeName} ran successfully`);
  } catch (e) {
    console.error(`Adapter ${event.bridgeName} failed: ${JSON.stringify(e)}`);
    throw e;
  }
};

export default wrapScheduledLambda(handler);
