import { wrapScheduledLambda } from "../utils/wrap";
import adapter, { fetchWormholeEvents, normalizeChainName } from "../adapters/wormhole";
import { sql } from "../utils/db";
import { insertTransactionRow } from "../utils/wrappa/postgres/write";
import { getBridgeID } from "../utils/wrappa/postgres/query";
import dayjs from "dayjs";
import { insertConfigEntriesForAdapter } from "../utils/adapter";
import { cache, getCacheKey } from "../utils/cache";

const WORMHOLE_CACHE_PREFIX = "wormhole";
const LAST_PROCESSED_TS_KEY = `${WORMHOLE_CACHE_PREFIX}:last_processed_ts`;

const getProcessedTxsKey = (timestamp: number) => {
  const date = dayjs(timestamp * 1000)
    .startOf("day")
    .format("YYYY-MM-DD");
  return `${WORMHOLE_CACHE_PREFIX}:processed_txs:${date}`;
};

export const handler = async () => {
  try {
    await insertConfigEntriesForAdapter(adapter, "wormhole");

    const lastProcessedTs = cache.get(LAST_PROCESSED_TS_KEY) || dayjs().subtract(1, "day").unix();
    const endTs = dayjs().unix();

    const MAX_TIME_CHUNK = 60 * 60 * 24;
    const timeGap = endTs - lastProcessedTs;

    if (timeGap > MAX_TIME_CHUNK) {
      for (let chunkStart = lastProcessedTs; chunkStart < endTs; chunkStart += MAX_TIME_CHUNK) {
        const chunkEnd = Math.min(chunkStart + MAX_TIME_CHUNK, endTs);
        await processTimeRange(chunkStart, chunkEnd);
      }
    } else {
      await processTimeRange(lastProcessedTs, endTs);
    }

    cache.set(LAST_PROCESSED_TS_KEY, endTs);
  } catch (error) {
    console.error("Error processing Wormhole events:", error);
    throw error;
  }
};

const processTimeRange = async (startTs: number, endTs: number) => {
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
    `Running Wormhole adapter for ${startTs} (${dayjs.unix(startTs).format("YYYY-MM-DD HH:mm:ss")}) to ${endTs} (${dayjs
      .unix(endTs)
      .format("YYYY-MM-DD HH:mm:ss")})`
  );

  const cacheKey = getCacheKey(WORMHOLE_CACHE_PREFIX, startTs.toString(), endTs.toString());
  let events = cache.get(cacheKey);

  if (!events) {
    events = await fetchWormholeEvents(startTs, endTs);
    cache.set(cacheKey, events, { ttl: 60 * 60 * 1000 });
  }

  const BATCH_SIZE = 500;
  const dayKey = getProcessedTxsKey(startTs);
  let processedTxs = cache.get(dayKey) || {};

  await sql.begin(async (sql) => {
    for (let i = 0; i < events.length; i += BATCH_SIZE) {
      const batch = events.slice(i, i + BATCH_SIZE);
      const insertPromises: Promise<void>[] = [];

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

        if (processedTxs?.[transaction_hash]) {
          continue;
        }

        const sourceChain = normalizeChainName(source_chain);
        const destinationChain = normalizeChainName(destination_chain);

        if (bridgeIds[sourceChain]) {
          try {
            insertPromises.push(
              insertTransactionRow(
                sql,
                true,
                {
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
                },
                "upsert"
              )
            );
          } catch (error) {
            console.error(`Error inserting Wormhole event: ${error}`, event);
          }
        }

        if (bridgeIds[destinationChain]) {
          try {
            insertPromises.push(
              insertTransactionRow(
                sql,
                true,
                {
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
                },
                "upsert"
              )
            );
          } catch (error) {
            console.error(`Error inserting Wormhole event: ${error}`, event);
          }
        }

        processedTxs[transaction_hash] = true;
      }

      if (insertPromises.length > 0) {
        await Promise.all(insertPromises);
        console.log(`Inserted ${insertPromises.length} Wormhole events (batch ${i / BATCH_SIZE + 1})`);
      }
    }
  });

  cache.set(dayKey, processedTxs, { ttl: 48 * 60 * 60 * 1000 });
};

export default wrapScheduledLambda(handler);
