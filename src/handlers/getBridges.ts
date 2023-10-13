import { IResponse, successResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getDailyBridgeVolume, getHourlyBridgeVolume } from "../utils/bridgeVolume";
import { craftBridgeChainsResponse } from "./getBridgeChains";
import { secondsInDay, getCurrentUnixTimestamp, secondsInHour } from "../utils/date";
import getAggregatedDataClosestToTimestamp from "../utils/getRecordClosestToTimestamp";
import bridgeNetworks from "../data/bridgeNetworkData";
import { normalizeChain } from "../utils/normalizeChain";

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
              currentTimestamp,
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
          lastDailyVolume: lastDailyVolume ?? 0,
          dayBeforeLastVolume: dayBeforeLastVolume ?? 0,
          weeklyVolume: weeklyVolume ?? 0,
          monthlyVolume: monthlyVolume ?? 0,
          chains: chains.sort((a, b) => chainDailyVolumes[b] - chainDailyVolumes[a]),
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
