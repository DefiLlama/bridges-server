import { getLatestBlock as getLatestBlockSdk } from "@defillama/sdk/build/util";
// import { getClient } from "../helpers/sui";
import { tronGetLatestBlock } from "../helpers/tron";
import { getConnection } from "../helpers/solana";

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
  return (await getLatestBlockSdk(chain)).number;
}

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
  return await getLatestBlockSdk(chain);
}
