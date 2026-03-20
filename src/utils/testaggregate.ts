import bridgeNetworkData from "../data/bridgeNetworkData";
import { runAggregateDataHistorical } from "./aggregate";
import { sql } from "./db";
import PromisePool from "@supercharge/promise-pool";
const startTs = Number(process.argv[2]);
const endTs = Number(process.argv[3]);
const bridgeName = process.argv[4];
const chain = process.argv[5];

let shuttingDown = false;

process.on("SIGINT", () => {
  if (shuttingDown) {
    console.log("\nForce shutdown.");
    process.exit(1);
  }
  shuttingDown = true;
  console.log("\nGraceful shutdown requested. Finishing in-flight work...");
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

async function aggregateHistorical(
  startTimestamp: number,
  endTimestamp: number,
  bridgeDbName: string,
  restrictChain?: string[]
) {
  if (!startTimestamp || !endTimestamp || !bridgeDbName) {
    console.error(
      "Missing parameters, please provide startTimestamp, endTimestamp and bridgeDbName. \nExample: npm run aggregate 1704690402 1704949602 arbitrum"
    );
    process.exit();
  }

  const adapter = bridgeNetworkData.find((x) => x.bridgeDbName === bridgeDbName);
  if (!adapter) throw new Error("Invalid adapter");
  console.log(`Found ${bridgeDbName}`);
  if (restrictChain) {
    for (const chain of restrictChain) {
      await runAggregateDataHistorical(startTimestamp, endTimestamp, adapter.id, true, chain);
    }
  } else {
    await runAggregateDataHistorical(startTimestamp, endTimestamp, adapter.id, true, restrictChain);
  }
}
const runAllAdaptersHistorical = async (startTimestamp: number, endTimestamp: number) => {
  await PromisePool.withConcurrency(5)
    .for(bridgeNetworkData)
    .process(async (adapter) => {
      await aggregateHistorical(startTimestamp, endTimestamp, adapter.bridgeDbName);
    });
};

(async () => {
  try {
    if (bridgeName) {
      const dailyIntervals = splitIntoDailyIntervals(startTs, endTs);
      await PromisePool.withConcurrency(60)
        .for(dailyIntervals.reverse())
        .process(async (interval) => {
          if (shuttingDown) return;
          await aggregateHistorical(interval.start, interval.end, bridgeName, chain ? [chain] : undefined);
        });
    } else {
      await runAllAdaptersHistorical(startTs, endTs);
    }
    console.log(shuttingDown ? "\nStopped early due to shutdown." : "\nDone.");
  } catch (e: any) {
    console.error("Fatal error:", e.message);
  } finally {
    try {
      await sql.end({ timeout: 5 });
    } catch {}
    process.exit(0);
  }
})();
