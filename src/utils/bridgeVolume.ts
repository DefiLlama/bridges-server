import { convertToUnixTimestamp, getCurrentUnixTimestamp } from "./date";
import {
  queryAggregatedDailyTimestampRange,
  queryAggregatedHourlyTimestampRange,
  queryDailyBridgeVolumeTotals,
  queryDailyBridgeVolumesByBridge,
  queryDailyBridgeVolumesByChain,
  queryConfig,
  getConfigsWithDestChain,
} from "./wrappa/postgres/query";
import { importBridgeNetwork } from "../data/importBridgeNetwork";
import { getCache, setCache } from "./cache";

const startTimestampToRestrictTo = 1661990400; // Sept. 01, 2022: timestamp data is backfilled to

export type DailyBridgeVolume = {
  date: string;
  depositUSD: number;
  withdrawUSD: number;
  depositTxs: number;
  withdrawTxs: number;
};

type DailyBridgeVolumeGroups = Record<string, DailyBridgeVolume[]>;

const dailyVolumesByBridgeInFlight = new Map<string, Promise<DailyBridgeVolumeGroups>>();
const dailyVolumesByChainInFlight = new Map<string, Promise<DailyBridgeVolumeGroups>>();

const toDailyBridgeVolume = (row: {
  ts: Date;
  total_deposited_usd: string;
  total_withdrawn_usd: string;
  total_deposit_txs: number;
  total_withdrawal_txs: number;
}): DailyBridgeVolume => ({
  date: String(convertToUnixTimestamp(row.ts)),
  depositUSD: Number(row.total_deposited_usd),
  withdrawUSD: Number(row.total_withdrawn_usd),
  depositTxs: row.total_deposit_txs,
  withdrawTxs: row.total_withdrawal_txs,
});

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
  const cacheKey = `daily_bridge_volume_${bridgeNetworkId ?? "all"}_${chain ?? "all"}_${startTimestamp ?? "default"}_${
    endTimestamp ?? "default"
  }`;
  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }
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

  if (chain) {
    const totals = await queryDailyBridgeVolumeTotals(
      dailyStartTimestamp,
      dailyEndTimestamp,
      chain,
      bridgeDbName
    );
    const dailyBridgeVolume = totals.map(toDailyBridgeVolume);
    await setCache(cacheKey, dailyBridgeVolume, 3600);
    return dailyBridgeVolume;
  }

  const historicalDailyData = await queryAggregatedDailyTimestampRange(
    dailyStartTimestamp,
    dailyEndTimestamp,
    undefined,
    bridgeDbName
  );

  let historicalDailySums = {} as { [timestamp: string]: any };
  historicalDailyData.map((dailyData) => {
    const { bridge_id, ts, total_deposited_usd, total_withdrawn_usd, total_deposit_txs, total_withdrawal_txs } =
      dailyData;
    const depositUSD = parseFloat(total_deposited_usd);
    const withdrawUSD = parseFloat(total_withdrawn_usd);
    if (isNaN(depositUSD) || !isFinite(depositUSD)) {
      return;
    }
    const timestamp = convertToUnixTimestamp(ts);
    historicalDailySums[timestamp] = historicalDailySums[timestamp] || {};
    historicalDailySums[timestamp].depositUSD =
      (historicalDailySums[timestamp].depositUSD ?? 0) + depositUSD;
    historicalDailySums[timestamp].withdrawUSD =
      (historicalDailySums[timestamp].withdrawUSD ?? 0) + (isFinite(withdrawUSD) ? withdrawUSD : 0);
    historicalDailySums[timestamp].depositTxs = (historicalDailySums[timestamp].depositTxs ?? 0) + total_deposit_txs;
    historicalDailySums[timestamp].withdrawTxs =
      (historicalDailySums[timestamp].withdrawTxs ?? 0) + total_withdrawal_txs;
  });
  let dailyBridgeVolume = Object.entries(historicalDailySums).map(([timestamp, data]) => {
    return {
      date: timestamp,
      ...data,
    };
  });

  await setCache(cacheKey, dailyBridgeVolume, 3600);
  return dailyBridgeVolume;
};

export const getDailyBridgeVolumesByBridge = async (startTimestamp: number, endTimestamp: number) => {
  const cacheKey = `daily_bridge_volume_by_bridge_${startTimestamp}_${endTimestamp}`;
  const cachedData = await getCache(cacheKey);
  if (cachedData) return cachedData as DailyBridgeVolumeGroups;

  const existing = dailyVolumesByBridgeInFlight.get(cacheKey);
  if (existing) return existing;

  const promise = (async () => {
    const rows = await queryDailyBridgeVolumesByBridge(startTimestamp, endTimestamp);
    const result: DailyBridgeVolumeGroups = {};
    for (const row of rows) {
      const series = (result[row.bridge_name] ??= []);
      series.push(toDailyBridgeVolume(row));
    }
    await setCache(cacheKey, result, 3600);
    return result;
  })();

  dailyVolumesByBridgeInFlight.set(cacheKey, promise);
  const cleanup = () => {
    if (dailyVolumesByBridgeInFlight.get(cacheKey) === promise) dailyVolumesByBridgeInFlight.delete(cacheKey);
  };
  promise.then(cleanup, cleanup);
  return promise;
};

export const getDailyBridgeVolumesByChain = async (startTimestamp: number, endTimestamp: number) => {
  const cacheKey = `daily_bridge_volume_by_chain_${startTimestamp}_${endTimestamp}`;
  const cachedData = await getCache(cacheKey);
  if (cachedData) return cachedData as DailyBridgeVolumeGroups;

  const existing = dailyVolumesByChainInFlight.get(cacheKey);
  if (existing) return existing;

  const promise = (async () => {
    const rows = await queryDailyBridgeVolumesByChain(startTimestamp, endTimestamp);
    const result: DailyBridgeVolumeGroups = {};
    for (const row of rows) {
      const series = (result[row.chain] ??= []);
      series.push(toDailyBridgeVolume(row));
    }
    await setCache(cacheKey, result, 3600);
    return result;
  })();

  dailyVolumesByChainInFlight.set(cacheKey, promise);
  const cleanup = () => {
    if (dailyVolumesByChainInFlight.get(cacheKey) === promise) dailyVolumesByChainInFlight.delete(cacheKey);
  };
  promise.then(cleanup, cleanup);
  return promise;
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
      sourceChainsHourlyData = [...sourceChainsHourlyData, ...sourceChainHourlyData];
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
    const depositUSD = parseFloat(total_deposited_usd);
    const withdrawUSD = parseFloat(total_withdrawn_usd);
    if (isNaN(depositUSD) || !isFinite(depositUSD)) {
      return;
    }
    const timestamp = convertToUnixTimestamp(ts);
    historicalHourlySums[timestamp] = historicalHourlySums[timestamp] || {};
    historicalHourlySums[timestamp].depositUSD =
      (historicalHourlySums[timestamp].depositUSD ?? 0) + depositUSD;
    historicalHourlySums[timestamp].withdrawUSD =
      (historicalHourlySums[timestamp].withdrawUSD ?? 0) + (isFinite(withdrawUSD) ? withdrawUSD : 0);
    historicalHourlySums[timestamp].depositTxs = (historicalHourlySums[timestamp].depositTxs ?? 0) + total_deposit_txs;
    historicalHourlySums[timestamp].withdrawTxs =
      (historicalHourlySums[timestamp].withdrawTxs ?? 0) + total_withdrawal_txs;
  });
  sourceChainsHourlyData.map((hourlyData) => {
    const { ts, total_deposited_usd, total_withdrawn_usd, total_deposit_txs, total_withdrawal_txs } = hourlyData;
    const depositUSD = parseFloat(total_deposited_usd);
    const withdrawUSD = parseFloat(total_withdrawn_usd);
    if (isNaN(withdrawUSD) || !isFinite(withdrawUSD)) {
      return;
    }
    const timestamp = convertToUnixTimestamp(ts);
    historicalHourlySums[timestamp] = historicalHourlySums[timestamp] || {};
    historicalHourlySums[timestamp].depositUSD =
      (historicalHourlySums[timestamp].depositUSD ?? 0) + withdrawUSD;
    historicalHourlySums[timestamp].withdrawUSD =
      (historicalHourlySums[timestamp].withdrawUSD ?? 0) + (isFinite(depositUSD) ? depositUSD : 0);
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
