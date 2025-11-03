import { IResponse, successResponse, errorResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getDailyBridgeVolume, getHourlyBridgeVolume } from "../utils/bridgeVolume";
import { secondsInDay, getCurrentUnixTimestamp, secondsInHour } from "../utils/date";
import getAggregatedDataClosestToTimestamp from "../utils/getRecordClosestToTimestamp";
import { importBridgeNetwork } from "../data/importBridgeNetwork";
import { normalizeChain, getChainDisplayName } from "../utils/normalizeChain";
import { getLast24HVolume } from "../utils/wrappa/postgres/query";

const getBridge = async (bridgeNetworkId?: number) => {
  const bridgeNetwork = importBridgeNetwork(undefined, bridgeNetworkId);

  if (!bridgeNetwork) {
    return errorResponse({
      message: "Bridge ID not found.",
    });
  }
  const { id, bridgeDbName, url, displayName, iconLink, chains, destinationChain } = bridgeNetwork;
  let chainBreakdown = {} as any;
  await Promise.all(
    [...chains, "all"].map(async (chain) => {
      const queryChain = chain === "all" ? undefined : normalizeChain(chain);

      let lastHourlyVolume, lastDailyVolume, dayBeforeLastVolume;
      let currentDayVolume = 0;
      let weeklyVolume = 0;
      let monthlyVolume = 0;
      let dayBeforeLastTxs = {} as any;
      let prevDayTxs = {} as any;
      let lastHourlyTxs = {} as any;
      let currentDayTxs = {} as any;
      let weeklyTxs = {} as any;
      let monthlyTxs = {} as any;
      const currentTimestamp = getCurrentUnixTimestamp();
      const dailyStartTimestamp = currentTimestamp - 30 * secondsInDay;
      const lastMonthDailyVolume = await getDailyBridgeVolume(dailyStartTimestamp, currentTimestamp, queryChain, id);
      let last24hVolume = await getLast24HVolume(bridgeDbName);

      let lastDailyTs = 0;
      if (lastMonthDailyVolume?.length) {
        const lastDailyVolumeRecord = lastMonthDailyVolume[lastMonthDailyVolume.length - 1];
        lastDailyTs = parseInt(lastDailyVolumeRecord.date);
        lastDailyVolume = (lastDailyVolumeRecord.depositUSD + lastDailyVolumeRecord.withdrawUSD) / 2;
        prevDayTxs = { deposits: lastDailyVolumeRecord.depositTxs, withdrawals: lastDailyVolumeRecord.withdrawTxs };

        const dayBeforeLastVolumeRecord = await getAggregatedDataClosestToTimestamp(
          lastDailyTs - secondsInDay,
          secondsInDay,
          false,
          queryChain,
          id
        );
        if (dayBeforeLastVolumeRecord && Object.keys(dayBeforeLastVolumeRecord).length > 0) {
          dayBeforeLastVolume = (dayBeforeLastVolumeRecord.depositUSD + dayBeforeLastVolumeRecord?.withdrawUSD) / 2;
          dayBeforeLastTxs = {
            deposits: dayBeforeLastVolumeRecord.depositTxs,
            withdrawals: dayBeforeLastVolumeRecord.withdrawTxs,
          };
        }
        lastMonthDailyVolume.map((entry, i) => {
          const volume = (entry.depositUSD + entry.withdrawUSD) / 2;
          const { depositTxs, withdrawTxs } = entry;
          monthlyVolume += volume;
          monthlyTxs.deposits = (monthlyTxs.deposits ?? 0) + depositTxs;
          monthlyTxs.withdrawals = (monthlyTxs.withdrawals ?? 0) + withdrawTxs;
          if (i < 7) {
            weeklyVolume += volume;
            weeklyTxs.deposits = (weeklyTxs.deposits ?? 0) + depositTxs;
            weeklyTxs.withdrawals = (weeklyTxs.withdrawals ?? 0) + withdrawTxs;
          }
        });
      }

      const hourlyStartTimestamp = currentTimestamp - secondsInDay;
      const lastDayHourlyVolume = await getHourlyBridgeVolume(hourlyStartTimestamp, currentTimestamp, queryChain, id);
      if (lastDayHourlyVolume?.length) {
        const lastHourlyVolumeRecord = lastDayHourlyVolume[lastDayHourlyVolume.length - 1];
        const { date } = lastHourlyVolumeRecord;
        if (Math.abs(currentTimestamp - date) < 2 * secondsInHour) {
          lastHourlyVolume = (lastHourlyVolumeRecord.depositUSD + lastHourlyVolumeRecord.withdrawUSD) / 2;
          lastHourlyTxs = {
            deposits: lastHourlyVolumeRecord.depositTxs,
            withdrawals: lastHourlyVolumeRecord.withdrawTxs,
          };
        }

        lastDayHourlyVolume.map((entry) => {
          const volume = (entry.depositUSD + entry.withdrawUSD) / 2;
          const { date, depositTxs, withdrawTxs } = entry;
          // lastDailyTs is timestamp at 00:00 UTC of *previous* day
          if (parseInt(date) > lastDailyTs + secondsInDay) {
            currentDayVolume += volume;
            currentDayTxs.deposits = (currentDayTxs.deposits ?? 0) + depositTxs;
            currentDayTxs.withdrawals = (currentDayTxs.withdrawals ?? 0) + withdrawTxs;
          }
        });
      }
      chainBreakdown[chain] = {
        lastHourlyVolume: lastHourlyVolume ?? 0,
        currentDayVolume: currentDayVolume ?? 0,
        lastDailyVolume: lastDailyVolume ?? 0,
        dayBeforeLastVolume: dayBeforeLastVolume ?? 0,
        weeklyVolume: weeklyVolume ?? 0,
        monthlyVolume: monthlyVolume ?? 0,
        last24hVolume: last24hVolume ?? 0,
        lastHourlyTxs: Object.keys(lastHourlyTxs).length ? lastHourlyTxs : { deposits: 0, withdrawals: 0 },
        currentDayTxs: Object.keys(currentDayTxs).length ? currentDayTxs : { deposits: 0, withdrawals: 0 },
        prevDayTxs: Object.keys(prevDayTxs).length ? prevDayTxs : { deposits: 0, withdrawals: 0 },
        dayBeforeLastTxs: Object.keys(dayBeforeLastTxs).length ? dayBeforeLastTxs : { deposits: 0, withdrawals: 0 },
        weeklyTxs: Object.keys(weeklyTxs).length ? weeklyTxs : { deposits: 0, withdrawals: 0 },
        monthlyTxs: Object.keys(monthlyTxs).length ? monthlyTxs : { deposits: 0, withdrawals: 0 },
      };
    })
  );

  const {
    lastHourlyVolume,
    currentDayVolume,
    lastDailyVolume,
    dayBeforeLastVolume,
    weeklyVolume,
    monthlyVolume,
    lastHourlyTxs,
    currentDayTxs,
    prevDayTxs,
    dayBeforeLastTxs,
    weeklyTxs,
    monthlyTxs,
  } = chainBreakdown["all"];

  if (destinationChain) {
    chainBreakdown[destinationChain] = chainBreakdown["all"];
  }
  delete chainBreakdown["all"];

  const remappedBreakdown: any = {};
  Object.entries(chainBreakdown).forEach(([k, v]) => {
    const display = getChainDisplayName(normalizeChain(k), true);
    remappedBreakdown[display] = v;
  });

  const destinationChainDisplay = destinationChain
    ? getChainDisplayName(normalizeChain(destinationChain), true)
    : "false";

  const response = {
    id: id,
    name: bridgeDbName,
    displayName: displayName,
    // url: url,
    lastHourlyVolume: lastHourlyVolume ?? 0,
    currentDayVolume: currentDayVolume ?? 0,
    lastDailyVolume: lastDailyVolume ?? 0,
    dayBeforeLastVolume: dayBeforeLastVolume ?? 0,
    weeklyVolume: weeklyVolume ?? 0,
    monthlyVolume: monthlyVolume ?? 0,
    lastHourlyTxs: Object.keys(lastHourlyTxs).length ? lastHourlyTxs : { deposits: 0, withdrawals: 0 },
    currentDayTxs: Object.keys(currentDayTxs).length ? currentDayTxs : { deposits: 0, withdrawals: 0 },
    prevDayTxs: Object.keys(prevDayTxs).length ? prevDayTxs : { deposits: 0, withdrawals: 0 },
    dayBeforeLastTxs: Object.keys(dayBeforeLastTxs).length ? dayBeforeLastTxs : { deposits: 0, withdrawals: 0 },
    weeklyTxs: Object.keys(weeklyTxs).length ? weeklyTxs : { deposits: 0, withdrawals: 0 },
    monthlyTxs: Object.keys(monthlyTxs).length ? monthlyTxs : { deposits: 0, withdrawals: 0 },
    chainBreakdown: remappedBreakdown,
    destinationChain: destinationChainDisplay,
  } as any;

  return response;
};

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const bridgeNetworkId = parseInt(event.pathParameters?.id ?? "0");
  const response = await getBridge(bridgeNetworkId);
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);
