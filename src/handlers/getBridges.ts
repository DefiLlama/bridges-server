import { IResponse, successResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getDailyBridgeVolume, getHourlyBridgeVolume } from "../utils/bridgeVolume";
import { craftBridgeChainsResponse } from "./getBridgeChains";
import { secondsInDay, getCurrentUnixTimestamp } from "../utils/date";
import getAggregatedDataClosestToTimestamp from "../utils/getRecordClosestToTimestamp";
import bridgeNetworks from "../data/bridgeNetworkData";

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
        const currentTimestamp = getCurrentUnixTimestamp();
        const dailyStartTimestamp = currentTimestamp - 30 * secondsInDay;
        const lastMonthDailyVolume = await getDailyBridgeVolume(dailyStartTimestamp, currentTimestamp, undefined, id);
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

        const hourlyStartTimestamp = currentTimestamp - secondsInDay;
        const lastDayHourlyVolume = await getHourlyBridgeVolume(hourlyStartTimestamp, currentTimestamp, undefined, id);
        if (lastDayHourlyVolume?.length) {
          const lastHourlyVolumeRecord = lastDayHourlyVolume[lastDayHourlyVolume.length - 1];
          lastHourlyVolume = (lastHourlyVolumeRecord.depositUSD + lastHourlyVolumeRecord.withdrawUSD) / 2;

          lastDayHourlyVolume.map((entry) => {
            const volume = (entry.depositUSD + entry.withdrawUSD) / 2;
            const { date, depositTxs, withdrawTxs } = entry;
            // lastDailyTs is timestamp at 00:00 UTC of *previous* day
            if (parseInt(date) > lastDailyTs + secondsInDay) {
              currentDayVolume += volume;
            }
          });
        }

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
          lastDailyVolume: lastDailyVolume ?? 0,
          dayBeforeLastVolume: dayBeforeLastVolume ?? 0,
          weeklyVolume: weeklyVolume ?? 0,
          monthlyVolume: monthlyVolume ?? 0,
          chains: chains,
          destinationChain: destinationChain ?? "false",
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
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);
