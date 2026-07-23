import bridgeNetworks from "../../data/bridgeNetworkData";
import { runAdapterHistorical } from "../../utils/adapter";
import { getBlockByTimestamp } from "../../utils/blocks";
import { normalizeAdapterChainName, resolveProviderChain } from "../../utils/chainResolver";
import dayjs from "dayjs";
import { PromisePool } from "@supercharge/promise-pool";
import { getLast24HVolume } from "../../utils/wrappa/postgres/query";
import { Chain } from "@defillama/sdk/build/general";
import retry from "async-retry";

export const runAdaptersFromTo = async () => {
  const fromTimestamp = dayjs().subtract(3, "hour").unix();
  const toTimestamp = dayjs().unix();

  const blockByChain: Record<string, { startBlock: number; endBlock: number }> = {};
  const pendingBlockRequests: Record<string, Promise<{ startBlock: number; endBlock: number }>> = {};

  const getBlocksForChain = async (chain: string) => {
    if (blockByChain[chain]) {
      return blockByChain[chain];
    }

    if (chain in pendingBlockRequests) {
      return pendingBlockRequests[chain];
    }

    pendingBlockRequests[chain] = (async () => {
      const startBlock = await retry(() => getBlockByTimestamp(fromTimestamp, chain as Chain));
      const endBlock = await retry(() => getBlockByTimestamp(toTimestamp, chain as Chain));
      const blocks = {
        startBlock: startBlock.block,
        endBlock: endBlock.block,
      };
      blockByChain[chain] = blocks;
      delete pendingBlockRequests[chain];
      return blocks;
    })();

    return pendingBlockRequests[chain];
  };

  const bridgesWithVolume = await Promise.all(
    bridgeNetworks.map(async (adapter) => {
      const volume = await getLast24HVolume(adapter.bridgeDbName);
      return {
        ...adapter,
        volume,
      };
    })
  );

  await PromisePool.withConcurrency(20)
    .for(bridgesWithVolume)
    .process(async (adapter) => {
      try {
        const bridgeName = adapter.bridgeDbName;
        await Promise.all(
          adapter.chains.map(async (chain) => {
            const adapterChain = normalizeAdapterChainName(chain);
            const providerChain = resolveProviderChain(chain, bridgeName);
            if (adapterChain === adapter?.destinationChain?.toLowerCase()) return;
            let startBlock;
            let endBlock;
            if (bridgeName === "ibc") {
              startBlock = await getBlockByTimestamp(fromTimestamp, providerChain as Chain, adapter, "First");
              if (!startBlock) {
                console.error(`Could not find start block for ${chain} on ${bridgeName}`);
                return;
              }
              endBlock = await getBlockByTimestamp(toTimestamp, providerChain as Chain, adapter, "Last");
              if (!endBlock) {
                console.error(`Could not find end block for ${chain} on ${bridgeName}`);
                return;
              }
            } else {
              const blocks = await getBlocksForChain(providerChain);
              startBlock = blocks.startBlock;
              endBlock = blocks.endBlock;
            }

            console.log(`Processing chain ${adapterChain} (${providerChain}) for ${bridgeName}`);

            if (!startBlock || !endBlock) {
              console.error(`Could not find transactions with blocks for ${providerChain} on ${bridgeName}`);
              return;
            }

            await runAdapterHistorical(startBlock, endBlock, adapter.id, adapterChain, true, false, "upsert");
          })
        );
      } catch (e) {
        console.error(`Failed to run adapter ${adapter.bridgeDbName}`);
        console.error(e);
      }
    });
};
