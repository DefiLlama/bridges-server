import dayjs from "dayjs";
import adapter, { convertTransactionToEvent, forEachTransactionsByTimePage } from "../adapters/cashmere";
import { domainToChain } from "../adapters/cashmere/types";
import { insertConfigEntriesForAdapter } from "../utils/adapter";
import { sql } from "../utils/db";
import { wrapScheduledLambda } from "../utils/wrap";
import { getBridgeID } from "../utils/wrappa/postgres/query";
import { insertTransactionRows } from "../utils/wrappa/postgres/write";

const HOURS_CONCURRENCY = 12;

export const handler = async () => {
  try {
    await insertConfigEntriesForAdapter(adapter, "cashmere");

    const bridgeIds = Object.fromEntries(
      await Promise.all(
        Object.keys(adapter).map(async (chain) => {
          const bridgeId = await getBridgeID("cashmere", chain.toLowerCase());
          return [chain.toLowerCase(), bridgeId?.id];
        })
      )
    );

    const startTs = dayjs().subtract(48, "hour").unix();
    const endTs = dayjs().unix();
    console.log(
      `Running Cashmere CCTP adapter for ${startTs} (${dayjs
        .unix(startTs)
        .format("YYYY-MM-DD HH:mm:ss")}) to ${endTs} (${dayjs.unix(endTs).format("YYYY-MM-DD HH:mm:ss")})`
    );

    const windows: Array<[number, number]> = [];
    for (let t = startTs; t < endTs; t += 3600) {
      windows.push([t, Math.min(t + 3600, endTs)]);
    }

    const mapLimit = async <T, R>(
      items: T[],
      limit: number,
      fn: (item: T, index: number) => Promise<R>
    ): Promise<R[]> => {
      const results: R[] = new Array(items.length);
      let inFlight = 0;
      let i = 0;
      return await new Promise<R[]>((resolve, reject) => {
        const launchNext = () => {
          if (i >= items.length && inFlight === 0) return resolve(results);
          while (inFlight < limit && i < items.length) {
            const idx = i++;
            inFlight++;
            fn(items[idx], idx)
              .then((res) => {
                results[idx] = res;
              })
              .catch(reject)
              .finally(() => {
                inFlight--;
                launchNext();
              });
          }
        };
        launchNext();
      });
    };

    const processHourWindow = async ([from, to]: [number, number]): Promise<{
      depositUsd: number;
      withdrawUsd: number;
    }> => {
      const label = `[hour ${dayjs.unix(from).format("YYYY-MM-DD HH:mm")}-${dayjs.unix(to).format("HH:mm")}]`;
      console.log(`${label} start`);
      let hourDepositUsd = 0;
      let hourWithdrawUsd = 0;
      let pageIndex = 0;
      try {
        await forEachTransactionsByTimePage(from, to, async (transactions) => {
          pageIndex += 1;
          const sourceTransactions: any[] = [];
          const destinationTransactions: any[] = [];

          for (const tx of transactions) {
            try {
              const event = convertTransactionToEvent(tx);

              // Process deposit (source chain)
              if (event.deposit && event.depositChainId !== undefined) {
                const depositChain = domainToChain[event.depositChainId];
                const bId = bridgeIds[depositChain?.toLowerCase?.()];
                if (bId && depositChain) {
                  hourDepositUsd += parseFloat(event.deposit.amount?.toString?.() || "0");
                  sourceTransactions.push({
                    bridge_id: bId,
                    chain: depositChain.toLowerCase(),
                    tx_hash: event.deposit.txHash,
                    ts: event.deposit.timestamp!,
                    tx_block: event.deposit.blockNumber || null,
                    tx_from: event.deposit.from ?? "0x",
                    tx_to: event.deposit.to ?? "0x",
                    token: event.deposit.token,
                    amount: event.deposit.amount?.toString?.() || "0",
                    is_deposit: true,
                    is_usd_volume: true, // Key: amounts are already USD
                    txs_counted_as: 1,
                    origin_chain: null,
                  });
                }
              }

              // Process withdrawal (destination chain)
              if (event.withdraw && event.withdrawChainId !== undefined) {
                const withdrawChain = domainToChain[event.withdrawChainId];
                const bId = bridgeIds[withdrawChain?.toLowerCase?.()];
                if (bId && withdrawChain) {
                  hourWithdrawUsd += parseFloat(event.withdraw.amount?.toString?.() || "0");
                  destinationTransactions.push({
                    bridge_id: bId,
                    chain: withdrawChain.toLowerCase(),
                    tx_hash: event.withdraw.txHash,
                    ts: event.withdraw.timestamp!,
                    tx_block: event.withdraw.blockNumber || null,
                    tx_from: event.withdraw.from ?? "0x",
                    tx_to: event.withdraw.to ?? "0x",
                    token: event.withdraw.token,
                    amount: event.withdraw.amount?.toString?.() || "0",
                    is_deposit: false,
                    is_usd_volume: true, // Key: amounts are already USD
                    txs_counted_as: 1,
                    origin_chain: null,
                  });
                }
              }
            } catch (e) {
              console.error(`${label} error converting transaction ${tx?.id}:`, e);
            }
          }

          if (sourceTransactions.length || destinationTransactions.length) {
            await sql.begin(async (sql) => {
              if (sourceTransactions.length) await insertTransactionRows(sql, true, sourceTransactions, "upsert");
              if (destinationTransactions.length)
                await insertTransactionRows(sql, true, destinationTransactions, "upsert");
            });
            console.log(
              `${label} inserted page ${pageIndex}: ${sourceTransactions.length} deposits, ${destinationTransactions.length} withdrawals`
            );
          } else {
            console.log(`${label} page ${pageIndex} had no convertible transactions`);
          }
        });
      } catch (error) {
        console.error(`${label} error processing window:`, error);
      }
      console.log(`${label} complete`);
      return { depositUsd: hourDepositUsd, withdrawUsd: hourWithdrawUsd };
    };

    const hourTotals = await mapLimit(windows, HOURS_CONCURRENCY, (w) => processHourWindow(w));
    const totalDepositUsd = hourTotals.reduce((a, b) => a + (b?.depositUsd || 0), 0);
    const totalWithdrawUsd = hourTotals.reduce((a, b) => a + (b?.withdrawUsd || 0), 0);

    console.log(
      `Cashmere CCTP processing complete. Total deposit USD: ${totalDepositUsd}, Total withdraw USD: ${totalWithdrawUsd}`
    );
  } catch (error) {
    console.error("Fatal error in Cashmere handler:", error);
    throw error;
  }
};

export default wrapScheduledLambda(handler);
