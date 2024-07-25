import bridgeNetworks from "../data/bridgeNetworkData";
import { sendDiscordText } from "../utils/discord";
import { wrapScheduledLambda } from "../utils/wrap";
import { queryAggregatedDailyTimestampRange } from "../utils/wrappa/postgres/query";

const checkStaleBridges = async () => {
  const result: Record<string, Record<string, number>> = {};
  const startTs = Math.floor(Date.now() / 1000 - 60 * 60 * 24 * 7);
  const endTs = Math.floor(Date.now() / 1000);
  const currentDate = new Date();

  const queryPromises: Promise<void>[] = [];

  for (const bridge of bridgeNetworks) {
    result[bridge.bridgeDbName] = {};

    for (const chain of bridge.chains) {
      const queryPromise = (async () => {
        if (bridge.destinationChain === chain) return;
        try {
          const volume = await queryAggregatedDailyTimestampRange(
            startTs,
            endTs,
            chain?.toLowerCase(),
            bridge.bridgeDbName
          );
          if (volume.length === 0) {
            result[bridge.bridgeDbName][chain] = 7;
          } else {
            let lastActiveDay = new Date(0);

            for (const day of volume) {
              if (day.total_deposit_txs > 0 || day.total_withdrawal_txs > 0) {
                lastActiveDay = new Date(day.ts);
              }
            }

            if (lastActiveDay.getTime() === 0) {
              result[bridge.bridgeDbName][chain] = 7;
            } else {
              const staleDays = Math.floor((currentDate.getTime() - lastActiveDay.getTime()) / (1000 * 3600 * 24));
              result[bridge.bridgeDbName][chain] = staleDays;
            }
          }
        } catch (error) {
          console.error(`Error querying ${bridge.bridgeDbName} on ${chain}:`, error);
          result[bridge.bridgeDbName][chain] = -1;
        }
      })();

      queryPromises.push(queryPromise);
    }
  }

  await Promise.all(queryPromises);

  console.log("Stale bridges report (3+ days stale):");
  let hasStaleEntries = false;
  let discordMessage = "Bridges stale for more than 3 days:\n";

  for (const [bridgeName, chains] of Object.entries(result)) {
    let bridgeHasStaleEntries = false;
    let bridgeMessage = `\nBridge: ${bridgeName}\n`;

    for (const [chain, staleDays] of Object.entries(chains)) {
      if (staleDays >= 3 || staleDays === -1) {
        hasStaleEntries = true;
        bridgeHasStaleEntries = true;
        const statusMessage = staleDays === -1 ? "Error occurred" : `${staleDays} days stale`;
        bridgeMessage += `  ${chain}: ${statusMessage}\n`;

        if (staleDays > 3) {
          discordMessage += `${bridgeName} on ${chain}: ${staleDays} days\n`;
        }
      }
    }

    if (bridgeHasStaleEntries) {
      console.log(bridgeMessage);
    }
  }

  if (!hasStaleEntries) {
    console.log("No bridges are 3 or more days stale.");
  }

  if (discordMessage !== "Bridges stale for more than 3 days:\n") {
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
