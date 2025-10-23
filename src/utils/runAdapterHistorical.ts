import { Chain } from "@defillama/sdk/build/general";
import bridgeNetworkData from "../data/bridgeNetworkData";
import { wait } from "../helpers/etherscan";
import { runAdapterHistorical } from "./adapter";
import { getBlockByTimestamp } from "./blocks";
import retry from "async-retry";
import { sql } from "./db";
import PromisePool from "@supercharge/promise-pool";

const startTs = Number(process.argv[2]);
const endTs = Number(process.argv[3]);
const bridgeName = process.argv[4];
const chain = process.argv[5];
const blockByChain: Record<string, { startBlock: number; endBlock: number }> = {};

function splitIntoDailyIntervals(startTimestamp: number, endTimestamp: number): Array<{ start: number; end: number }> {
  const intervals = [];
  const oneDay = 24 * 60 * 60;

  let currentStart = startTimestamp;

  while (currentStart < endTimestamp) {
    const startOfDay = Math.floor(currentStart / oneDay) * oneDay;
    const endOfDay = startOfDay + oneDay - 1;
    const currentEnd = Math.min(endOfDay, endTimestamp);

    intervals.push({
      start: currentStart,
      end: currentEnd,
    });

    currentStart = endOfDay + 1;
  }

  return intervals;
}

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
    await PromisePool.withConcurrency(20)
      .for(bridgeNetworkData.reverse())
      .process(async (adapter) => {
        await fillAdapterHistorical(startTimestamp, endTimestamp, adapter.bridgeDbName);
      });
  } finally {
    await sql.end();
  }
};

(async () => {
  if (bridgeName) {
    const dailyIntervals = splitIntoDailyIntervals(startTs, endTs);
    await PromisePool.withConcurrency(60)
      .for(dailyIntervals.reverse())
      .process(async (interval) => {
        await fillAdapterHistorical(interval.start, interval.end, bridgeName, chain);
      });
  } else {
    await runAllAdaptersHistorical(startTs, endTs);
  }
})();
