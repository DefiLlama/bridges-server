import { getTimestampAtStartOfDay, secondsInDay, convertToUnixTimestamp } from "./date";
import {
  queryAggregatedDailyTimestampRange,
  queryAggregatedHourlyTimestampRange,
} from "./wrappa/postgres/query";
import bridgeNetworkData from "../data/bridgeNetworkData";

interface IAggregatedData {
  bridge_id: string;
  ts: Date;
  total_tokens_deposited: string[];
  total_tokens_withdrawn: string[];
  total_deposited_usd: string;
  total_withdrawn_usd: string;
  total_deposit_txs: number;
  total_withdrawal_txs: number;
  total_address_deposited: string[];
  total_address_withdrawn: string[];
}

// FIX how adapter data is imported here and throughout
export const getDailyBridgeVolume = async (
  startTimestamp?: number,
  endTimestamp?: number,
  chain?: string,
  bridgeNetworkId?: number
) => {
  let bridgeDbName;
  if (bridgeNetworkId) {
    const bridgeNetwork = bridgeNetworkData[bridgeNetworkId - 1];
    if (!bridgeNetwork) {
      throw new Error(
        "Invalid bridgeNetworkId entered for getting daily bridge volume."
      );
    }
    ({ bridgeDbName } = bridgeNetwork);
  }

  const currentTimestamp = convertToUnixTimestamp(new Date());
  const dailyStartTimestamp = startTimestamp ? startTimestamp : 0;
  const dailyEndTimestamp = endTimestamp ? endTimestamp : currentTimestamp;
  const historicalDailyData = await queryAggregatedDailyTimestampRange(
    dailyStartTimestamp,
    dailyEndTimestamp,
    chain,
    bridgeDbName
  );

  const timestampAtStartOfDay = getTimestampAtStartOfDay(currentTimestamp);
  let currentDayHourlyData = [] as IAggregatedData[];
  if (!(endTimestamp && endTimestamp < timestampAtStartOfDay)) {
    const hourlyStartTimestamp = timestampAtStartOfDay;
    const hourlyEndTimestamp = hourlyStartTimestamp + secondsInDay;
    currentDayHourlyData = await queryAggregatedHourlyTimestampRange(
      hourlyStartTimestamp,
      hourlyEndTimestamp,
      chain,
      bridgeDbName
    );
  }

  let historicalDailySums = {} as { [timestamp: string]: any };
  historicalDailyData.map((dailyData) => {
    const {
      ts,
      total_deposited_usd,
      total_withdrawn_usd,
      total_deposit_txs,
      total_withdrawal_txs,
    } = dailyData;
    const timestamp = convertToUnixTimestamp(ts);
    historicalDailySums[timestamp] = historicalDailySums[timestamp] || {};
    historicalDailySums[timestamp].depositUSD =
      (historicalDailySums[timestamp].depositUSD ?? 0) +
      parseFloat(total_deposited_usd);
    historicalDailySums[timestamp].withdrawUSD =
      (historicalDailySums[timestamp].withdrawUSD ?? 0) +
      parseFloat(total_withdrawn_usd);
    historicalDailySums[timestamp].depositTxs =
      (historicalDailySums[timestamp].depositTxs ?? 0) + total_deposit_txs;
    historicalDailySums[timestamp].withdrawTxs =
      (historicalDailySums[timestamp].withdrawTxs ?? 0) + total_withdrawal_txs;
  });

  if (currentDayHourlyData?.length) {
    const lastDailyTimestamp = getTimestampAtStartOfDay(currentTimestamp);
    historicalDailySums[lastDailyTimestamp] =
      historicalDailySums[lastDailyTimestamp] || {};
    currentDayHourlyData.map((hourlyData) => {
      const {
        total_deposited_usd,
        total_withdrawn_usd,
        total_deposit_txs,
        total_withdrawal_txs,
      } = hourlyData;
      historicalDailySums[lastDailyTimestamp].depositUSD =
        (historicalDailySums[lastDailyTimestamp].depositUSD ?? 0) +
        parseFloat(total_deposited_usd);
      historicalDailySums[lastDailyTimestamp].withdrawUSD =
        (historicalDailySums[lastDailyTimestamp].withdrawUSD ?? 0) +
        parseFloat(total_withdrawn_usd);
      historicalDailySums[lastDailyTimestamp].depositTxs =
        (historicalDailySums[lastDailyTimestamp].depositTxs ?? 0) +
        total_deposit_txs;
      historicalDailySums[lastDailyTimestamp].withdrawTxs =
        (historicalDailySums[lastDailyTimestamp].withdrawTxs ?? 0) +
        total_withdrawal_txs;
    });
  }

  const dailyBridgeVolume = Object.entries(historicalDailySums).map(
    ([timestamp, data]) => {
      return {
        date: timestamp,
        ...data,
      };
    }
  );

  return dailyBridgeVolume;
};

export const getHourlyBridgeVolume = async (
  startTimestamp: number,
  endTimestamp: number,
  chain?: string,
  bridgeNetworkId?: number
) => {
  let bridgeDbName;
  if (bridgeNetworkId) {
    const bridgeNetwork = bridgeNetworkData[bridgeNetworkId - 1];
    if (!bridgeNetwork) {
      throw new Error(
        "Invalid bridgeNetworkId entered for getting daily bridge volume."
      );
    }
    ({ bridgeDbName } = bridgeNetwork);
  }

  const historicalHourlyData = await queryAggregatedHourlyTimestampRange(
    startTimestamp,
    endTimestamp,
    chain,
    bridgeDbName
  );

  let historicalHourlySums = {} as { [timestamp: string]: any };
  historicalHourlyData.map((hourlyData) => {
    const {
      ts,
      total_deposited_usd,
      total_withdrawn_usd,
      total_deposit_txs,
      total_withdrawal_txs,
    } = hourlyData;
    const timestamp = convertToUnixTimestamp(ts);
    historicalHourlySums[timestamp] = historicalHourlySums[timestamp] || {};
    historicalHourlySums[timestamp].depositUSD =
      (historicalHourlySums[timestamp].depositUSD ?? 0) +
      parseFloat(total_deposited_usd);
    historicalHourlySums[timestamp].withdrawUSD =
      (historicalHourlySums[timestamp].withdrawUSD ?? 0) +
      parseFloat(total_withdrawn_usd);
    historicalHourlySums[timestamp].depositTxs =
      (historicalHourlySums[timestamp].depositTxs ?? 0) + total_deposit_txs;
    historicalHourlySums[timestamp].withdrawTxs =
      (historicalHourlySums[timestamp].withdrawTxs ?? 0) + total_withdrawal_txs;
  });

  const hourlyBridgeVolume = Object.entries(historicalHourlySums).map(
    ([timestamp, data]) => {
      return {
        date: timestamp,
        ...data,
      };
    }
  );

  return hourlyBridgeVolume;
};
