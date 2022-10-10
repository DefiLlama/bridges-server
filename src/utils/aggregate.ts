import { sql } from "./db";
import BigNumber from "bignumber.js";
import { queryAllTxsWithinTimestampRange } from "./wrappa/postgres/query";
import {
  getTimestampAtStartOfHour,
  getTimestampAtStartOfDay,
  secondsInHour,
  secondsInDay,
  getCurrentUnixTimestamp,
} from "./date";
import { getLlamaPrices } from "./prices";
import {
  getBridgeID,
  queryAggregatedHourlyDataAtTimestamp,
  queryAggregatedDailyDataAtTimestamp,
  getLargeTransaction,
} from "./wrappa/postgres/query";
import {
  insertHourlyAggregatedRow,
  insertDailyAggregatedRow,
  insertLargeTransactionRow,
  insertErrorRow,
} from "./wrappa/postgres/write";
import adapters from "../adapters";
import bridgeNetworks from "../data/bridgeNetworkData";
import { defaultConfidenceThreshold } from "./constants";

const nullPriceCountThreshold = 10; // insert error when there are more than this many prices missing per hour/day for a bridge

type CumTokens = {
  [tokenAddress: string]: {
    amount: BigNumber;
    usdValue: number | null;
  };
};

type CumAddressUsdValues = {
  [address: string]: {
    numberTxs: number;
    usdValue: number;
  };
};

export const runAggregateDataHistorical = async (
  startTimestamp: number,
  endTimestamp: number,
  bridgeNetworkId: number,
  hourly: boolean = false,
  chainToRestrictTo?: string
) => {
  const bridgeNetwork = bridgeNetworks.filter((bridgeNetwork) => bridgeNetwork.id === bridgeNetworkId)[0];
  const { bridgeDbName, largeTxThreshold } = bridgeNetwork;
  const adapter = adapters[bridgeDbName];
  if (!adapter) {
    const errString = `Adapter for ${bridgeDbName} not found, check it is exported correctly.`;
    await insertErrorRow({
      ts: getCurrentUnixTimestamp() * 1000,
      target_table: hourly ? "hourly_aggregated" : "daily_aggregated",
      keyword: "critical",
      error: errString,
    });
    throw new Error(errString);
  }
  const chains = Object.keys(adapter);
  let timestamp = endTimestamp;
  while (timestamp > startTimestamp) {
    const chainsPromises = Promise.all(
      chains.map(async (chain) => {
        if (chainToRestrictTo && chain !== chainToRestrictTo) return;
        try {
          await aggregateData(timestamp, bridgeDbName, chain, hourly, largeTxThreshold);
        } catch (e) {
          const errString = `Unable to aggregate hourly data for ${bridgeDbName} on chain ${chain}, skipping.`;
          await insertErrorRow({
            ts: getCurrentUnixTimestamp() * 1000,
            target_table: hourly ? "hourly_aggregated" : "daily_aggregated",
            keyword: "data",
            error: errString,
          });
          console.error(errString, e);
        }
      })
    );
    await chainsPromises;
    console.log(`Successfully aggregated data for ${bridgeDbName} at timestamp ${timestamp}.`);
    timestamp -= hourly ? secondsInHour : secondsInDay;
  }
};

export const runAggregateDataAllAdapters = async (timestamp: number, hourly: boolean = false) => {
  const bridgeNetworksPromises = Promise.all(
    bridgeNetworks.map(async (bridgeNetwork) => {
      const { bridgeDbName, largeTxThreshold } = bridgeNetwork;
      const adapter = adapters[bridgeDbName];
      const chains = Object.keys(adapter);
      const chainsPromises = Promise.all(
        chains.map(async (chain) => {
          try {
            await aggregateData(timestamp, bridgeDbName, chain, hourly, largeTxThreshold);
          } catch (e) {
            const errString = `Unable to aggregate hourly data for ${bridgeDbName} on chain ${chain}, skipping.`;
            await insertErrorRow({
              ts: getCurrentUnixTimestamp() * 1000,
              target_table: hourly ? "hourly_aggregated" : "daily_aggregated",
              keyword: "data",
              error: errString,
            });
            console.error(errString, e);
          }
        })
      );
      await chainsPromises;
    })
  );
  await bridgeNetworksPromises;
  console.log("Finished aggregating job.");
};

/*
Couldn't figure out how to insert unknown usd values as null into composite sql types
and didn't spend time to fix it, so unknown usd values are 0 instead.

Large value transactions are only logged when aggregating daily stats.

Aggregates hourly data for the hour previous to timestamp's current hour, and daily data for the day previous to timestamp's current day.
*/
export const aggregateData = async (
  timestamp: number,
  bridgeDbName: string,
  chain: string,
  hourly?: boolean,
  largeTxThreshold?: number
) => {
  const bridgeID = (await getBridgeID(bridgeDbName, chain))?.id;
  if (!bridgeID) {
    const errString = `Could not find ID for ${bridgeDbName} on chain ${chain}, make sure it is added to config db.`;
    await insertErrorRow({
      ts: getCurrentUnixTimestamp() * 1000,
      target_table: hourly ? "hourly_aggregated" : "daily_aggregated",
      keyword: "critical",
      error: errString,
    });
    throw new Error(errString);
  }
  let startTimestamp = 0;
  let endTimestamp = 0;
  if (hourly) {
    const currentHourTimestamp = getTimestampAtStartOfHour(timestamp);
    startTimestamp = currentHourTimestamp - secondsInHour + 1;
    endTimestamp = currentHourTimestamp;
    const existingEntry = await queryAggregatedHourlyDataAtTimestamp(endTimestamp, chain, bridgeDbName);
    if (existingEntry.length) {
      console.log(`Hourly aggregated entry for ${bridgeID} at timestamp ${endTimestamp} already exists, skipping.`);
      return;
    }
  } else {
    const timestampAtStartOfDay = getTimestampAtStartOfDay(timestamp);
    startTimestamp = timestampAtStartOfDay - secondsInDay + 1;
    endTimestamp = timestampAtStartOfDay;
    const existingEntry = await queryAggregatedDailyDataAtTimestamp(endTimestamp, chain, bridgeDbName);
    if (existingEntry.length) {
      console.log(`Daily aggregated entry for ${bridgeID} at timestamp ${endTimestamp} already exists, skipping.`);
      return;
    }
  }
  const txs = await queryAllTxsWithinTimestampRange(startTimestamp, endTimestamp, bridgeID);
  // console.log(txs);
  if (txs.length === 0) {
    const errString = `No transactions found for ${bridgeID} from ${startTimestamp} to ${endTimestamp}.`;
    await insertErrorRow({
      ts: getCurrentUnixTimestamp() * 1000,
      target_table: hourly ? "hourly_aggregated" : "daily_aggregated",
      keyword: "data",
      error: errString,
    });
    console.log(errString);
    // If it is daily, insert an entry into db anyway
    if (!hourly) {
      try {
        await sql.begin(async (sql) => {
          await insertDailyAggregatedRow(sql, true, {
            bridge_id: bridgeID,
            ts: endTimestamp * 1000,
            total_tokens_deposited: null,
            total_tokens_withdrawn: null,
            total_deposited_usd: 0,
            total_withdrawn_usd: 0,
            total_deposit_txs: 0,
            total_withdrawal_txs: 0,
            total_address_deposited: null,
            total_address_withdrawn: null,
          });
        });
      } catch (e) {
        const errString = `Failed inserting hourly aggregated row for bridge ${bridgeID} for timestamp ${startTimestamp}.`;
        await insertErrorRow({
          ts: getCurrentUnixTimestamp() * 1000,
          target_table: "daily_aggregated",
          keyword: "data",
          error: errString,
        });
		console.error(errString, e)
      }
    }
    return;
  }
  let totalTokensDeposited = [] as string[];
  let totalTokensWithdrawn = [] as string[];
  let totalAddressDeposited = [] as string[];
  let totalAddressWithdrawn = [] as string[];
  let cumTokensDeposited = {} as CumTokens;
  let cumTokensWithdrawn = {} as CumTokens;
  let cumAddressDeposited = {} as CumAddressUsdValues;
  let cumAddressWithdrawn = {} as CumAddressUsdValues;
  let totalDepositedUsd = 0 as number;
  let totalWithdrawnUsd = 0 as number;
  let totalDepositTxs = 0 as number;
  let totalWithdrawalTxs = 0 as number;
  let largeTxs = [] as any[];
  let uniqueTokens = {} as { [token: string]: boolean };
  let tokensForPricing = [] as any;

  const uniqueTokenPromises = Promise.all(
    txs.map(async (tx) => {
      const { token, chain } = tx;
      const tokenKey = `${chain}:${token}`;
      uniqueTokens[tokenKey] = true;
    })
  );
  await uniqueTokenPromises;
  tokensForPricing = Object.keys(uniqueTokens);
  const llamaPrices = await getLlamaPrices(tokensForPricing, startTimestamp); // this prices tokens all at the same timestamp, can revise how this is done later
  if (Object.keys(llamaPrices).length === 0) {
    const errString = `No prices for any tokens were found for ${bridgeID} from ${startTimestamp} to ${endTimestamp}.`;
    await insertErrorRow({
      ts: getCurrentUnixTimestamp() * 1000,
      target_table: hourly ? "hourly_aggregated" : "daily_aggregated",
      keyword: "data",
      error: errString,
    });
    console.log(errString);
  }

  let tokensWithNullPrices = new Set();
  const txsPromises = Promise.all(
    txs.map(async (tx) => {
      const { id, chain, token, amount, ts, is_deposit, tx_to, tx_from } = tx;
      const tokenKey = `${chain}:${token}`;
      const bnAmount = BigNumber(amount);
      let usdValue = null;
      const priceData = llamaPrices?.[tokenKey];
      if (priceData && priceData.confidence > defaultConfidenceThreshold) {
        const { price, decimals } = priceData;
        const bnAmount = BigNumber(amount).dividedBy(10 ** decimals);
        usdValue = bnAmount.multipliedBy(price).toNumber();
        if (usdValue > 10 ** 9) {
          const errString = `USD value of tx id ${id} is ${usdValue}.`;
          await insertErrorRow({
            ts: getCurrentUnixTimestamp() * 1000,
            target_table: hourly ? "hourly_aggregated" : "daily_aggregated",
            keyword: "data",
            error: errString,
          });
        }
        if (usdValue > 10 ** 10) {
          console.error(`USD value of tx id ${id} is over 10 billion, skipping.`);
          return;
        }
        if (largeTxThreshold && id && usdValue > largeTxThreshold) {
          largeTxs.push({
            id: id,
            ts: ts,
            usdValue: usdValue,
          });
        }
      }
      if (!usdValue) {
        tokensWithNullPrices.add(tokenKey);
      }
      if (is_deposit) {
        totalDepositTxs += 1;
        totalDepositedUsd += usdValue ?? 0;
        cumTokensDeposited[tokenKey] = cumTokensDeposited[tokenKey] || {};
        cumTokensDeposited[tokenKey].amount = cumTokensDeposited[tokenKey].amount
          ? cumTokensDeposited[tokenKey].amount.plus(bnAmount)
          : bnAmount;
        cumTokensDeposited[tokenKey].usdValue = (cumTokensDeposited[tokenKey].usdValue ?? 0) + (usdValue ?? 0);
        if (tx_from) {
          const addressKey = `${chain}:${tx_from}`
          cumAddressDeposited[addressKey] = cumAddressDeposited[addressKey] || {};
          cumAddressDeposited[addressKey].numberTxs = (cumAddressDeposited[addressKey].numberTxs ?? 0) + 1;
          cumAddressDeposited[addressKey].usdValue = cumAddressDeposited[addressKey].usdValue ?? 0 + (usdValue ?? 0);
        }
      } else {
        totalWithdrawalTxs += 1;
        totalWithdrawnUsd += usdValue ?? 0;
        cumTokensWithdrawn[tokenKey] = cumTokensWithdrawn[tokenKey] || {};
        cumTokensWithdrawn[tokenKey].amount = cumTokensWithdrawn[tokenKey].amount
          ? cumTokensWithdrawn[tokenKey].amount.plus(bnAmount)
          : bnAmount;
        cumTokensWithdrawn[tokenKey].usdValue = (cumTokensWithdrawn[tokenKey].usdValue ?? 0) + (usdValue ?? 0);
        if (tx_to) {
          const addressKey = `${chain}:${tx_to}`
          cumAddressWithdrawn[addressKey] = cumAddressWithdrawn[addressKey] || {};
          cumAddressWithdrawn[addressKey].numberTxs = (cumAddressWithdrawn[addressKey].numberTxs ?? 0) + 1;
          cumAddressWithdrawn[addressKey].usdValue = cumAddressWithdrawn[addressKey].usdValue ?? 0 + (usdValue ?? 0);
        }
      }
    })
  );
  await txsPromises;
  if (tokensWithNullPrices.size > nullPriceCountThreshold) {
    const errString = `There are ${tokensWithNullPrices.size} missing prices for ${bridgeID} from ${startTimestamp} to ${endTimestamp}`;
    await insertErrorRow({
      ts: getCurrentUnixTimestamp() * 1000,
      target_table: hourly ? "hourly_aggregated" : "daily_aggregated",
      keyword: "data",
      error: errString,
    });
    console.error(errString);
  }
  Object.entries(cumTokensDeposited)
    .sort((a, b) => {
      return (b[1].usdValue ?? 0) - (a[1].usdValue ?? 0);
    })
    .map(([tokenKey, tokenData]) => {
      totalTokensDeposited.push(`('${tokenKey}', '${tokenData.amount.toFixed()}', ${tokenData.usdValue ?? 0})`);
    });
  Object.entries(cumTokensWithdrawn)
    .sort((a, b) => {
      return (b[1].usdValue ?? 0) - (a[1].usdValue ?? 0);
    })
    .map(([tokenKey, tokenData]) => {
      totalTokensWithdrawn.push(`('${tokenKey}', '${tokenData.amount.toFixed()}', ${tokenData.usdValue ?? 0})`);
    });
  Object.entries(cumAddressDeposited)
    .sort((a, b) => {
      return (b[1].usdValue ?? 0) - (a[1].usdValue ?? 0);
    })
    .map(([address, addressData]) => {
      totalAddressDeposited.push(`('${address}', ${addressData.usdValue}, ${addressData.numberTxs})`);
    });
  Object.entries(cumAddressWithdrawn)
    .sort((a, b) => {
      return (b[1].usdValue ?? 0) - (a[1].usdValue ?? 0);
    })
    .map(([address, addressData]) => {
      totalAddressWithdrawn.push(`('${address}', ${addressData.usdValue}, ${addressData.numberTxs})`);
    });

  if (totalDepositedUsd === 0 || totalWithdrawnUsd === 0) {
    const errString = `Total Value Deposited = ${totalDepositedUsd} and Total Value Withdrawn = ${totalWithdrawnUsd} for ${bridgeID} from ${startTimestamp} to ${endTimestamp}.`;
    await insertErrorRow({
      ts: getCurrentUnixTimestamp() * 1000,
      target_table: hourly ? "hourly_aggregated" : "daily_aggregated",
      keyword: "data",
      error: errString,
    });
    console.error(errString);
  }

  /*
  console.log(totalTokensDeposited);
  console.log(totalTokensWithdrawn);
  console.log(totalAddressDeposited);
  console.log(totalAddressWithdrawn);
  console.log(totalDepositedUsd);
  console.log(totalWithdrawnUsd);
  console.log(totalDepositTxs);
  console.log(totalWithdrawalTxs);
  */

  if (hourly) {
    try {
      await sql.begin(async (sql) => {
        await insertHourlyAggregatedRow(sql, true, {
          bridge_id: bridgeID,
          ts: endTimestamp * 1000,
          total_tokens_deposited: totalTokensDeposited,
          total_tokens_withdrawn: totalTokensWithdrawn,
          total_deposited_usd: totalDepositedUsd,
          total_withdrawn_usd: totalWithdrawnUsd,
          total_deposit_txs: totalDepositTxs,
          total_withdrawal_txs: totalWithdrawalTxs,
          total_address_deposited: totalAddressDeposited,
          total_address_withdrawn: totalAddressWithdrawn,
        });
      });
    } catch (e) {
      const errString = `Failed inserting hourly aggregated row for bridge ${bridgeID} for timestamp ${startTimestamp}.`;
      await insertErrorRow({
        ts: getCurrentUnixTimestamp() * 1000,
        target_table: hourly ? "hourly_aggregated" : "daily_aggregated",
        keyword: "data",
        error: errString,
      });
	  console.error(errString, e)
    }
  } else {
    try {
      await sql.begin(async (sql) => {
        await insertDailyAggregatedRow(sql, true, {
          bridge_id: bridgeID,
          ts: endTimestamp * 1000,
          total_tokens_deposited: totalTokensDeposited,
          total_tokens_withdrawn: totalTokensWithdrawn,
          total_deposited_usd: totalDepositedUsd,
          total_withdrawn_usd: totalWithdrawnUsd,
          total_deposit_txs: totalDepositTxs,
          total_withdrawal_txs: totalWithdrawalTxs,
          total_address_deposited: totalAddressDeposited,
          total_address_withdrawn: totalAddressWithdrawn,
        });
      });
    } catch (e) {
      const errString = `Failed inserting hourly aggregated row for bridge ${bridgeID} for timestamp ${startTimestamp}.`;
      await insertErrorRow({
        ts: getCurrentUnixTimestamp() * 1000,
        target_table: hourly ? "hourly_aggregated" : "daily_aggregated",
        keyword: "data",
        error: errString,
      });
	  console.error(errString, e)
    }
    largeTxs.map(async (largeTx) => {
      const txPK = largeTx.id;
      const timestamp = largeTx.ts;
      const usdValue = largeTx.usdValue;
      const existingEntry = await getLargeTransaction(txPK, timestamp);
      if (existingEntry) {
        console.log(`Large transaction entry with PK ${txPK} at timestamp ${timestamp} already exists, skipping.`);
        return;
      }
      try {
        await sql.begin(async (sql) => {
          await insertLargeTransactionRow(sql, {
            tx_pk: txPK,
            ts: timestamp,
            usd_value: usdValue,
          });
        });
      } catch (e) {
        const errString = `Failed inserting large transaction row for pk ${txPK} with timestamp ${timestamp}.`;
        await insertErrorRow({
          ts: getCurrentUnixTimestamp() * 1000,
          target_table: "large_transactions",
          keyword: "data",
          error: errString,
        });
        console.log(errString, e);
      }
    });
  }
};
