import bridgeNetworks from "../../data/bridgeNetworkData";
import { chainMappings } from "../../helpers/tokenMappings";
import { runAdapterHistorical } from "../../utils/adapter";
import { getBlocksByAllChains } from "../../utils/blocks";
import dayjs from "dayjs";

export const runAdaptersFromTo = async () => {
  const fromTimestamp = dayjs().subtract(12, "hour").unix();
  const toTimestamp = dayjs().unix();
  const blockByChain = await getBlocksByAllChains(fromTimestamp, toTimestamp);

  await Promise.all(
    bridgeNetworks.map(async (adapter) => {
      try {
        const bridgeName = adapter.bridgeDbName;
        await Promise.all(
          adapter.chains.map(async (chain) => {
            let nChain;
            if (chainMappings[chain.toLowerCase()]) {
              nChain = chainMappings[chain.toLowerCase()];
            } else {
              nChain = chain.toLowerCase();
            }
            if (nChain === adapter?.destinationChain?.toLowerCase()) return;

            console.log(`Processing chain ${nChain} for ${bridgeName}`);

            const fromBlock = blockByChain[nChain].startBlock;
            const toBlock = blockByChain[nChain].endBlock;

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
