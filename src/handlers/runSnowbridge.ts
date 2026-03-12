import { insertConfigEntriesForAdapter } from "../utils/adapter";
import { BridgeAdapter } from "../helpers/bridgeAdapter.type";
import { EventData } from "../utils/types";
import dayjs from "dayjs";
import _ from "lodash";
import { insertTransactionRows } from "../utils/wrappa/postgres/write";
import { getBridgeID } from "../utils/wrappa/postgres/query";
import { sql } from "../utils/db";
import { BigNumber, ethers } from "ethers";
import { getLlamaPrices } from "../utils/prices";

const bridgeName = "snowbridge";

/** DefiLlama token id for native ETH (used for price). */
const ETH_PRICE_TOKEN_ID = "ethereum:0x0000000000000000000000000000000000000000";

const SNOWBRIDGE_ETHER_API =
  "https://dashboard.snowbridge.network/api/transfers-by-token?token=0x0000000000000000000000000000000000000000";

/** API transfer item from Snowbridge dashboard (toEthereum / toPolkadot) */
interface SnowbridgeTransfer {
  messageId: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  tokenAddress: string;
  amount: string;
  status: number;
  direction: "toEthereum" | "toPolkadot";
}

interface SnowbridgeApiResponse {
  toEthereum: SnowbridgeTransfer[];
  toPolkadot: SnowbridgeTransfer[];
}

function toEventData(t: SnowbridgeTransfer, direction: "toEthereum" | "toPolkadot"): EventData {
  const ts = new Date(t.timestamp).getTime() / 1000;
  return {
    blockNumber: t.blockNumber,
    txHash: t.txHash,
    from: "0x",
    to: "0x",
    token: t.tokenAddress,
    amount: BigNumber.from(t.amount),
    isDeposit: direction === "toPolkadot",
    chain: "ethereum",
    timestamp: ts,
  };
}

/**
 * Load ether (native token) transfer events from Snowbridge dashboard API.
 * toPolkadot => source chain ethereum; toEthereum => source chain polkadot.
 */
const getEvents = async (fromTimestamp: number, toTimestamp: number): Promise<EventData[]> => {
  const res = await fetch(SNOWBRIDGE_ETHER_API);
  if (!res.ok) {
    throw new Error(`Snowbridge API error: ${res.status} ${res.statusText}`);
  }
  const data: SnowbridgeApiResponse = await res.json();

  const inRange = (t: SnowbridgeTransfer) => {
    const ts = new Date(t.timestamp).getTime() / 1000;
    return ts >= fromTimestamp && ts < toTimestamp;
  };

  const toPolkadot: EventData[] = (data.toPolkadot ?? []).filter(inRange).map((t) => toEventData(t, "toPolkadot"));
  const toEthereum: EventData[] = (data.toEthereum ?? []).filter(inRange).map((t) => toEventData(t, "toEthereum"));

  return [...toPolkadot, ...toEthereum];
};

/** Adapter shape for config/bridge IDs only; event fetching is via getEvents. */
const snowbridgeEtherAdapter: BridgeAdapter = {
  ethereum: async () => [],
  polkadot: async () => [],
};

export const handler = async () => {
  try {
    await insertConfigEntriesForAdapter(snowbridgeEtherAdapter, bridgeName);
    const bridgeIds = Object.fromEntries(
      await Promise.all(
        Object.keys(snowbridgeEtherAdapter).map(async (chain) => {
          return [chain, (await getBridgeID(bridgeName, chain)).id];
        })
      )
    );
    console.log(bridgeIds);

    const prices = await getLlamaPrices([ETH_PRICE_TOKEN_ID]);
    const ethPrice = prices[ETH_PRICE_TOKEN_ID]?.price;
    if (typeof ethPrice !== "number" || ethPrice <= 0) {
      throw new Error(`Failed to get ETH price from DefiLlama (got: ${ethPrice})`);
    }

    let startTs = dayjs().subtract(24, "hours").unix();
    const endTs = dayjs().unix();

    while (startTs < endTs) {
      const toTs = startTs + 60 * 60;
      const events = await getEvents(startTs, toTs);
      const transactions = events
        .map((event) => {
          const amountEth = parseFloat(ethers.utils.formatEther(event.amount));
          const amountUsd = amountEth * ethPrice;
          return {
            bridge_id: bridgeIds[event.chain!],
            chain: event.chain!,
            tx_hash: event.txHash,
            ts: (event.timestamp ?? 0) * 1000,
            tx_block: event.blockNumber,
            tx_from: event.from,
            tx_to: event.to,
            token: event.token,
            amount: amountUsd.toString(),
            is_deposit: event.isDeposit,
            is_usd_volume: true,
            txs_counted_as: 1,
            origin_chain: null,
          };
        })
        .filter((tx) => !!tx.bridge_id);
      startTs = toTs;
      await sql.begin(async (sql) => {
        const batchSize = 200;
        const transactionChunks = _.chunk(transactions, batchSize);
        for (const batch of transactionChunks) {
          await insertTransactionRows(sql, true, batch, "upsert");
        }
      });
      console.log(`Inserted ${transactions.length} transactions for ${startTs} to ${toTs}`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default handler;
