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
const sequential = process.argv.includes("--sequential");
const chain = process.argv[5] && !process.argv[5].startsWith("--") ? process.argv[5] : undefined;
let shuttingDown = false;

process.on("SIGINT", () => {
  if (shuttingDown) {
    console.log("\nForce shutdown.");
    process.exit(1);
  }
  shuttingDown = true;
  console.log("\nGraceful shutdown requested. Waiting for in-flight tasks to finish...");
});

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
  if (shuttingDown) return;
  if (!startTimestamp || !endTimestamp || !bridgeDbName) {
    console.error(
      "Missing parameters, please provide startTimestamp, endTimestamp and bridgeDbName. \nExample: npm run adapter 1704690402 1704949602 arbitrum"
    );
    process.exit();
  }

  const adapter = bridgeNetworkData.find((x) => x.bridgeDbName === bridgeDbName);
  if (!adapter) throw new Error("Invalid adapter");
  const startDate = new Date(startTimestamp * 1000).toISOString().slice(0, 10);
  const endDate = new Date(endTimestamp * 1000).toISOString().slice(0, 10);
  console.log(`[${bridgeDbName}] Processing ${startDate} to ${endDate} (${startTimestamp}-${endTimestamp})${restrictChainTo ? ` chain=${restrictChainTo}` : ""}`);

  const blockByChain: Record<string, { startBlock: number; endBlock: number }> = {};

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
          console.error(`[${bridgeDbName}] Could not find start block for ${chain}`);
          return;
        }
        endBlock = await getBlockByTimestamp(endTimestamp, nChain as Chain, adapter, "Last");
        if (!endBlock) {
          console.error(`[${bridgeDbName}] Could not find end block for ${chain}`);
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
          console.log(`[${bridgeDbName}] ${nChain} blocks: ${startBlock.block} -> ${endBlock.block}`);
        } else {
          startBlock = blockByChain[nChain].startBlock;
          endBlock = blockByChain[nChain].endBlock;
        }
      }

      console.log(`[${bridgeDbName}] Running ${chain.toLowerCase()} (${nChain}) blocks ${startBlock.block}-${endBlock.block}`);
      await runAdapterHistorical(
        startBlock.block,
        endBlock.block,
        adapter.id,
        chain.toLowerCase(),
        true,
        false,
        "upsert"
      );
      console.log(`[${bridgeDbName}] Done ${chain.toLowerCase()} blocks ${startBlock.block}-${endBlock.block}`);
    })
  );
  await promises;
  console.log(`[${bridgeDbName}] Finished ${startDate} to ${endDate}`);
}

const runAllAdaptersHistorical = async (startTimestamp: number, endTimestamp: number) => {
  try {
    await PromisePool.withConcurrency(20)
      .for(bridgeNetworkData.reverse())
      .process(async (adapter) => {
        if (shuttingDown) return;
        await fillAdapterHistorical(startTimestamp, endTimestamp, adapter.bridgeDbName);
      });
  } finally {
    await sql.end();
  }
};

(async () => {
  try {
    if (bridgeName) {
      const dailyIntervals = splitIntoDailyIntervals(startTs, endTs).reverse();
      if (sequential) {
        for (const interval of dailyIntervals) {
          if (shuttingDown) break;
          await fillAdapterHistorical(interval.start, interval.end, bridgeName, chain);
        }
      } else {
        await PromisePool.withConcurrency(60)
          .for(dailyIntervals)
          .process(async (interval) => {
            if (shuttingDown) return;
            await fillAdapterHistorical(interval.start, interval.end, bridgeName, chain);
          });
      }
    } else {
      await runAllAdaptersHistorical(startTs, endTs);
    }
  } finally {
    if (shuttingDown) console.log("Shutdown complete.");
    await sql.end();
  }
})();
