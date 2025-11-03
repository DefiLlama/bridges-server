import { IResponse, successResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getDailyBridgeVolume } from "../utils/bridgeVolume";
import { craftBridgeChainsResponse } from "./getBridgeChains";
import { secondsInDay, getCurrentUnixTimestamp, getTimestampAtStartOfDay } from "../utils/date";
import bridgeNetworks from "../data/bridgeNetworkData";
import { normalizeChain, getChainDisplayName } from "../utils/normalizeChain";
import { getLast24HVolume } from "../utils/wrappa/postgres/query";

const getBridges = async () => {
  const response = (
    await Promise.all(
      bridgeNetworks.map(async (bridgeNetwork) => {
        const { id, bridgeDbName, url, displayName, iconLink, chains, destinationChain, slug } = bridgeNetwork;
        // can use chains to give chain breakdown, but not needed at this time (put in getBridge to reduce queries?)

        let lastHourlyVolume, lastDailyVolume, dayBeforeLastVolume;
        let weeklyVolume = 0;
        let monthlyVolume = 0;
        const startOfTheDayTs = getTimestampAtStartOfDay(getCurrentUnixTimestamp());
        const dailyStartTimestamp = startOfTheDayTs - 30 * secondsInDay;
        const [lastMonthDailyVolume, last24hVolume] = await Promise.all([
          getDailyBridgeVolume(dailyStartTimestamp, startOfTheDayTs, undefined, id),
          getLast24HVolume(bridgeDbName),
        ]);

        let lastDailyTs = 0;
        if (lastMonthDailyVolume?.length) {
          const lastDailyVolumeRecord = lastMonthDailyVolume[lastMonthDailyVolume.length - 1];
          lastDailyTs = parseInt(lastDailyVolumeRecord.date);
          lastDailyVolume = (lastDailyVolumeRecord.depositUSD + lastDailyVolumeRecord.withdrawUSD) / 2;

          const dayBeforeLastVolumeRecord = lastMonthDailyVolume[lastMonthDailyVolume.length - 2];
          if (dayBeforeLastVolumeRecord && Object.keys(dayBeforeLastVolumeRecord).length > 0) {
            dayBeforeLastVolume = (dayBeforeLastVolumeRecord.depositUSD + dayBeforeLastVolumeRecord?.withdrawUSD) / 2;
          }
          lastMonthDailyVolume.map((entry, i) => {
            const volume = (entry.depositUSD + entry.withdrawUSD) / 2;
            monthlyVolume += volume;
            if (i > lastMonthDailyVolume.length - 8) {
              weeklyVolume += volume;
            }
          });
        }

        // can include transaction count if needed
        const normalizedChains = (chains || []).map((c) =>
          getChainDisplayName(normalizeChain(c), true)
        );
        const destinationChainDisplay = destinationChain
          ? getChainDisplayName(normalizeChain(destinationChain), true)
          : "false";
        const dataToReturn = {
          id: id,
          name: bridgeDbName,
          displayName: displayName,
          // url: url,
          icon: iconLink,
          volumePrevDay: last24hVolume ?? 0,
          volumePrev2Day: dayBeforeLastVolume ?? 0,
          lastHourlyVolume: lastHourlyVolume ?? 0,
          last24hVolume: last24hVolume ?? 0,
          lastDailyVolume: last24hVolume ?? 0,
          dayBeforeLastVolume: dayBeforeLastVolume ?? 0,
          weeklyVolume: weeklyVolume ?? 0,
          monthlyVolume: monthlyVolume ?? 0,
          chains: normalizedChains,
          destinationChain: destinationChainDisplay,
          url,
          slug,
        } as any;
        return dataToReturn;
      })
    )
  )
    .filter((bridgeNetwork) => bridgeNetwork !== null)
    .sort((a, b) => b.lastDailyVolume - a.lastDailyVolume);

  return response;
};

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const includeChains = event.queryStringParameters?.includeChains === "true";
  const promises = [getBridges()];
  if (includeChains) {
    promises.push(craftBridgeChainsResponse());
  }
  const [bridges, chainData] = await Promise.all(promises);
  let response: any = {
    bridges: bridges,
  };
  if (includeChains) {
    response.chains = chainData;
  }
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);
