import { convertToUnixTimestamp, getCurrentUnixTimestamp } from "./date";
import {
  queryAggregatedDailyTimestampRange,
  queryAggregatedHourlyTimestampRange,
  queryConfig,
  getConfigsWithDestChain,
} from "./wrappa/postgres/query";
import { importBridgeNetwork } from "../data/importBridgeNetwork";
import { getCache, setCache } from "./cache";

const startTimestampToRestrictTo = 1661990400; // Sept. 01, 2022: timestamp data is backfilled to

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

interface IConfig {
  id: string;
  bridge_name: string;
  chain: string;
  destination_chain: number;
}

/*
-When getting volume for a given bridgeNetwork, if a destination chain is present (and no chain parameter given),
  mltiply volumes/txs by 2. Otherwise, return as-is.
-When getting volume for a given chain, sum all volumes on that chain with all (inverted) volumes that have
  that chain as a destination chain.
*/

export const getDailyBridgeVolume = async (
  startTimestamp?: number,
  endTimestamp?: number,
  chain?: string,
  bridgeNetworkId?: number
) => {
  let bridgeDbName = undefined as any;
  if (bridgeNetworkId) {
    const bridgeNetwork = importBridgeNetwork(undefined, bridgeNetworkId);
    if (!bridgeNetwork) {
      throw new Error("Invalid bridgeNetworkId entered for getting daily bridge volume.");
    }
    ({ bridgeDbName } = bridgeNetwork);
  }

  const currentTimestamp = getCurrentUnixTimestamp();
  const dailyStartTimestamp = startTimestamp ? startTimestamp : startTimestampToRestrictTo;
  const dailyEndTimestamp = endTimestamp ? endTimestamp : currentTimestamp;

  let sourceChainConfigs = [] as IConfig[];
  if (chain) {
    sourceChainConfigs = (await queryConfig(undefined, undefined, chain)).filter((config) => {
      if (bridgeNetworkId) {
        return config.bridge_name === bridgeDbName;
      }
      return true;
    });
  }
  let sourceChainsHistoricalDailyData = [] as IAggregatedData[];
  const [_, historicalDailyData] = await Promise.all([
    Promise.all(
      sourceChainConfigs.map(async (config) => {
        const sourceChainHistoricalData = await queryAggregatedDailyTimestampRange(
          dailyStartTimestamp,
          dailyEndTimestamp,
          config.chain,
          config.bridge_name
        );
        return sourceChainHistoricalData;
      })
    ),
    queryAggregatedDailyTimestampRange(dailyStartTimestamp, dailyEndTimestamp, chain, bridgeDbName),
  ]);

  let historicalDailySums = {} as { [timestamp: string]: any };
  historicalDailyData.map((dailyData) => {
    const { bridge_id, ts, total_deposited_usd, total_withdrawn_usd, total_deposit_txs, total_withdrawal_txs } =
      dailyData;
    const timestamp = convertToUnixTimestamp(ts);
    historicalDailySums[timestamp] = historicalDailySums[timestamp] || {};
    historicalDailySums[timestamp].depositUSD =
      (historicalDailySums[timestamp].depositUSD ?? 0) + parseFloat(total_deposited_usd);
    historicalDailySums[timestamp].withdrawUSD =
      (historicalDailySums[timestamp].withdrawUSD ?? 0) + parseFloat(total_withdrawn_usd);
    historicalDailySums[timestamp].depositTxs = (historicalDailySums[timestamp].depositTxs ?? 0) + total_deposit_txs;
    historicalDailySums[timestamp].withdrawTxs =
      (historicalDailySums[timestamp].withdrawTxs ?? 0) + total_withdrawal_txs;
  });
  // the deposits and withdrawals are swapped here
  sourceChainsHistoricalDailyData.map((dailyData) => {
    const { ts, total_deposited_usd, total_withdrawn_usd, total_deposit_txs, total_withdrawal_txs } = dailyData;
    const timestamp = convertToUnixTimestamp(ts);
    historicalDailySums[timestamp] = historicalDailySums[timestamp] || {};
    historicalDailySums[timestamp].depositUSD =
      (historicalDailySums[timestamp].depositUSD ?? 0) + parseFloat(total_withdrawn_usd);
    historicalDailySums[timestamp].withdrawUSD =
      (historicalDailySums[timestamp].withdrawUSD ?? 0) + parseFloat(total_deposited_usd);
    historicalDailySums[timestamp].depositTxs = (historicalDailySums[timestamp].depositTxs ?? 0) + total_withdrawal_txs;
    historicalDailySums[timestamp].withdrawTxs = (historicalDailySums[timestamp].withdrawTxs ?? 0) + total_deposit_txs;
  });

  let dailyBridgeVolume = Object.entries(historicalDailySums).map(([timestamp, data]) => {
    return {
      date: timestamp,
      ...data,
    };
  });

  return dailyBridgeVolume;
};

export const getHourlyBridgeVolume = async (
  startTimestamp: number,
  endTimestamp: number,
  chain?: string,
  bridgeNetworkId?: number
) => {
  let bridgeDbName = undefined as any;
  const cacheKey = `hourly_bridge_volume_${bridgeNetworkId}_${chain}_${startTimestamp}_${endTimestamp}`;
  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    return cachedData as any[];
  }
  if (bridgeNetworkId) {
    const bridgeNetwork = importBridgeNetwork(undefined, bridgeNetworkId);
    if (!bridgeNetwork) {
      throw new Error("Invalid bridgeNetworkId entered for getting daily bridge volume.");
    }
    ({ bridgeDbName } = bridgeNetwork);
  }

  let sourceChainConfigs = [] as IConfig[];
  if (chain) {
    sourceChainConfigs = (await queryConfig(undefined, undefined, chain)).filter((config) => {
      if (bridgeNetworkId) {
        return config.bridge_name === bridgeDbName;
      }
      return true;
    });
  }

  let sourceChainsHourlyData = [] as IAggregatedData[];
  await Promise.all(
    sourceChainConfigs.map(async (config) => {
      const sourceChainHourlyData = await queryAggregatedHourlyTimestampRange(
        startTimestamp,
        endTimestamp,
        config.chain,
        config.bridge_name
      );
      sourceChainsHourlyData = [...sourceChainHourlyData, ...sourceChainsHourlyData];
    })
  );

  const historicalHourlyData = await queryAggregatedHourlyTimestampRange(
    startTimestamp,
    endTimestamp,
    chain,
    bridgeDbName
  );

  let historicalHourlySums = {} as { [timestamp: string]: any };
  historicalHourlyData.map((hourlyData) => {
    const { bridge_id, ts, total_deposited_usd, total_withdrawn_usd, total_deposit_txs, total_withdrawal_txs } =
      hourlyData;
    const timestamp = convertToUnixTimestamp(ts);
    historicalHourlySums[timestamp] = historicalHourlySums[timestamp] || {};
    historicalHourlySums[timestamp].depositUSD =
      (historicalHourlySums[timestamp].depositUSD ?? 0) + parseFloat(total_deposited_usd);
    historicalHourlySums[timestamp].withdrawUSD =
      (historicalHourlySums[timestamp].withdrawUSD ?? 0) + parseFloat(total_withdrawn_usd);
    historicalHourlySums[timestamp].depositTxs = (historicalHourlySums[timestamp].depositTxs ?? 0) + total_deposit_txs;
    historicalHourlySums[timestamp].withdrawTxs =
      (historicalHourlySums[timestamp].withdrawTxs ?? 0) + total_withdrawal_txs;

    // doubling volume for chains with a destination chain (those that only have 1 aggregated entry for entire bridgeNetwork)
  });
  // the deposits and withdrawals are swapped here
  sourceChainsHourlyData.map((hourlyData) => {
    const { ts, total_deposited_usd, total_withdrawn_usd, total_deposit_txs, total_withdrawal_txs } = hourlyData;
    const timestamp = convertToUnixTimestamp(ts);
    historicalHourlySums[timestamp] = historicalHourlySums[timestamp] || {};
    historicalHourlySums[timestamp].depositUSD =
      (historicalHourlySums[timestamp].depositUSD ?? 0) + parseFloat(total_withdrawn_usd);
    historicalHourlySums[timestamp].withdrawUSD =
      (historicalHourlySums[timestamp].withdrawUSD ?? 0) + parseFloat(total_deposited_usd);
    historicalHourlySums[timestamp].depositTxs =
      (historicalHourlySums[timestamp].depositTxs ?? 0) + total_withdrawal_txs;
    historicalHourlySums[timestamp].withdrawTxs =
      (historicalHourlySums[timestamp].withdrawTxs ?? 0) + total_deposit_txs;
  });

  let hourlyBridgeVolume = Object.entries(historicalHourlySums).map(([timestamp, data]) => {
    return {
      date: timestamp,
      ...data,
    };
  });

  /*
  if (bridgeNetworkId && !chain) {
    const configs = await queryConfig(bridgeDbName);
    // testing to see if there is destination_chain for any config returned
    const destinationChain = configs[0].destination_chain;
    // if there is, withdrawals are added to deposits and deposits are added to withdrawals
    if (destinationChain) {
      hourlyBridgeVolume = hourlyBridgeVolume.map((entry) => {
        return {
          date: entry.date,
          depositUSD: entry.depositUSD + entry.withdrawUSD,
          withdrawUSD: entry.depositUSD + entry.withdrawUSD,
          depositTxs: entry.depositTxs + entry.withdrawTxs,
          withdrawTxs: entry.depositTxs + entry.withdrawTxs,
        };
      });
    }
  }
  */
  await setCache(cacheKey, hourlyBridgeVolume);

  return hourlyBridgeVolume;
};
