import { IResponse, successResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getDailyBridgeVolume, getHourlyBridgeVolume } from "../utils/bridgeVolume";
import { craftBridgeChainsResponse } from "./getBridgeChains";
import { secondsInDay, getCurrentUnixTimestamp, secondsInHour, getTimestampAtStartOfDay } from "../utils/date";
import getAggregatedDataClosestToTimestamp from "../utils/getRecordClosestToTimestamp";
import bridgeNetworks from "../data/bridgeNetworkData";
import { normalizeChain } from "../utils/normalizeChain";
import { getLast24HVolume } from "../utils/wrappa/postgres/query";
import { sql } from "../utils/db";

const getBridges = async () => {
  const response = (
    await Promise.all(
      bridgeNetworks.map(async (bridgeNetwork) => {
        const { id, bridgeDbName, url, displayName, iconLink, chains, destinationChain } = bridgeNetwork;
        // can use chains to give chain breakdown, but not needed at this time (put in getBridge to reduce queries?)

        let lastHourlyVolume, lastDailyVolume, dayBeforeLastVolume;
        let currentDayVolume = 0;
        let weeklyVolume = 0;
        let monthlyVolume = 0;
        const startOfTheDayTs = getTimestampAtStartOfDay(getCurrentUnixTimestamp());
        const currentTimestamp = getCurrentUnixTimestamp();

        const dailyStartTimestamp = startOfTheDayTs - 30 * secondsInDay;
        const lastMonthDailyVolume = await getDailyBridgeVolume(dailyStartTimestamp, startOfTheDayTs, undefined, id);
        let lastDailyTs = 0;
        if (lastMonthDailyVolume?.length) {
          const lastDailyVolumeRecord = lastMonthDailyVolume[lastMonthDailyVolume.length - 1];
          lastDailyTs = parseInt(lastDailyVolumeRecord.date);
          lastDailyVolume = (lastDailyVolumeRecord.depositUSD + lastDailyVolumeRecord.withdrawUSD) / 2;

          const dayBeforeLastVolumeRecord = await getAggregatedDataClosestToTimestamp(
            lastDailyTs - secondsInDay,
            secondsInDay,
            false,
            undefined,
            id
          );
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

        let last24hVolume = await getLast24HVolume(bridgeDbName);

        const hourlyStartTimestamp = startOfTheDayTs - secondsInDay;
        const lastDayHourlyVolume = await getHourlyBridgeVolume(hourlyStartTimestamp, startOfTheDayTs, undefined, id);
        if (lastDayHourlyVolume?.length) {
          const lastHourlyVolumeRecord = lastDayHourlyVolume[lastDayHourlyVolume.length - 1];
          lastHourlyVolume = (lastHourlyVolumeRecord.depositUSD + lastHourlyVolumeRecord.withdrawUSD) / 2 || 0;

          lastDayHourlyVolume.map((entry) => {
            const volume = (entry.depositUSD + entry.withdrawUSD) / 2 || 0;

            currentDayVolume += volume;
          });
        }

        // can change this: gets daily vols for all chains for prev. month, but it's not returned (only last day's vol is currently needed)
        let chainDailyVolumes = {} as any;
        await Promise.all(
          chains.map(async (chain) => {
            const queryChain = normalizeChain(chain);
            let chainLastDailyVolume;
            const chainLastMonthDailyVolume = await getDailyBridgeVolume(
              dailyStartTimestamp,
              startOfTheDayTs,
              queryChain,
              id
            );
            let chainLastDailyTs = 0;
            if (chainLastMonthDailyVolume?.length) {
              const chainLastDailyVolumeRecord = chainLastMonthDailyVolume[chainLastMonthDailyVolume.length - 1];
              chainLastDailyTs = parseInt(chainLastDailyVolumeRecord.date);
              chainLastDailyVolume =
                (chainLastDailyVolumeRecord.depositUSD + chainLastDailyVolumeRecord.withdrawUSD) / 2;
            }
            chainDailyVolumes[chain] = chainLastDailyVolume ?? 0;
          })
        );

        // can include transaction count if needed
        const dataToReturn = {
          id: id,
          name: bridgeDbName,
          displayName: displayName,
          // url: url,
          icon: iconLink,
          volumePrevDay: lastDailyVolume ?? 0, // temporary, remove
          volumePrev2Day: dayBeforeLastVolume ?? 0, // temporary, remove
          lastHourlyVolume: lastHourlyVolume ?? 0,
          currentDayVolume: currentDayVolume ?? 0,
          last24hVolume: last24hVolume ?? 0,
          lastDailyVolume: lastDailyVolume ?? 0,
          dayBeforeLastVolume: dayBeforeLastVolume ?? 0,
          weeklyVolume: weeklyVolume ?? 0,
          monthlyVolume: monthlyVolume ?? 0,
          chains: chains.sort((a, b) => chainDailyVolumes[b] - chainDailyVolumes[a]),
          destinationChain: destinationChain ?? "false",
          url,
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
  const bridges = await getBridges();
  let response: any = {
    bridges: bridges,
  };
  if (event.queryStringParameters?.includeChains === "true") {
    const chainData = await craftBridgeChainsResponse();
    response.chains = chainData;
  }
  try {
    await sql.end();
  } catch (e) {
    console.error(e);
  }
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);
