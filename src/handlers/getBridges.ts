import { IResponse, successResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getDailyBridgeVolume } from "../utils/bridgeVolume";
import { craftBridgeChainsResponse } from "./getBridgeChains";
import { secondsInDay, secondsInWeek, getCurrentUnixTimestamp } from "../utils/date";
import getAggregatedDataClosestToTimestamp from "../utils/getRecordClosestToTimestamp";
import bridgeNetworks from "../data/bridgeNetworkData";

const getBridges = async () => {
  const response = (
    await Promise.all(
      bridgeNetworks.map(async (bridgeNetwork) => {
        const { id, bridgeDbName, url, displayName, iconLink, chains, destinationChain } = bridgeNetwork;
        // can use chains to give current chain breakdown, but not needed at this time

        const currentTimestamp = getCurrentUnixTimestamp();
        const startTimestamp = currentTimestamp - 7 * secondsInDay;
        const lastWeekDailyVolume = await getDailyBridgeVolume(startTimestamp, currentTimestamp, undefined, id);

        let lastDailyVolume, dayBeforeLastVolume, lastWeeklyVolume, lastMonthlyVolume;
        if (lastWeekDailyVolume?.length) {
          const lastDailyVolumeRecord = lastWeekDailyVolume[lastWeekDailyVolume.length - 1];
          const lastTS = parseInt(lastDailyVolumeRecord.date);
          lastDailyVolume = (lastDailyVolumeRecord.depositUSD + lastDailyVolumeRecord.withdrawUSD) / 2;

          const dayBeforeLastVolumeRecord = await getAggregatedDataClosestToTimestamp(
            lastTS - secondsInDay,
            secondsInDay,
            false,
            undefined,
            id
          );
          dayBeforeLastVolume =
            Object.keys(dayBeforeLastVolumeRecord).length === 0
              ? 0
              : (dayBeforeLastVolumeRecord?.depositUSD + dayBeforeLastVolumeRecord?.withdrawUSD) / 2;
          const lastWeeklyVolumeRecord = await getAggregatedDataClosestToTimestamp(
            lastTS - secondsInWeek,
            secondsInDay,
            false,
            undefined,
            id
          );
          lastWeeklyVolume =
            Object.keys(lastWeeklyVolumeRecord).length === 0
              ? 0
              : (lastWeeklyVolumeRecord?.depositUSD + lastWeeklyVolumeRecord?.withdrawUSD) / 2;
          const lastMonthlyVolumeRecord = await getAggregatedDataClosestToTimestamp(
            lastTS - secondsInDay * 30,
            secondsInDay,
            false,
            undefined,
            id
          );

          lastMonthlyVolume =
            Object.keys(lastMonthlyVolumeRecord).length === 0
              ? 0
              : (lastMonthlyVolumeRecord?.depositUSD + lastMonthlyVolumeRecord?.withdrawUSD) / 2;
        }

        /*
        const lastWeekHourlyData = await queryAggregatedHourlyDataTimestampRange(
          startTimestamp,
          currentTimestamp,
          bridgeDbName,
        );
        if (!lastWeekHourlyData?.length) {
          return null;
        }

        // can use lastWeekHourlyData and lastHourlyRecord to provide more granular vol stats, but not needed at this time
        const lastHourlyRecord = lastWeekHourlyData[lastWeekHourlyData.length - 1];

        const lastTS = Math.floor(lastHourlyRecord.ts.getTime() / 1000)
        if (typeof lastTS !== "number") {
          return null;
        }
        */

        // can include transaction count if needed
        const dataToReturn = {
          id: id,
          name: bridgeDbName,
          displayName: displayName,
          url: url,
          icon: iconLink,
          volumePrevDay: lastDailyVolume ?? 0,
          volumePrev2Day: dayBeforeLastVolume ?? 0,
          volumePrevWeek: lastWeeklyVolume ?? 0,
          volumePrevMonth: lastMonthlyVolume ?? 0,
          chains: chains,
          destinationChain: destinationChain ?? "false",
        } as any;
        return dataToReturn;
      })
    )
  )
    .filter((bridgeNetwork) => bridgeNetwork !== null)
    .sort((a, b) => b.volumePrevDay - a.volumePrevDay);

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
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);
