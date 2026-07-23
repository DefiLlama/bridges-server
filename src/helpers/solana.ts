import { Connection } from "@solana/web3.js";
import { formatError } from "../utils/errors";

export const getConnection = (): Connection => {
  const rpc = "https://api.mainnet-beta.solana.com";
  const connection = new Connection(rpc);
  const getBlock = async (block: number) => {
    return new Connection(rpc).getBlock(block, {
      maxSupportedTransactionVersion: 0,
    }) as any;
  };

  connection.getBlock = getBlock;
  return connection;
};

type BlockTimeConnection = Pick<Connection, "getBlockTime">;
const SKIPPED_SLOT_ERROR = /slot(?: \d+)? was skipped|missing in long-term storage|block not available/i;

export const isSkippedSolanaSlotError = (error: unknown) =>
  error instanceof Error && SKIPPED_SLOT_ERROR.test(error.message);

export const getEstimatedSolanaSlotTimestamp = async (
  slot: number,
  connection: BlockTimeConnection = getConnection(),
  maxLookbackSlots: number = 64
): Promise<number> => {
  let lastError: unknown;
  for (let offset = 0; offset <= maxLookbackSlots; offset++) {
    try {
      const timestamp = await connection.getBlockTime(slot - offset);
      if (timestamp !== null) {
        // Solana slots target roughly 400 ms. Estimate the skipped target slot
        // from the nearest earlier slot instead of poisoning the checkpoint.
        return timestamp + Math.round(offset * 0.4);
      }
    } catch (error) {
      if (!isSkippedSolanaSlotError(error)) {
        throw new Error(`Unable to fetch Solana block time for slot ${slot - offset}: ${formatError(error)}`);
      }
      lastError = error;
    }
    if (offset < maxLookbackSlots) await new Promise<void>((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(
    `Unable to resolve block time for Solana slot ${slot} after ${maxLookbackSlots} lookback slots: ${formatError(
      lastError
    )}`
  );
};
