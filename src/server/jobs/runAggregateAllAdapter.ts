import { getCurrentUnixTimestamp } from "../../utils/date";
import { runAggregateDataHistoricalAllAdapters } from "../../utils/aggregate";

export const runAggregateAllAdapters = async () => {
  const currentTimestamp = getCurrentUnixTimestamp();
  const startTimestamp = currentTimestamp - 86400;
  await runAggregateDataHistoricalAllAdapters(startTimestamp, currentTimestamp);
};
