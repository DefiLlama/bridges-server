import { getLatestBlock as getLatestBlockSdk, lookupBlock as lookupBlockSdk } from "@defillama/sdk/build/util";
// import { getClient } from "../helpers/sui";
import { tronGetLatestBlock } from "../helpers/tron";
import { getConnection } from "../helpers/solana";
import { Chain } from "@defillama/sdk/build/general";
import fetch from "node-fetch";
import { BridgeNetwork } from "../data/types";
import {
  getLatestBlockHeightForZoneFromMoz,
  getLatestBlockForZoneFromMoz,
  ibcGetBlockFromTimestamp,
} from "../adapters/ibc";
const retry = require("async-retry");

async function getLatestSlot(rpcUrl = "https://api.mainnet-beta.solana.com") {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getSlot",
      params: [
        {
          commitment: "finalized",
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`RPC error: ${data.error.message}`);
  }
  return data.result;
}

export async function getLatestBlockNumber(chain: string, bridge?: string): Promise<number> {
  if (chain === "sui") {
    // const client = getClient();
    // return Number(await client.getLatestCheckpointSequenceNumber());
  } else if (chain === "solana") {
    return await getLatestSlot();
  } else if (chain === "tron") {
    return (await tronGetLatestBlock()).number;
  } else if (bridge && bridge === "ibc") {
    return await getLatestBlockHeightForZoneFromMoz(chain);
  }
  return (await getLatestBlock(chain, bridge)).number;
}

const lookupBlock = async (timestamp: number, { chain }: { chain: Chain }) => {
  try {
    const block = await retry(() => lookupBlockSdk(timestamp, { chain }), { retries: 3, factor: 1 });

    return block;
  } catch (e) {
    console.error(e);
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
      console.error(`Could not find block for timestamp ${timestamp} on chain ${chain}`);
      throw new Error(`Could not find block for timestamp ${timestamp} on chain ${chain}`);
    }
    return blockRes;
  }
};

async function getBlockTime(slotNumber: number, rpcUrl = "https://api.mainnet-beta.solana.com") {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getBlockTime",
      params: [slotNumber],
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`RPC error: ${data.error.message}`);
  }

  return data.result;
}

export async function getLatestBlock(chain: string, bridge?: string): Promise<{ number: number; timestamp: number }> {
  if (chain === "sui") {
    // const client = getClient();
    // const seqNumber = await client.getLatestCheckpointSequenceNumber();
    // const { timestampMs } = await client.getCheckpoint({ id: seqNumber });
    // return { number: Number(seqNumber), timestamp: Number(timestampMs) };
  } else if (chain === "tron") {
    return await tronGetLatestBlock();
  } else if (chain === "solana") {
    let number = await getLatestSlot();
    let timestamp: number | null = null;
    do {
      timestamp = await getBlockTime(number);
    } while (timestamp === null);
    return { number, timestamp };
  } else if (bridge && bridge === "ibc") {
    return await getLatestBlockForZoneFromMoz(chain);
  }

  const timestamp = Math.floor(Date.now() / 1000) - 60;
  return await lookupBlock(timestamp, { chain });
}

export async function getBlockByTimestamp(
  timestamp: number,
  chain: Chain,
  bridge?: BridgeNetwork,
  position?: "First" | "Last"
) {
  if (bridge && bridge.bridgeDbName === "ibc") {
    return await ibcGetBlockFromTimestamp(bridge, timestamp, chain, position);
  } else if (chain === "solana") {
    const connection = getConnection();
    const { timestamp: latestTimestamp, number } = await getLatestBlock(chain);
    // There is not an easy way to get the slot number from a timestamp on Solana
    // without hammering the RPC node with requests.
    // So we estimate it by assuming that a slot is produced every 400ms.
    if (timestamp <= latestTimestamp) {
      const slot = number - Math.floor(((latestTimestamp - timestamp) * 1000) / 400);
      const slotTs = (await connection.getBlockTime(slot)) as any;
      if (Math.abs(slotTs - timestamp) > 400) {
        const blocksOffset = Math.floor(((slotTs - timestamp) * 1000) / 400);

        return { block: slot - blocksOffset, timestamp };
      }
      return { block: slot, timestamp };
    }
  } else {
    return await lookupBlock(timestamp, { chain });
  }
  throw new Error(`Could not find block for timestamp ${timestamp} on chain ${chain}`);
}

export async function getTimestampBySolanaSlot(
  slot: number,
  latestBlock?: { number: number; timestamp: number } | null
) {
  const { timestamp: latestTimestamp, number } = latestBlock ? latestBlock : await getLatestBlock("solana");

  const timestamp = latestTimestamp - ((number - slot) * 400) / 1000;

  return timestamp;
}
