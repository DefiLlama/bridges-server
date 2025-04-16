import { wrapScheduledLambda } from "../utils/wrap";
import adapter, { fetchInterSoonEvents } from "../adapters/intersoon";
import { sql } from "../utils/db";
import { insertTransactionRows } from "../utils/wrappa/postgres/write";
import { getBridgeID } from "../utils/wrappa/postgres/query";
import dayjs from "dayjs";
import { insertConfigEntriesForAdapter } from "../utils/adapter";
import { setCache } from "../utils/cache";

const END_TS_KEY = "24h_intersoon_volume";

export const handler = async () => {
  try {
    await insertConfigEntriesForAdapter(adapter, "intersoon");
    const startTs = dayjs().subtract(24, "hour").unix();
    const endTs = dayjs().unix();
    const bridgeIds = Object.fromEntries(
      await Promise.all(
        Object.keys(adapter).map(async (chain) => {
          chain = chain.toLowerCase();
          const bridgeId = await getBridgeID("intersoon", chain);
          return [chain, bridgeId?.id];
        })
      )
    );
    console.log(
      `Running InterSoon adapter for ${startTs} (${dayjs
        .unix(startTs)
        .format("YYYY-MM-DD HH:mm:ss")}) to ${endTs} (${dayjs.unix(endTs).format("YYYY-MM-DD HH:mm:ss")})`
    );
    const events = await fetchInterSoonEvents(startTs, endTs);
    const BATCH_SIZE = 500;
    let bathesInserted = 1;

    const processBatch = async (sql: any, batch: any[]) => {
      const start = dayjs().unix();
      const sourceTransactions = [];
      const destinationTransactions = [];

      for (const event of batch) {
        const {
          block_timestamp,
          transaction_hash,
          token_transfer_from_address,
          token_transfer_to_address,
          token_address,
          token_usd_amount,
          source_chain,
          destination_chain,
        } = event;

        if (bridgeIds[source_chain]) {
          sourceTransactions.push({
            bridge_id: bridgeIds[source_chain],
            chain: source_chain,
            tx_hash: transaction_hash,
            ts: parseInt(block_timestamp) * 1000,
            tx_block: null,
            tx_from: token_transfer_from_address,
            tx_to: token_transfer_to_address,
            token: token_address,
            amount: token_usd_amount || "0",
            is_deposit: true,
            is_usd_volume: true,
            txs_counted_as: 1,
            origin_chain: null,
          });
        }

        if (bridgeIds[destination_chain]) {
          destinationTransactions.push({
            bridge_id: bridgeIds[destination_chain],
            chain: destination_chain,
            tx_hash: `${transaction_hash}_destination`,
            ts: parseInt(block_timestamp) * 1000,
            tx_block: null,
            tx_from: token_transfer_to_address,
            tx_to: token_transfer_from_address,
            token: token_address,
            amount: token_usd_amount || "0",
            is_deposit: false,
            is_usd_volume: true,
            txs_counted_as: 1,
            origin_chain: null,
          });
        }
      }

      try {
        if (sourceTransactions.length > 0) {
          await insertTransactionRows(sql, true, sourceTransactions, "upsert");
        }
        if (destinationTransactions.length > 0) {
          await insertTransactionRows(sql, true, destinationTransactions, "upsert");
        }
      } catch (error) {
        console.error(`Error inserting InterSoon batch:`, error);
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
    const totalVolume = events.reduce((acc: number, curr: any) => acc + parseFloat(curr.token_usd_amount || "0"), 0);
    await setCache(END_TS_KEY, totalVolume, null);
  } catch (error) {
    throw error;
  }
};

export default wrapScheduledLambda(handler);
