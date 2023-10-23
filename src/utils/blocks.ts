import { getLatestBlock as getLatestBlockSdk } from "@defillama/sdk/build/util";
import { getClient } from "../helpers/sui";
import { tronGetLatestBlock } from "../helpers/tron";

export async function getLatestBlockNumber(chain: string): Promise<number> {
  if (chain === "sui") {
    const client = getClient();
    return Number(await client.getLatestCheckpointSequenceNumber());
  } else if (chain === "tron") {
    return (await tronGetLatestBlock()).number;
  }
  return (await getLatestBlockSdk(chain)).number;
}

export async function getLatestBlock(chain: string): Promise<{ number: number; timestamp: number }> {
  if (chain === "sui") {
    const client = getClient();
    const seqNumber = await client.getLatestCheckpointSequenceNumber();
    const { timestampMs } = await client.getCheckpoint({ id: seqNumber });
    return { number: Number(seqNumber), timestamp: Number(timestampMs) };
  } else if (chain === "tron") {
    return await tronGetLatestBlock();
  }
  return await getLatestBlockSdk(chain);
}
