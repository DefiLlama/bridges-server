import { getHourlyBridgeVolume, getDailyBridgeVolume } from "./bridgeVolume";

export default async function getAggregatedDataClosestToTimestamp(
  timestamp: number,
  searchWidth: number,
  hourly?: boolean,
  chain?: string,
  bridgeNetworkId?: number,
) {
  const volumeFn = hourly
    ? getHourlyBridgeVolume
    : getDailyBridgeVolume;
  const aggregatedData = await volumeFn(
    timestamp - searchWidth,
    timestamp + searchWidth,
    chain,
    bridgeNetworkId
  );

  if (!aggregatedData.length) {
    return {};
  }

  let closestRecord = aggregatedData[0];
  for (const record of aggregatedData) {
    const closestRecordTs = closestRecord.date;
    const ts = record.date;
    if (Math.abs(ts - timestamp) < Math.abs(closestRecordTs - timestamp)) {
      closestRecord = record;
    }
  }
  return closestRecord;
}
