import bridgeNetworkData from "../data/bridgeNetworkData";
import { getDailyBridgeVolume } from "./bridgeVolume";

const startTs = Number(process.argv[2]);
const endTs = Number(process.argv[3]);
const bridgeName = process.argv[4];

getDailyBridgeVolume(
  startTs,
  endTs,
  undefined,
  bridgeNetworkData.find(({ bridgeDbName }) => bridgeDbName === bridgeName)?.id
).then((data) => {
  console.log(data);
  process.exit();
});
