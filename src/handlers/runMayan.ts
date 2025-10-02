import { wrapScheduledLambda } from "../utils/wrap";
import adapter, { fetchMayanEvents, normalizeChainName } from "../adapters/mayan";
import { sql } from "../utils/db";
import { insertTransactionRows } from "../utils/wrappa/postgres/write";
import { getBridgeID } from "../utils/wrappa/postgres/query";
import dayjs from "dayjs";
import { insertConfigEntriesForAdapter } from "../utils/adapter";
import { setCache } from "../utils/cache";

const END_TS_KEY = "24h_mayan_volume";

export const handler = async () => {
  try {
    await insertConfigEntriesForAdapter(adapter, "mayan");
    const startTs = dayjs().subtract(24, "hour").unix();
    const endTs = dayjs().unix();
    const bridgeIds = Object.fromEntries(
      await Promise.all(
        Object.keys(adapter).map(async (chain) => {
          chain = chain.toLowerCase();
          const bridgeId = await getBridgeID("mayan", chain);
          return [chain, bridgeId?.id];
        })
      )
    );
    console.log(
      `Running Mayan adapter for ${startTs} (${dayjs.unix(startTs).format("YYYY-MM-DD HH:mm:ss")}) to ${endTs} (${dayjs
        .unix(endTs)
        .format("YYYY-MM-DD HH:mm:ss")})`
    );
    const events = await fetchMayanEvents(startTs, endTs);
    const BATCH_SIZE = 500;
    let bathesInserted = 1;

    const processBatch = async (sql: any, batch: any[]) => {
      const start = dayjs().unix();
      const transactions = [];

      for (const event of batch) {
        const {
          block_timestamp,
          transaction_hash,
          token_transfer_from_address,
          token_transfer_to_address,
          token_address,
          token_amount,
          source_chain,
          destination_chain,
          is_deposit,
        } = event;

        const sourceChain = normalizeChainName(source_chain);
        const destinationChain = normalizeChainName(destination_chain);

        // Determine the correct chain to use for the bridge_id based on deposit status
        const transactionChain = is_deposit ? destinationChain : sourceChain;
        const originChain = is_deposit ? sourceChain : null;

        // Only create one transaction per event, using the appropriate chain's bridge_id
        if (bridgeIds[transactionChain]) {
          transactions.push({
            bridge_id: bridgeIds[transactionChain],
            chain: transactionChain,
            tx_hash: transaction_hash,
            ts: parseInt(block_timestamp) * 1000,
            tx_block: null,
            tx_from: token_transfer_from_address ?? "0x",
            tx_to: token_transfer_to_address ?? "0x",
            token: token_address ?? "0x0000000000000000000000000000000000000000",
            amount: token_amount ?? "0",
            is_deposit: is_deposit,
            is_usd_volume: false,
            txs_counted_as: 1,
            origin_chain: originChain,
          });
        }
      }

      try {
        if (transactions.length > 0) {
          await insertTransactionRows(sql, true, transactions, "upsert");
        }
      } catch (error) {
        console.error(`Error inserting Mayan batch:`, error);
        throw error;
      }

      console.log(
        `Inserted ${bathesInserted} of ${Math.ceil(events.length / BATCH_SIZE)} batches in ${
          dayjs().unix() - start
        } seconds`
      );
      bathesInserted++;
    };

    let start = 0;
    const end = events.length;

    while (start < end) {
      const batchEnd = Math.min(start + BATCH_SIZE, end);
      await sql.begin(async (sql) => {
        await processBatch(sql, events.slice(start, batchEnd));
      });
      start += BATCH_SIZE;
    }
    // Calculate total volume, filtering outliers and avoiding double counting
    const totalVolume = events.reduce((acc: number, curr: any) => {
      const amount = parseFloat(curr.token_usd_amount || "0");

      // Skip transactions over $1M (outliers from API issues. Mayan's API pricing isn't perfectly reliable, a majority of the outliers are caught with this)
      if (amount > 1_000_000) {
        return acc;
      }

      // Only count deposits to avoid double counting (each bridge action has both deposit + withdrawal)
      if (!curr.is_deposit) {
        return acc;
      }

      return acc + amount;
    }, 0);

    console.log(`Mayan total volume: $${totalVolume}`);
    await setCache(END_TS_KEY, totalVolume, null);
  } catch (error) {
    throw error;
  }
};

// export default wrapScheduledLambda(handler);

handler().then(() => process.exit(0));
