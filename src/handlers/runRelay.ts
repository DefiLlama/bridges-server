import { wrapScheduledLambda } from "../utils/wrap";
import adapter, { forEachRequestsByTimePage, convertRequestToEvent, chainIdToSlug } from "../adapters/relay";
import { sql } from "../utils/db";
import { insertTransactionRows } from "../utils/wrappa/postgres/write";
import { getBridgeID } from "../utils/wrappa/postgres/query";
import { insertConfigEntriesForAdapter } from "../utils/adapter";
import dayjs from "dayjs";

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

    let totalDepositUsd = 0;
    let currentTs = startTs;

    while (currentTs < endTs) {
      const hourEndTs = Math.min(currentTs + 3600, endTs); 
      console.log(
        `Processing hour: ${dayjs.unix(currentTs).format("YYYY-MM-DD HH:mm:ss")} to ${dayjs
          .unix(hourEndTs)
          .format("YYYY-MM-DD HH:mm:ss")}`
      );

      try {
        let pageIndex = 0;
        await forEachRequestsByTimePage(currentTs, hourEndTs, async (slice) => {
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
                  totalDepositUsd += parseFloat(event.deposit.amount?.toString?.() || "0");
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
              console.error(`Error converting Relay request ${req?.id}:`, e);
            }
          }

          if (sourceTransactions.length || destinationTransactions.length) {
            await sql.begin(async (sql) => {
              if (sourceTransactions.length) await insertTransactionRows(sql, true, sourceTransactions, "upsert");
              if (destinationTransactions.length) await insertTransactionRows(sql, true, destinationTransactions, "upsert");
            });
            console.log(
              `Inserted page ${pageIndex}: ${sourceTransactions.length} deposits, ${destinationTransactions.length} withdrawals`
            );
          } else {
            console.log(`Page ${pageIndex} had no convertible requests`);
          }
        });
      } catch (error) {
        console.error(`Error processing hour ${currentTs} to ${hourEndTs}:`, error);
      }

      currentTs = hourEndTs;
    }

    console.log(`Relay processing complete. Total deposit USD: ${totalDepositUsd}`);
  } catch (error) {
    console.error("Fatal error in Relay handler:", error);
    throw error;
  }
};


export default wrapScheduledLambda(handler);
