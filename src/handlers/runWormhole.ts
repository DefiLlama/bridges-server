import { wrapScheduledLambda } from "../utils/wrap";
import adapter, { fetchWormholeEvents, normalizeChainName } from "../adapters/wormhole";
import { sql } from "../utils/db";
import { insertTransactionRows } from "../utils/wrappa/postgres/write";
import { getBridgeID } from "../utils/wrappa/postgres/query";
import dayjs from "dayjs";
import { insertConfigEntriesForAdapter } from "../utils/adapter";
export const handler = async () => {
  try {
    await insertConfigEntriesForAdapter(adapter, "wormhole");
    const startTs = dayjs().subtract(1, "days").unix();
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
    const usdVolume = events.reduce((acc, event) => acc + (Number(event.token_usd_amount) || 0), 0);
    console.log(`Total USD volume: ${usdVolume * 2}`);

    // Prepare all rows before starting transactions
    const prepareRows = (events: any[]) => {
      const rows: any[] = [];

      for (const event of events) {
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
          rows.push({
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
          rows.push({
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
      return rows;
    };

    const allRows = prepareRows(events);
    console.log(`Prepared ${allRows.length} rows for insertion`);

    try {
      await sql.begin(async (trx) => {
        await insertTransactionRows(trx, true, allRows);
      });
      console.log(`Successfully inserted ${allRows.length} Wormhole events`);
    } catch (error) {
      console.error("Failed to insert Wormhole events:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error processing Wormhole events:", error);
    throw error;
  }
};

export default wrapScheduledLambda(handler);
