import { wrapScheduledLambda } from "../utils/wrap";
import adapter, { forEachTransactionsByTimePage, convertTransactionToEvent } from "../adapters/cashmere";
import { domainToChain, usdcAddresses } from "../adapters/cashmere/types";
import { sql } from "../utils/db";
import { insertTransactionRows } from "../utils/wrappa/postgres/write";
import { getBridgeID } from "../utils/wrappa/postgres/query";
import { insertConfigEntriesForAdapter } from "../utils/adapter";
import dayjs from "dayjs";

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

    let totalDepositUsd = 0;
    let totalWithdrawUsd = 0;
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
        await forEachTransactionsByTimePage(currentTs, hourEndTs, async (transactions) => {
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
                  totalDepositUsd += parseFloat(event.deposit.amount?.toString?.() || "0");
                  sourceTransactions.push({
                    bridge_id: bId,
                    chain: depositChain.toLowerCase(),
                    tx_hash: event.deposit.txHash,
                    ts: event.deposit.timestamp!,
                    tx_block: event.deposit.blockNumber || null,
                    tx_from: event.deposit.from ?? "0x",
                    tx_to: event.deposit.to ?? "0x",
                    token: event.deposit.token ?? usdcAddresses[depositChain] ?? "0xA0b86a33E6441986C3103F5f1b26E86d1e5F0d22", // USDC
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
                  totalWithdrawUsd += parseFloat(event.withdraw.amount?.toString?.() || "0");
                  destinationTransactions.push({
                    bridge_id: bId,
                    chain: withdrawChain.toLowerCase(),
                    tx_hash: event.withdraw.txHash,
                    ts: event.withdraw.timestamp!,
                    tx_block: event.withdraw.blockNumber || null,
                    tx_from: event.withdraw.from ?? "0x",
                    tx_to: event.withdraw.to ?? "0x",
                    token: event.withdraw.token ?? usdcAddresses[withdrawChain] ?? "0xA0b86a33E6441986C3103F5f1b26E86d1e5F0d22", // USDC
                    amount: event.withdraw.amount?.toString?.() || "0",
                    is_deposit: false,
                    is_usd_volume: true, // Key: amounts are already USD
                    txs_counted_as: 1,
                    origin_chain: null,
                  });
                }
              }
            } catch (e) {
              console.error(`Error converting Cashmere transaction ${tx?.id}:`, e);
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
            console.log(`Page ${pageIndex} had no convertible transactions`);
          }
        });
      } catch (error) {
        console.error(`Error processing hour ${currentTs} to ${hourEndTs}:`, error);
      }

      currentTs = hourEndTs;
    }

    console.log(`Cashmere CCTP processing complete. Total deposit USD: ${totalDepositUsd}, Total withdraw USD: ${totalWithdrawUsd}`);
  } catch (error) {
    console.error("Fatal error in Cashmere handler:", error);
    throw error;
  }
};

export default wrapScheduledLambda(handler);
