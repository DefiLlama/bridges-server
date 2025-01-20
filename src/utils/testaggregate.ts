import bridgeNetworkData from "../data/bridgeNetworkData";
import { runAggregateDataHistorical } from "./aggregate";
import PromisePool from "@supercharge/promise-pool";
const startTs = Number(process.argv[2]);
const endTs = Number(process.argv[3]);
const bridgeName = process.argv[4];
const chain = process.argv[5];

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
    restrictChain.forEach(async (chain: string) => {
      await runAggregateDataHistorical(startTimestamp, endTimestamp, adapter.id, true, chain);
    });
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

if (bridgeName) {
  aggregateHistorical(startTs, endTs, bridgeName, chain ? [chain] : undefined);
} else {
  runAllAdaptersHistorical(startTs, endTs);
}
