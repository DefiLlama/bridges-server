import { wrapScheduledLambda } from "../utils/wrap";
import adapter, { forEachRequestsByTimePage, convertRequestToEvent, chainIdToSlug } from "../adapters/relay";
import { sql } from "../utils/db";
import { insertTransactionRows } from "../utils/wrappa/postgres/write";
import { getBridgeID } from "../utils/wrappa/postgres/query";
import { insertConfigEntriesForAdapter } from "../utils/adapter";
import dayjs from "dayjs";

const HOURS_CONCURRENCY = 12;

export const handler = async () => {
  try {
    await insertConfigEntriesForAdapter(adapter, "relay");

    const bridgeIds = Object.fromEntries(
      await Promise.all(
        Object.keys(adapter).map(async (chain) => {
          const bridgeId = await getBridgeID("relay", chain.toLowerCase());
          return [chain.toLowerCase(), bridgeId?.id];
        })
      )
    );

    const startTs = dayjs().subtract(48, "hour").unix();
    const endTs = dayjs().unix();
    console.log(
      `Running Relay adapter for ${startTs} (${dayjs
        .unix(startTs)
        .format("YYYY-MM-DD HH:mm:ss")}) to ${endTs} (${dayjs.unix(endTs).format("YYYY-MM-DD HH:mm:ss")})`
    );

    const windows: Array<[number, number]> = [];
    for (let t = startTs; t < endTs; t += 3600) {
      windows.push([t, Math.min(t + 3600, endTs)]);
    }

    const mapLimit = async <T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> => {
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

    const processHourWindow = async ([from, to]: [number, number]): Promise<number> => {
      const label = `[hour ${dayjs.unix(from).format("YYYY-MM-DD HH:mm")}-${dayjs
        .unix(to)
        .format("HH:mm")}]`;
      console.log(`${label} start`);
      let hourDepositUsd = 0;
      let pageIndex = 0;
      try {
        await forEachRequestsByTimePage(from, to, async (slice) => {
          pageIndex += 1;
          const sourceTransactions: any[] = [];
          const destinationTransactions: any[] = [];

          for (const req of slice) {
            try {
              const event = convertRequestToEvent(req);
              if (event.deposit && event.depositChainId) {
                const depositSlug = chainIdToSlug[event.depositChainId];
                const bId = bridgeIds[depositSlug?.toLowerCase?.()];
                if (bId) {
                  hourDepositUsd += parseFloat(event.deposit.amount?.toString?.() || "0");
                  sourceTransactions.push({
                    bridge_id: bId,
                    chain: depositSlug.toLowerCase(),
                    tx_hash: event.deposit.txHash,
                    ts: event.deposit.timestamp!,
                    tx_block: null,
                    tx_from: event.deposit.from ?? "0x",
                    tx_to: event.deposit.to ?? "0x",
                    token: event.deposit.token ?? "0x0000000000000000000000000000000000000000",
                    amount: event.deposit.amount?.toString?.() || "0",
                    is_deposit: true,
                    is_usd_volume: true,
                    txs_counted_as: 1,
                    origin_chain: null,
                  });
                }
              }

              if (event.withdraw && event.withdrawChainId) {
                const withdrawSlug = chainIdToSlug[event.withdrawChainId];
                const bId = bridgeIds[withdrawSlug?.toLowerCase?.()];
                if (bId) {
                  destinationTransactions.push({
                    bridge_id: bId,
                    chain: withdrawSlug.toLowerCase(),
                    tx_hash: event.withdraw.txHash,
                    ts: event.withdraw.timestamp!,
                    tx_block: null,
                    tx_from: event.withdraw.from ?? "0x",
                    tx_to: event.withdraw.to ?? "0x",
                    token: event.withdraw.token ?? "0x0000000000000000000000000000000000000000",
                    amount: event.withdraw.amount?.toString?.() || "0",
                    is_deposit: false,
                    is_usd_volume: true,
                    txs_counted_as: 1,
                    origin_chain: null,
                  });
                }
              }
            } catch (e) {
              console.error(`${label} error converting request ${req?.id}:`, e);
            }
          }

          if (sourceTransactions.length || destinationTransactions.length) {
            await sql.begin(async (sql) => {
              if (sourceTransactions.length) await insertTransactionRows(sql, true, sourceTransactions, "upsert");
              if (destinationTransactions.length) await insertTransactionRows(sql, true, destinationTransactions, "upsert");
            });
            console.log(
              `${label} inserted page ${pageIndex}: ${sourceTransactions.length} deposits, ${destinationTransactions.length} withdrawals`
            );
          } else {
            console.log(`${label} page ${pageIndex} had no convertible requests`);
          }
        });
      } catch (error) {
        console.error(`${label} error processing window:`, error);
      }
      console.log(`${label} complete`);
      return hourDepositUsd;
    };

    const hourTotals = await mapLimit(windows, HOURS_CONCURRENCY, (w) => processHourWindow(w));
    const totalDepositUsd = hourTotals.reduce((a, b) => a + (b || 0), 0);

    console.log(`Relay processing complete. Total deposit USD: ${totalDepositUsd}`);
  } catch (error) {
    console.error("Fatal error in Relay handler:", error);
    throw error;
  }
};


export default wrapScheduledLambda(handler);
