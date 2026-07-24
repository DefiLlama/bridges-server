import { NonRetryableError } from "../utils/errors";

export type RelayCheckpointSource = "redis" | "bootstrap";
export const RELAY_CHECKPOINT_MAX_FUTURE_SKEW_SECONDS = 60;

export const getRelayBootstrapCheckpoint = (now: number, bootstrapLookbackSeconds: number): number => {
  if (!Number.isSafeInteger(now) || now <= 0) {
    throw new NonRetryableError(`Relay bootstrap time must be a positive Unix timestamp; received ${now}.`);
  }
  if (!Number.isSafeInteger(bootstrapLookbackSeconds) || bootstrapLookbackSeconds <= 0) {
    throw new NonRetryableError(
      `Relay bootstrap lookback must be a positive integer; received ${bootstrapLookbackSeconds}.`
    );
  }
  return Math.max(1, now - bootstrapLookbackSeconds);
};

export const requireRelayChainId = (leg: "deposit" | "withdrawal", chainId?: number): number => {
  if (!Number.isInteger(chainId) || Number(chainId) <= 0) {
    throw new NonRetryableError(`Relay ${leg} is missing a valid chain ID`);
  }
  return chainId!;
};

export const validateRelayCheckpoint = (
  checkpoint: number,
  now: number,
  maxFutureSkewSeconds: number = RELAY_CHECKPOINT_MAX_FUTURE_SKEW_SECONDS
): number => {
  if (!Number.isSafeInteger(checkpoint) || checkpoint <= 0) {
    throw new NonRetryableError(`Relay checkpoint must be a positive Unix timestamp; received ${checkpoint}.`);
  }
  if (checkpoint > now + maxFutureSkewSeconds) {
    throw new NonRetryableError(
      `Relay checkpoint ${checkpoint} is more than ${maxFutureSkewSeconds}s ahead of current time ${now}.`
    );
  }
  return Math.min(checkpoint, now);
};

export const resolveRelayWindowFromCheckpoint = ({
  now,
  checkpoint,
  source,
  checkpointOverlapSeconds,
  bootstrapLookbackSeconds,
  maxCatchupSeconds,
  maxFutureSkewSeconds = RELAY_CHECKPOINT_MAX_FUTURE_SKEW_SECONDS,
}: {
  now: number;
  checkpoint: number | null;
  source: RelayCheckpointSource;
  checkpointOverlapSeconds: number;
  bootstrapLookbackSeconds: number;
  maxCatchupSeconds: number;
  maxFutureSkewSeconds?: number;
}) => {
  const safeCheckpoint = checkpoint === null ? null : validateRelayCheckpoint(checkpoint, now, maxFutureSkewSeconds);
  const overlap = source === "redis" ? checkpointOverlapSeconds : 0;
  const startTs = Math.max(0, safeCheckpoint === null ? now - bootstrapLookbackSeconds : safeCheckpoint - overlap);
  const endTs = Math.min(now, startTs + maxCatchupSeconds);
  return { checkpoint: safeCheckpoint, startTs, endTs, source, overlap };
};
