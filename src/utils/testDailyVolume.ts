import bridgeNetworkData from "../data/bridgeNetworkData";
import { aggregateDailyVolume } from "../server/jobs/aggregateDailyVolume";
import { aggregateHourlyVolume } from "../server/jobs/aggregateHourlyVolume";
import { getDailyBridgeVolume } from "./bridgeVolume";

const startTs = Number(process.argv[2]);
const endTs = Number(process.argv[3]);
const bridgeName = process.argv[4];

const main = async () => {
  await aggregateHourlyVolume();
  await aggregateDailyVolume();
  const data = await getDailyBridgeVolume(
    startTs,
    endTs,
    undefined,
    bridgeNetworkData.find(({ bridgeDbName }) => bridgeDbName === bridgeName)?.id
  );
  console.log(data);
  process.exit();
};

main();
