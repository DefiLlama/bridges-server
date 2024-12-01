import { convertToUnixTimestamp } from "../../utils/date";
import { runAggregateDataAllAdapters } from "../../utils/aggregate";

export const runAggregateAllAdapters = async () => {
  const currentDate = new Date();
  const currentTimestamp = convertToUnixTimestamp(currentDate) - 3600;
  await runAggregateDataAllAdapters(currentTimestamp, true);
  const currentHour = currentDate.getUTCHours();
  if (currentHour === 0) {
    await runAggregateDataAllAdapters(currentTimestamp, false);
  }
};
