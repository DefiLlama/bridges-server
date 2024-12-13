import { wrapScheduledLambda } from "../utils/wrap";
import { convertToUnixTimestamp } from "../utils/date";
import { runAggregateDataHistorical } from "../utils/aggregate";
import bridgeNetworkData from "../data/bridgeNetworkData";

export default wrapScheduledLambda(async (_event) => {
  const fourHoursAgo = convertToUnixTimestamp(new Date()) - 60 * 60 * 4;
  const now = convertToUnixTimestamp(new Date());

  const startTimestamp = fourHoursAgo;
  const endTimestamp = now;

  for (const adapter of bridgeNetworkData) {
    await runAggregateDataHistorical(startTimestamp, endTimestamp, adapter.id, false);
  }
});
