import { wrapScheduledLambda } from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import { runAdapterHistorical } from "../utils/adapter";
import { sql } from "../utils/db";
import { getBridgeID } from "../utils/wrappa/postgres/query";
import { getLatestBlock } from "../utils/blocks";
import { chainMappings } from "../helpers/tokenMappings";

const handler = async (event: any) => {
  try {
    const { bridgeName, fromTimestamp, toTimestamp } = event;

    const adapter = bridgeNetworks.find((x) => x.bridgeDbName === bridgeName);
    if (!adapter) throw new Error("Invalid adapter");

    console.log(`Running adapter for ${bridgeName} from timestamp ${fromTimestamp} to ${toTimestamp}`);

    const promises = adapter.chains.map(async (chain) => {
      let nChain;
      if (chainMappings[chain.toLowerCase()]) {
        nChain = chainMappings[chain.toLowerCase()];
      } else {
        nChain = chain.toLowerCase();
      }
      if (nChain === adapter?.destinationChain?.toLowerCase()) return;

      console.log(`Processing chain ${nChain} for ${bridgeName}`);

      const bridgeConfig = await getBridgeID(bridgeName, nChain);
      if (!bridgeConfig) {
        console.error(`Could not find bridge config for ${nChain} on ${bridgeName}`);
        return;
      }
      let fromBlock, toBlock;
      if (fromTimestamp) {
        const fromTx = await sql<{ tx_block: number }[]>`
          SELECT tx_block FROM bridges.transactions 
          WHERE bridge_id = ${bridgeConfig.id}
        AND chain = ${nChain}
        AND tx_block IS NOT NULL
        AND ts <= to_timestamp(${fromTimestamp})
        ORDER BY ts DESC LIMIT 1
        `;
        fromBlock = fromTx[0].tx_block;
      }
      if (toTimestamp) {
        const toTx = await sql<{ tx_block: number }[]>`
          SELECT tx_block FROM bridges.transactions 
          WHERE bridge_id = ${bridgeConfig.id}
          AND chain = ${nChain}
          AND tx_block IS NOT NULL
          AND ts >= to_timestamp(${toTimestamp})
          ORDER BY ts ASC LIMIT 1
        `;
        toBlock = toTx[0].tx_block;
      } else {
        const latestBlock = await getLatestBlock(nChain);
        toBlock = latestBlock.number;
      }

      if (!fromBlock || !toBlock) {
        console.error(`Could not find transactions with blocks for ${nChain} on ${bridgeName}`);
        return;
      }

      await runAdapterHistorical(fromBlock, toBlock, adapter.id, nChain, true, false, "upsert");

      console.log(`Adapter ${bridgeName} ran successfully for chain ${nChain} from block ${fromBlock} to ${toBlock}`);
    });

    await Promise.all(promises);

    console.log(`Adapter ${bridgeName} completed for all chains`);
  } catch (e) {
    console.error(`Adapter failed: ${JSON.stringify(e)}`);
  }
};

export default wrapScheduledLambda(handler);
