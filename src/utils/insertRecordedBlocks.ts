import recordedBlocksRecord from "./recordedBlocks.json";
import adapters from "../adapters";
import { lookupBlock } from "@defillama/sdk/build/util";
import { Chain } from "@defillama/sdk/build/general";
import bridgeNetworks from "../data/bridgeNetworkData";
import { importBridgeNetwork } from "../data/importBridgeNetwork";
const FileSystem = require("fs");

const insertRecordedBlocks = async (adapterName: string, startTimestamp: number, endTimestamp: number) => {
  let recordedBlocks = recordedBlocksRecord as { [adapterChain: string]: { startBlock: number; endBlock: number } };
  const adapter = await adapters[adapterName];
  if (!adapter) {
    throw new Error(`Adapter for ${adapterName} not found, check it is exported correctly.`);
  }
  const bridgeNetwork = importBridgeNetwork(adapterName)!;
  const blockPromises = Promise.all(
    Object.keys(adapter).map(async (chain) => {
      const chainContractsAreOn = bridgeNetwork.chainMapping?.[chain as Chain]
      ? bridgeNetwork.chainMapping?.[chain as Chain]
      : chain;
      if (recordedBlocks[`${adapterName}:${chain}`]) {
        console.info(`Adapter ${adapterName} has recorded blocks entry on chain ${chain}, skipping.`);
      } else {
        const startBlock = (await lookupBlock(startTimestamp, { chain: chainContractsAreOn as Chain })).block;
        const endBlock = (await lookupBlock(endTimestamp, { chain: chainContractsAreOn as Chain })).block;
        if (!(startBlock && endBlock)) {
          throw new Error(`Could not get blocks for chain ${chain}.`);
        }
        recordedBlocks[`${adapterName}:${chain}`] = {
          startBlock: startBlock,
          endBlock: endBlock,
        };
      }
    })
  );
  await blockPromises;
  FileSystem.writeFile("recordedBlocks.json", JSON.stringify(recordedBlocks), (error: any) => {
    if (error) throw error;
  });
};

insertRecordedBlocks("polynetwork", 1661904000, 1668618000);
