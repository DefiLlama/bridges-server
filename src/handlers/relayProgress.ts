import { formatError, NonRetryableError } from "../utils/errors";
import { convertRequestToEvent, RelayChainCatalog } from "../adapters/relay";

export type RelayBridgeIds = Record<string, string | undefined>;

export type RelayCheckpointSource = "redis" | "lookback";
export const RELAY_CHECKPOINT_MAX_FUTURE_SKEW_SECONDS = 60;

export const createCompletionPrefix = (total: number) => {
  const completed = new Array<boolean>(total).fill(false);
  let prefix = 0;
  return {
    complete(index: number) {
      completed[index] = true;
      while (prefix < total && completed[prefix]) prefix += 1;
      return prefix;
    },
    get length() {
      return prefix;
    },
  };
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
  initialLookbackSeconds,
  maxCatchupSeconds,
  maxFutureSkewSeconds = RELAY_CHECKPOINT_MAX_FUTURE_SKEW_SECONDS,
}: {
  now: number;
  checkpoint: number | null;
  source: RelayCheckpointSource;
  checkpointOverlapSeconds: number;
  initialLookbackSeconds: number;
  maxCatchupSeconds: number;
  maxFutureSkewSeconds?: number;
}) => {
  const safeCheckpoint = checkpoint === null ? null : validateRelayCheckpoint(checkpoint, now, maxFutureSkewSeconds);
  const overlap = source === "redis" ? checkpointOverlapSeconds : 0;
  const startTs = Math.max(0, safeCheckpoint === null ? now - initialLookbackSeconds : safeCheckpoint - overlap);
  const endTs = Math.min(now, startTs + maxCatchupSeconds);
  return { checkpoint: safeCheckpoint, startTs, endTs, source, overlap };
};

const warnedUnknownChains = new Set<string>();

// A single request on a chain Relay no longer lists in /chains must not fail the whole run:
// before this, one such request kept the checkpoint stuck for weeks. Skip the leg and count it.
const resolveRelayLeg = (
  leg: "deposit" | "withdrawal",
  chainId: number | undefined,
  bridgeIds: RelayBridgeIds,
  chainCatalog: RelayChainCatalog,
  label: string
): { slug: string; bridgeId: string } | null => {
  let reason: string;
  try {
    const slug = chainCatalog[requireRelayChainId(leg, chainId)];
    if (slug) {
      const bridgeId = bridgeIds[slug.toLowerCase()];
      if (bridgeId) return { slug: slug.toLowerCase(), bridgeId };
      reason = `bridge config is missing ${leg} chain ${slug}`;
    } else {
      reason = `unknown ${leg} chain ID ${chainId}`;
    }
  } catch (e) {
    reason = formatError(e);
  }
  const warnKey = `${leg}:${chainId}`;
  if (!warnedUnknownChains.has(warnKey)) {
    warnedUnknownChains.add(warnKey);
    console.warn(`${label} skipping ${leg} legs: ${reason}`);
  }
  return null;
};

export const convertSliceToRows = (
  slice: any[],
  bridgeIds: RelayBridgeIds,
  chainCatalog: RelayChainCatalog,
  label: string
) => {
  const sourceTransactions: any[] = [];
  const destinationTransactions: any[] = [];
  let depositUsd = 0;
  let skippedLegs = 0;

  for (const req of slice) {
    try {
      const event = convertRequestToEvent(req);
      const depositLeg = event.deposit
        ? resolveRelayLeg("deposit", event.depositChainId, bridgeIds, chainCatalog, label)
        : null;
      if (event.deposit && !depositLeg) skippedLegs += 1;
      if (event.deposit && depositLeg) {
        const { slug: depositSlug, bridgeId: bId } = depositLeg;
        depositUsd += parseFloat(event.deposit.amount?.toString?.() || "0");
        sourceTransactions.push({
          bridge_id: bId,
          chain: depositSlug,
          tx_hash: event.deposit.txHash,
          ts: event.deposit.timestamp!,
          tx_block: null,
          tx_from: event.deposit.from ?? "0x",
          tx_to: event.deposit.to ?? "0x",
          token: event.deposit.token ?? "0x0000000000000000000000000000000000000000",
          amount: event.deposit.amount?.toString?.() || "0",
          is_deposit: true,
          is_usd_volume: true,
          txs_counted_as: 1,
          origin_chain: null,
        });
      }

      const withdrawLeg = event.withdraw
        ? resolveRelayLeg("withdrawal", event.withdrawChainId, bridgeIds, chainCatalog, label)
        : null;
      if (event.withdraw && !withdrawLeg) skippedLegs += 1;
      if (event.withdraw && withdrawLeg) {
        const { slug: withdrawSlug, bridgeId: bId } = withdrawLeg;
        destinationTransactions.push({
          bridge_id: bId,
          chain: withdrawSlug,
          tx_hash: event.withdraw.txHash,
          ts: event.withdraw.timestamp!,
          tx_block: null,
          tx_from: event.withdraw.from ?? "0x",
          tx_to: event.withdraw.to ?? "0x",
          token: event.withdraw.token ?? "0x0000000000000000000000000000000000000000",
          amount: event.withdraw.amount?.toString?.() || "0",
          is_deposit: false,
          is_usd_volume: true,
          txs_counted_as: 1,
          origin_chain: null,
        });
      }
    } catch (e) {
      throw new NonRetryableError(`${label} failed to convert request ${req?.id ?? "unknown"}: ${formatError(e)}`);
    }
  }

  return { sourceTransactions, destinationTransactions, depositUsd, skippedLegs };
};
