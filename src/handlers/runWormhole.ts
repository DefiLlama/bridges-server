import { wrapScheduledLambda } from "../utils/wrap";
import adapter, { fetchWormholeEvents, normalizeChainName } from "../adapters/wormhole";
import { sql } from "../utils/db";
import { insertTransactionRows } from "../utils/wrappa/postgres/write";
import { getBridgeID } from "../utils/wrappa/postgres/query";
import dayjs from "dayjs";
import { insertConfigEntriesForAdapter } from "../utils/adapter";
import { getCache, setCache } from "../utils/cache";

const END_TS_KEY = "wormhole_end_ts";

export const handler = async () => {
  const previousEndTs = await getCache(END_TS_KEY);
  let currentEndTs = previousEndTs;
  try {
    await insertConfigEntriesForAdapter(adapter, "wormhole");
    const startTs = previousEndTs ? previousEndTs : dayjs().subtract(24, "hour").unix();
    const endTs = dayjs().unix();
    const bridgeIds = Object.fromEntries(
      await Promise.all(
        Object.keys(adapter).map(async (chain) => {
          chain = chain.toLowerCase();
          const bridgeId = await getBridgeID("wormhole", chain);
          return [chain, bridgeId?.id];
        })
      )
    );
    console.log(
      `Running Wormhole adapter for ${startTs} (${dayjs
        .unix(startTs)
        .format("YYYY-MM-DD HH:mm:ss")}) to ${endTs} (${dayjs.unix(endTs).format("YYYY-MM-DD HH:mm:ss")})`
    );
    const events = await fetchWormholeEvents(startTs, endTs);
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

        const sourceChain = normalizeChainName(source_chain);
        const destinationChain = normalizeChainName(destination_chain);

        if (bridgeIds[sourceChain]) {
          sourceTransactions.push({
            bridge_id: bridgeIds[sourceChain],
            chain: sourceChain,
            tx_hash: transaction_hash,
            ts: parseInt(block_timestamp) * 1000,
            tx_block: null,
            tx_from: token_transfer_from_address ?? "0x",
            tx_to: token_transfer_to_address ?? "0x",
            token: token_address ?? "0x0000000000000000000000000000000000000000",
            amount: token_usd_amount || "0",
            is_deposit: true,
            is_usd_volume: true,
            txs_counted_as: 1,
            origin_chain: null,
          });
        }

        if (bridgeIds[destinationChain]) {
          destinationTransactions.push({
            bridge_id: bridgeIds[destinationChain],
            chain: destinationChain,
            tx_hash: `${transaction_hash}_destination`,
            ts: parseInt(block_timestamp) * 1000,
            tx_block: null,
            tx_from: token_transfer_to_address ?? "0x",
            tx_to: token_transfer_from_address ?? "0x",
            token: token_address ?? "0x0000000000000000000000000000000000000000",
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
        await setCache(END_TS_KEY, batch[batch.length - 1].block_timestamp, null);
      } catch (error) {
        console.error(`Error inserting Wormhole batch:`, error);
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
  } catch (error) {
    throw error;
  }
};

export default wrapScheduledLambda(handler);
