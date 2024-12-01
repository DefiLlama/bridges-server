import { wrapScheduledLambda } from "../utils/wrap";
import adapter, { fetchWormholeEvents, normalizeChainName } from "../adapters/wormhole";
import { sql } from "../utils/db";
import { insertTransactionRow } from "../utils/wrappa/postgres/write";
import { getBridgeID } from "../utils/wrappa/postgres/query";
import dayjs from "dayjs";
import { insertConfigEntriesForAdapter } from "../utils/adapter";
export const handler = async () => {
  try {
    await insertConfigEntriesForAdapter(adapter, "wormhole");
    const startTs = dayjs().subtract(1, "day").unix();
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

    for (let i = 0; i < events.length; i += BATCH_SIZE) {
      await sql.begin(async (sql) => {
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
        }

        await Promise.all(insertPromises);
        console.log(`Inserted ${insertPromises.length} of ${events.length} Wormhole events`);
      });
    }
  } catch (error) {
    console.error("Error processing Wormhole events:", error);
    throw error;
  }
};

export default wrapScheduledLambda(handler);
