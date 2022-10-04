import {
  IResponse,
  successResponse,
} from "../utils/lambda-response";
import wrap from "../utils/wrap";
import {
  secondsInDay,
  secondsInWeek,
  convertToUnixTimestamp,
} from "../utils/date";
import {
  queryAggregatedHourlyTimestampRange,
  queryAggregatedDailyTimestampRange,
} from "../utils/wrappa/postgres/query";
import getAggregatedDataClosestToTimestamp from "../utils/getRecordClosestToTimestamp";
import bridgeNetworks from "../data/bridgeNetworkData";

const getBridges = async () => {
  const response = (
    await Promise.all(
      bridgeNetworks.map(async (bridgeNetwork) => {
        const { id, bridgeDbName, displayName, chains } = bridgeNetwork;
        // can use chains to give current chain breakdown, but not needed at this time

        const currentTimestamp = Math.floor(Date.now() / 1000);
        const startTimestamp = currentTimestamp - 7 * secondsInDay;
        const lastWeekDailyData = await queryAggregatedDailyTimestampRange(
          startTimestamp,
          currentTimestamp,
          bridgeDbName
        );
        if (!lastWeekDailyData?.length) {
          return null;
        }

        const lastRecord = lastWeekDailyData[lastWeekDailyData.length - 1];

        const lastTS = Math.floor(lastRecord.ts.getTime() / 1000);
        if (typeof lastTS !== "number") {
          return null;
        }

        const lastDailyVolumeRecord = {
          date: convertToUnixTimestamp(lastRecord.ts).toString(),
          depositUSD: parseFloat(lastRecord.total_deposited_usd),
          withdrawUSD: parseFloat(lastRecord.total_withdrawn_usd),
          depositTxs: lastRecord.total_deposit_txs,
          withdrawTxs: lastRecord.total_withdrawal_txs,
        };
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

        const dayBeforeLastVolumeRecord =
          await getAggregatedDataClosestToTimestamp(
            lastTS - secondsInDay,
            secondsInDay,
            false,
            undefined,
            id
          );
        const lastWeeklyVolumeRecord =
          await getAggregatedDataClosestToTimestamp(
            lastTS - secondsInWeek,
            secondsInDay,
            false,
            undefined,
            id
          );
        const lastMonthlyVolumeRecord =
          await getAggregatedDataClosestToTimestamp(
            lastTS - secondsInDay * 30,
            secondsInDay,
            false,
            undefined,
            id
          );

        const dataToReturn = {
          id: id,
          name: displayName,
          volumePrevDay: lastDailyVolumeRecord,
          volumePrev2Day: dayBeforeLastVolumeRecord,
          volumePrevWeek: lastWeeklyVolumeRecord,
          volumePrevMonth: lastMonthlyVolumeRecord,
        } as any;
        return dataToReturn;
      })
    )
  )
    .filter((bridgeNetwork) => bridgeNetwork !== null)
    .sort((a, b) => b.volumePrevDay - a.volumePrevDay);
  return response;
};

const handler = async (): Promise<IResponse> => {
  const response = await getBridges();
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);
