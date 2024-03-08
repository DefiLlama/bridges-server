import bridgeNetworkData from "../data/bridgeNetworkData";
import { runAggregateDataHistorical } from "./aggregate";

const startTs = Number(process.argv[2]);
const endTs = Number(process.argv[3]);
const bridgeName = process.argv[4];

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

aggregateHistorical(startTs, endTs, bridgeName);
