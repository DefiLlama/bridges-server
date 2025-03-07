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
import bridgeNetworkData from "../data/bridgeNetworkData";
const retry = require("async-retry");

const connection = getConnection();

async function getLatestSlot() {
  return await connection.getSlot("finalized");
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

async function getBlockTime(slotNumber: number) {
  const response = await connection.getBlockTime(slotNumber);
  return response;
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
    const number = await getLatestSlot();
    const timestamp = await getBlockTime(number);
    if (timestamp === null) {
      throw new Error("Failed to get block time");
    }
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
    const { timestamp: latestTimestamp, number: latestSlot } = await getLatestBlock(chain);

    if (timestamp <= latestTimestamp) {
      const estimatedSlot = latestSlot - Math.floor(((latestTimestamp - timestamp) * 1000) / 400);
      const slotTs = await connection.getBlockTime(estimatedSlot);

      if (slotTs === null) {
        throw new Error("Failed to get block time");
      }

      if (Math.abs(slotTs - timestamp) > 400) {
        const blocksOffset = Math.floor(((slotTs - timestamp) * 1000) / 400);
        return { block: estimatedSlot - blocksOffset, timestamp };
      }
      return { block: estimatedSlot, timestamp };
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
  if (!latestBlock) {
    const timestamp = await getBlockTime(slot);
    if (timestamp === null) {
      throw new Error("Failed to get block time");
    }
    return timestamp;
  }

  const { timestamp: latestTimestamp, number: latestSlot } = latestBlock;
  return latestTimestamp - ((latestSlot - slot) * 400) / 1000;
}

const allChains = bridgeNetworkData.flatMap((x) => x.chains.map((y) => y.toLowerCase()));
const allMappings = bridgeNetworkData.reduce((acc: Record<string, string>, x: any) => {
  if (x.chainMapping) {
    Object.keys(x.chainMapping).forEach((y) => (acc[y.toLowerCase()] = x.chainMapping[y]));
  }
  return acc;
}, {});

const allMappedChains = [...new Set(allChains.map((x) => allMappings[x] || x))];
export const getBlocksByAllChains = async (startTs: number, endTs: number) => {
  const blockByChain: Record<string, { startBlock: number; endBlock: number }> = {};
  const errorChains: string[] = [];
  await Promise.all(
    allMappedChains.map(async (chain) => {
      try {
        const startBlock = await retry(() => getBlockByTimestamp(startTs, chain as Chain), {
          retries: 3,
          factor: 1,
        });
        const endBlock = await retry(() => getBlockByTimestamp(endTs, chain as Chain), {
          retries: 3,
          factor: 1,
        });
        blockByChain[chain] = {
          startBlock: startBlock.block,
          endBlock: endBlock.block,
        };
        console.log(`Set blocks for ${chain}: ${startBlock.block} to ${endBlock.block}`);
      } catch (e) {
        errorChains.push(chain);
      }
    })
  );
  console.log(blockByChain);
  console.log(`Error chains: ${errorChains.join(", ")}`);
  return blockByChain;
};
