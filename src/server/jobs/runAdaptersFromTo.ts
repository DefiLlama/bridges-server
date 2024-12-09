import bridgeNetworks from "../../data/bridgeNetworkData";
import { runAdapterHistorical } from "../../utils/adapter";
import { sql } from "../../utils/db";
import { getBridgeID } from "../../utils/wrappa/postgres/query";
import dayjs from "dayjs";

export const runAdaptersFromTo = async () => {
  const fromTimestamp = dayjs().subtract(4, "hour").unix();
  const toTimestamp = dayjs().unix();

  await Promise.all(
    bridgeNetworks.map(async (adapter) => {
      try {
        const bridgeName = adapter.bridgeDbName;
        await Promise.all(
          adapter.chains.map(async (chain) => {
            let nChain;
            if (adapter.chainMapping && adapter.chainMapping[chain.toLowerCase()]) {
              nChain = adapter.chainMapping[chain.toLowerCase()];
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
            const fromTx = await sql<{ tx_block: number }[]>`
          SELECT tx_block FROM bridges.transactions 
          WHERE bridge_id = ${bridgeConfig.id}
        AND chain = ${nChain}
        AND tx_block IS NOT NULL
        AND ts <= to_timestamp(${fromTimestamp})
        ORDER BY ts DESC LIMIT 1
        `;
            const fromBlock = fromTx[0].tx_block;
            const toTx = await sql<{ tx_block: number }[]>`
          SELECT tx_block FROM bridges.transactions 
          WHERE bridge_id = ${bridgeConfig.id}
          AND chain = ${nChain}
          AND tx_block IS NOT NULL
          AND ts >= to_timestamp(${toTimestamp})
          ORDER BY ts ASC LIMIT 1
        `;
            const toBlock = toTx[0].tx_block;

            if (!fromBlock || !toBlock) {
              console.error(`Could not find transactions with blocks for ${nChain} on ${bridgeName}`);
              return;
            }

            await runAdapterHistorical(fromBlock, toBlock, adapter.id, nChain, true, false, "upsert");
          })
        );
      } catch (e) {
        console.error(`Failed to run adapter ${adapter.bridgeDbName}`);
        console.error(e);
      }
    })
  );
};
