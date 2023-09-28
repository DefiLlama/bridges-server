import { getLatestBlock as getLatestBlockSdk } from "@defillama/sdk/build/util";
import { getConnection } from "../helpers/solana";
import { tronGetLatestBlock } from "../helpers/tron";

export async function getLatestBlockNumber(chain: string): Promise<number> {
  if (chain === "solana") {
    const connection = getConnection();
    return await connection.getSlot();
  } else if (chain === "tron") {
    return (await tronGetLatestBlock()).number;
  }
  return (await getLatestBlockSdk(chain)).number;
}

export async function getLatestBlock(chain: string): Promise<{ number: number; timestamp: number }> {
  if (chain === "solana") {
    const connection = getConnection();
    let number = await connection.getSlot();
    let timestamp: number | null = null;
    do {
      timestamp = await connection.getBlockTime(number);
    } while (timestamp === null);
    return { number, timestamp };
  } else if (chain === "tron") {
    return await tronGetLatestBlock();
  }
  return await getLatestBlock(chain);
}
