import { Chain } from "@defillama/sdk/build/general";
import bridgeNetworkData from "../data/bridgeNetworkData";
import { wait } from "../helpers/etherscan";
import { runAdapterHistorical } from "./adapter";
import { getBlockByTimestamp } from "./blocks";
import retry from "async-retry";
import { sql } from "./db";
const startTs = Number(process.argv[2]);
const endTs = Number(process.argv[3]);
const bridgeName = process.argv[4];
const chain = process.argv[5];
const blockByChain: Record<string, { startBlock: number; endBlock: number }> = {};

async function fillAdapterHistorical(
  startTimestamp: number,
  endTimestamp: number,
  bridgeDbName: string,
  restrictChainTo?: string
) {
  if (!startTimestamp || !endTimestamp || !bridgeDbName) {
    console.error(
      "Missing parameters, please provide startTimestamp, endTimestamp and bridgeDbName. \nExample: npm run adapter 1704690402 1704949602 arbitrum"
    );
    process.exit();
  }

  const adapter = bridgeNetworkData.find((x) => x.bridgeDbName === bridgeDbName);
  if (!adapter) throw new Error("Invalid adapter");
  console.log(`Found ${bridgeDbName}`);

  const promises = Promise.all(
    adapter.chains.map(async (chain, i) => {
      let nChain;
      if (adapter.chainMapping && adapter.chainMapping[chain.toLowerCase()]) {
        nChain = adapter.chainMapping[chain.toLowerCase()];
      } else {
        nChain = chain.toLowerCase();
      }
      if (restrictChainTo && nChain !== restrictChainTo) return;
      if (nChain === adapter?.destinationChain?.toLowerCase()) return;

      console.log(`Running adapter for ${chain} for ${bridgeDbName}`);

      await wait(500 * i);
      let startBlock;
      let endBlock;
      if (bridgeDbName === "ibc") {
        startBlock = await getBlockByTimestamp(startTimestamp, nChain as Chain, adapter, "First");
        if (!startBlock) {
          console.error(`Could not find start block for ${chain} on ${bridgeDbName}`);
          return;
        }
        endBlock = await getBlockByTimestamp(endTimestamp, nChain as Chain, adapter, "Last");
        if (!endBlock) {
          console.error(`Could not find end block for ${chain} on ${bridgeDbName}`);
          return;
        }
      } else {
        if (!blockByChain[nChain]) {
          startBlock = await retry(() => getBlockByTimestamp(startTimestamp, nChain as Chain));
          endBlock = await retry(() => getBlockByTimestamp(endTimestamp, nChain as Chain));
          blockByChain[nChain] = {
            startBlock: startBlock.block,
            endBlock: endBlock.block,
          };
        } else {
          startBlock = blockByChain[nChain].startBlock;
          endBlock = blockByChain[nChain].endBlock;
        }
      }

      await runAdapterHistorical(
        startBlock.block,
        endBlock.block,
        adapter.id,
        chain.toLowerCase(),
        true,
        false,
        "upsert"
      );
    })
  );
  await promises;
  console.log(`Finished running adapter from ${startTimestamp} to ${endTimestamp} for ${bridgeDbName}`);
}

const runAllAdaptersHistorical = async (startTimestamp: number, endTimestamp: number) => {
  try {
    await Promise.all(
      bridgeNetworkData.map(async (adapter) => {
        await fillAdapterHistorical(startTimestamp, endTimestamp, adapter.bridgeDbName);
      })
    );
  } finally {
    await sql.end();
  }
};

if (bridgeName && chain) {
  fillAdapterHistorical(startTs, endTs, bridgeName, chain);
} else {
  runAllAdaptersHistorical(startTs, endTs);
}
