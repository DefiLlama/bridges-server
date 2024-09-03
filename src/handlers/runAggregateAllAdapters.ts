import { wrapScheduledLambda } from "../utils/wrap";
import { convertToUnixTimestamp } from "../utils/date";
import { runAggregateDataAllAdapters } from "../utils/aggregate";
import { sql } from "../utils/db";

export default wrapScheduledLambda(async (_event) => {
  const currentDate = new Date();
  const currentTimestamp = convertToUnixTimestamp(currentDate);
  await runAggregateDataAllAdapters(currentTimestamp, true);
  const currentHour = currentDate.getUTCHours();
  if (currentHour === 0) {
    await runAggregateDataAllAdapters(currentTimestamp, false);
  }
  try {
    await sql.end();
  } catch (e) {
    console.error(e);
  }
});
