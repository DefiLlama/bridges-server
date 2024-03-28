import { getLatestBlock as getLatestBlockSdk, lookupBlock as lookupBlockSdk } from "@defillama/sdk/build/util";
// import { getClient } from "../helpers/sui";
import { tronGetLatestBlock } from "../helpers/tron";
import { getConnection } from "../helpers/solana";
import { Chain } from "@defillama/sdk/build/general";
import fetch from "node-fetch";
const retry = require("async-retry");

export async function getLatestBlockNumber(chain: string): Promise<number> {
  if (chain === "sui") {
    // const client = getClient();
    // return Number(await client.getLatestCheckpointSequenceNumber());
  } else if (chain === "solana") {
    const connection = getConnection();
    return await connection.getSlot();
  } else if (chain === "tron") {
    return (await tronGetLatestBlock()).number;
  }
  return (await getLatestBlock(chain)).number;
}

const lookupBlock = async (timestamp: number, { chain }: { chain: Chain }) => {
  try {
    const block = await retry(
      () => fetch(`https://coins.llama.fi/block/${chain}/${timestamp}`).then((res) => res.json()),
      {
        retries: 3,
        factor: 1,
      }
    );
    const blockRes = {
      number: block.height,
      timestamp: block.timestamp,
      block: block.height,
    };
    if (!blockRes?.number) {
      throw new Error(`Could not find block for timestamp ${timestamp} on chain ${chain}`);
    }

    return blockRes;
  } catch (e) {
    console.error(e);
    const block = await retry(() => lookupBlockSdk(timestamp, { chain }), { retries: 3, factor: 1 });
    return block;
  }
};

export async function getLatestBlock(chain: string): Promise<{ number: number; timestamp: number }> {
  if (chain === "sui") {
    // const client = getClient();
    // const seqNumber = await client.getLatestCheckpointSequenceNumber();
    // const { timestampMs } = await client.getCheckpoint({ id: seqNumber });
    // return { number: Number(seqNumber), timestamp: Number(timestampMs) };
  } else if (chain === "tron") {
    return await tronGetLatestBlock();
  } else if (chain === "solana") {
    const connection = getConnection();
    let number = await connection.getSlot();
    let timestamp: number | null = null;
    do {
      timestamp = await connection.getBlockTime(number);
    } while (timestamp === null);
    return { number, timestamp };
  }
  const timestamp = Math.floor(Date.now() / 1000) - 60 * 10;
  return await lookupBlock(timestamp, { chain });
}

export async function getBlockByTimestamp(timestamp: number, chain: Chain) {
  if (chain === "solana") {
    const { timestamp: latestTimestamp, number } = await getLatestBlock(chain);
    // There is not an easy way to get the slot number from a timestamp on Solana
    // without hammering the RPC node with requests.
    // So we estimate it by assuming that a slot is produced every 400ms.
    if (timestamp <= latestTimestamp) {
      const slot = number - Math.floor(((latestTimestamp - timestamp) * 1000) / 400);
      return { block: slot, timestamp };
    }
  } else {
    return await lookupBlock(timestamp, { chain });
  }
  throw new Error(`Could not find block for timestamp ${timestamp} on chain ${chain}`);
}

export async function getTimestampBySolanaSlot(slot: number) {
  const { timestamp: latestTimestamp, number } = await getLatestBlock("solana");

  const timestamp = latestTimestamp - ((number - slot) * 400) / 1000;

  return timestamp;
}
