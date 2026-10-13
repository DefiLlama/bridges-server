import bridgeNetworks from "../data/bridgeNetworkData";
import { sendDiscordText } from "../utils/discord";
import { wrapScheduledLambda } from "../utils/wrap";
import { buildStaleBridgeActivity } from "../utils/staleBridgeActivity";
import { queryBridgeDailyActivity } from "../utils/wrappa/postgres/query";

const checkStaleBridges = async () => {
  const result: Record<string, Record<string, number>> = {};
  const startTs = Math.floor(Date.now() / 1000 - 60 * 60 * 24 * 7);
  const endTs = Math.floor(Date.now() / 1000);
  const currentDate = new Date();

  for (const bridge of bridgeNetworks) {
    result[bridge.bridgeDbName] = {};
  }

  try {
    const activity = await queryBridgeDailyActivity(startTs, endTs);
    const entries = buildStaleBridgeActivity(
      bridgeNetworks,
      activity.map(({ bridge_name, chain, last_active_day }) => ({
        bridgeName: bridge_name,
        chain,
        lastActiveDay: last_active_day,
      })),
      currentDate
    );

    for (const { bridge, chain, staleDays } of entries) {
      result[bridge][chain] = staleDays;
    }
  } catch (error) {
    console.error("Error querying stale bridge activity:", error);
    for (const { bridge, chain } of buildStaleBridgeActivity(bridgeNetworks, [], currentDate)) {
      result[bridge][chain] = -1;
    }
  }

  console.log("Stale bridges report (3+ days stale):");
  let hasStaleEntries = false;
  let discordMessage = "Bridges stale for 3+ days:\n";

  for (const [bridgeName, chains] of Object.entries(result)) {
    let staleChains = [];

    for (const [chain, staleDays] of Object.entries(chains)) {
      if (staleDays >= 3) {
        hasStaleEntries = true;
        staleChains.push(chain);
      }
    }

    if (staleChains.length > 0) {
      discordMessage += `${bridgeName}: [${staleChains.join(", ")}]\n`;
    }
  }

  if (!hasStaleEntries) {
    console.log("No bridges are 3 or more days stale.");
    discordMessage = "No bridges are stale for 3+ days.";
  }

  if (discordMessage !== "Bridges stale for 3+ days:\n") {
    try {
      await sendDiscordText(discordMessage);
      console.log("Discord message prepared (not sent):", discordMessage);
    } catch (error) {
      console.error("Error sending Discord message:", error);
    }
  }

  return result;
};

const handler = async () => {
  await checkStaleBridges();
};

export default wrapScheduledLambda(handler);
