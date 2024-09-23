import { wrapScheduledLambda } from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import { runAdapterHistorical } from "../utils/adapter";
import { sql } from "../utils/db";
import { Chain } from "@defillama/sdk/build/general";
import { getBlockByTimestamp } from "../utils/blocks";

const handler = async (event: any) => {
  try {
    const { bridgeName, fromTimestamp, toTimestamp } = event;

    const adapter = bridgeNetworks.find((x) => x.bridgeDbName === bridgeName);
    if (!adapter) throw new Error("Invalid adapter");

    console.log(`Running adapter for ${bridgeName} from timestamp ${fromTimestamp} to ${toTimestamp}`);

    const promises = adapter.chains.map(async (chain) => {
      let nChain;
      if (adapter.chainMapping && adapter.chainMapping[chain.toLowerCase()]) {
        nChain = adapter.chainMapping[chain.toLowerCase()];
      } else {
        nChain = chain.toLowerCase();
      }
      if (nChain === adapter?.destinationChain?.toLowerCase()) return;

      console.log(`Processing chain ${nChain} for ${bridgeName}`);

      let fromBlock, toBlock;
      if (bridgeName === "ibc") {
        fromBlock = await getBlockByTimestamp(fromTimestamp, nChain as Chain, adapter, "First");
        toBlock = await getBlockByTimestamp(toTimestamp, nChain as Chain, adapter, "Last");
      } else {
        fromBlock = await getBlockByTimestamp(fromTimestamp, nChain as Chain);
        toBlock = await getBlockByTimestamp(toTimestamp, nChain as Chain);
      }

      if (!fromBlock || !toBlock) {
        console.error(`Could not find blocks for ${nChain} on ${bridgeName}`);
        return;
      }

      await runAdapterHistorical(fromBlock.block, toBlock.block, adapter.id, nChain, true, false, "upsert");

      console.log(
        `Adapter ${bridgeName} ran successfully for chain ${nChain} from block ${fromBlock.block} to ${toBlock.block}`
      );
    });

    await Promise.all(promises);

    console.log(`Adapter ${bridgeName} completed for all chains`);
  } catch (e) {
    console.error(`Adapter failed: ${JSON.stringify(e)}`);
  } finally {
    await sql.end();
  }
};

export default wrapScheduledLambda(handler);
