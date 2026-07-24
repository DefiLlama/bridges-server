import { Connection } from "@solana/web3.js";
import { formatError, throwIfAborted, waitWithSignal } from "../utils/errors";

export const getConnection = (): Connection => {
  const rpc = "https://api.mainnet-beta.solana.com";
  const connection = new Connection(rpc, {
    commitment: "confirmed",
    // The generic adapter runner owns bounded retries. Disabling web3.js's
    // hidden 429 loop prevents tens of thousands of concurrent retry logs.
    disableRetryOnRateLimit: true,
  });
  const getBlock = async (block: number) => {
    return new Connection(rpc, { commitment: "confirmed", disableRetryOnRateLimit: true }).getBlock(block, {
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

type SolanaTimestampEvent = {
  blockNumber: number;
  timestamp?: number;
};

export const normalizeSolanaTimestampMs = (timestamp: number): number => {
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    throw new Error(`Invalid Solana timestamp ${timestamp}.`);
  }
  return timestamp < 1_000_000_000_000 ? Math.round(timestamp * 1000) : Math.round(timestamp);
};

export const resolveSolanaEventTimestamps = async (
  events: SolanaTimestampEvent[],
  connection: BlockTimeConnection = getConnection(),
  signal?: AbortSignal,
  concurrency: number = 2
): Promise<Record<number, number>> => {
  const timestamps: Record<number, number> = {};
  const missingSlots = new Set<number>();

  for (const event of events) {
    if (!Number.isSafeInteger(event.blockNumber) || event.blockNumber < 0) {
      throw new Error(`Invalid Solana slot ${event.blockNumber}.`);
    }
    if (event.timestamp !== undefined && Number.isFinite(event.timestamp) && event.timestamp > 0) {
      timestamps[event.blockNumber] = normalizeSolanaTimestampMs(event.timestamp);
    } else {
      missingSlots.add(event.blockNumber);
    }
  }

  const slots = Array.from(missingSlots).filter((slot) => timestamps[slot] === undefined);
  let nextIndex = 0;
  const worker = async () => {
    while (true) {
      throwIfAborted(signal);
      const index = nextIndex++;
      if (index >= slots.length) return;
      const slot = slots[index];
      let lastError: unknown;
      for (let attempt = 0; attempt < 3; attempt++) {
        throwIfAborted(signal);
        try {
          const timestamp = await getEstimatedSolanaSlotTimestamp(slot, connection);
          timestamps[slot] = normalizeSolanaTimestampMs(timestamp);
          lastError = undefined;
          break;
        } catch (error) {
          lastError = error;
          if (attempt < 2) await waitWithSignal(500 * 2 ** attempt, signal);
        }
      }
      if (lastError) {
        throw new Error(`Unable to resolve Solana timestamp for slot ${slot}: ${formatError(lastError)}`);
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(Math.max(1, concurrency), slots.length) }, () => worker()));
  return timestamps;
};
