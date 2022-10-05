import { wrapScheduledLambda } from "../utils/wrap";
import {
  queryAggregatedHourlyTimestampRange,
  queryAggregatedDailyTimestampRange,
} from "../utils/wrappa/postgres/query";
import { insertErrorRow } from "../utils/wrappa/postgres/write";
import bridgeNetworks from "../data/bridgeNetworkData";
import adapters from "../adapters";
import { getCurrentUnixTimestamp, getTimestampAtStartOfDay, secondsInDay } from "../utils/date";

export default wrapScheduledLambda(async (_event) => {
  const timestampAtStartOfDay = getTimestampAtStartOfDay(getCurrentUnixTimestamp());
  const startTimestamp = timestampAtStartOfDay - secondsInDay + 1;
  const endTimestamp = timestampAtStartOfDay;
  await Promise.all(
    bridgeNetworks.map(async (bridgeNetwork) => {
      const { bridgeDbName } = bridgeNetwork;
      const adapter = adapters[bridgeDbName];
      if (!adapter) {
        throw new Error(`Adapter for ${bridgeDbName} not found, check it is exported correctly.`);
      }
      await Promise.all(
        Object.keys(adapter).map(async (chain) => {
          const hourlyEntries = await queryAggregatedHourlyTimestampRange(
            startTimestamp,
            endTimestamp,
            bridgeDbName,
            chain
          );
          const dailyEntries = await queryAggregatedDailyTimestampRange(
            startTimestamp,
            endTimestamp,
            bridgeDbName,
            chain
          );
          console.info(bridgeDbName, hourlyEntries.length);
          console.info(bridgeDbName, dailyEntries.length);
          if (hourlyEntries.length < 24) {
            await insertErrorRow({
              ts: getCurrentUnixTimestamp() * 1000,
              target_table: "hourly_aggregated",
              keyword: "data",
              error: `Bridge ${bridgeDbName} on chain ${chain} has ${hourlyEntries.length} hourly entries from ${startTimestamp} to ${endTimestamp}`,
            });
          }
          if (!dailyEntries.length) {
            await insertErrorRow({
              ts: getCurrentUnixTimestamp() * 1000,
              target_table: "daily_aggregated",
              keyword: "data",
              error: `Bridge ${bridgeDbName} on chain ${chain} has NO daily entry for ${endTimestamp}.`,
            });
          }
        })
      );
    })
  );
});
