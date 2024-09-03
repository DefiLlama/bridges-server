import { wrapScheduledLambda } from "../utils/wrap";
import { convertToUnixTimestamp } from "../utils/date";
import { runAggregateDataHistorical } from "../utils/aggregate";
import bridgeNetworkData from "../data/bridgeNetworkData";
import { sql } from "../utils/db";

export default wrapScheduledLambda(async (_event) => {
  const currentDate = new Date();
  const yesterdayDate = new Date(currentDate);
  yesterdayDate.setDate(currentDate.getDate() - 1);

  const startOfYesterday = new Date(yesterdayDate.setUTCHours(0, 0, 0, 0));
  const endOfYesterday = new Date(yesterdayDate.setUTCHours(23, 59, 59, 999));

  const startTimestamp = convertToUnixTimestamp(startOfYesterday);
  const endTimestamp = convertToUnixTimestamp(endOfYesterday);

  console.log(`Aggregating data for ${startOfYesterday.toISOString()} to ${endOfYesterday.toISOString()}`);

  for (const adapter of bridgeNetworkData) {
    await runAggregateDataHistorical(startTimestamp, endTimestamp, adapter.id, false);
  }
  try {
    await sql.end();
  } catch (e) {
    console.error(e);
  }
});
