import { insertConfigEntriesForAdapter } from "../utils/adapter";
import { build, getEvents } from "../adapters/hyperlane";
import dayjs from "dayjs";
import _ from "lodash";
import { insertTransactionRows } from "../utils/wrappa/postgres/write";
import { getBridgeID } from "../utils/wrappa/postgres/query";
import { sql } from "../utils/db";

export const handler = async () => {
  try {
    const adapter = await build();
    await insertConfigEntriesForAdapter(adapter, "hyperlane");
    const bridgeIds = Object.fromEntries(
      await Promise.all(
        Object.keys(adapter).map(async (chain) => {
          return [chain, (await getBridgeID("hyperlane", chain)).id];
        })
      )
    );
    console.log(bridgeIds);
    let startTs = dayjs().subtract(48, "hours").unix();
    const endTs = dayjs().unix();

    while (startTs < endTs) {
      const toTs = startTs + 60 * 60;
      const events = await getEvents(startTs, toTs);
      const transactions = events.map((event) => ({
        bridge_id: bridgeIds[event.chain!],
        chain: event.chain!,
        tx_hash: event.txHash,
        ts: event.timestamp! * 1000,
        tx_block: event.blockNumber,
        tx_from: event.from,
        tx_to: event.to,
        token: event.token,
        amount: event.amount.toString(),
        is_deposit: event.isDeposit,
        is_usd_volume: true,
        txs_counted_as: 1,
        origin_chain: null,
      }));
      startTs = toTs;
      await sql.begin(async (sql) => {
        const batchSize = 200;
        const transactionChunks = _.chunk(transactions, batchSize);
        for (const batch of transactionChunks) {
          await insertTransactionRows(sql, true, batch, "upsert");
        }
      });
      console.log(`Inserted ${transactions.length} transactions for ${startTs} to ${endTs}`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default handler;
