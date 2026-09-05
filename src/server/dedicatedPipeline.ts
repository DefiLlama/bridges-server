import { CCIP_LOOKBACK_DAYS } from "../adapters/ccip";

const DEFAULT_AGGREGATION_LOOKBACK_SECONDS = 36 * 60 * 60;

type BridgeAggregationPipelineOptions = {
  bridgeName: string;
  signal: AbortSignal;
  aggregate: (startTimestamp: number, endTimestamp: number, bridgeName: string, signal: AbortSignal) => Promise<void>;
  getCurrentTimestamp: () => number;
  lookbackSeconds?: number;
  startTimestamp?: number;
};

export const runBridgeAggregationPipeline = async ({
  bridgeName,
  signal,
  aggregate,
  getCurrentTimestamp,
  lookbackSeconds = DEFAULT_AGGREGATION_LOOKBACK_SECONDS,
  startTimestamp,
}: BridgeAggregationPipelineOptions): Promise<void> => {
  const now = getCurrentTimestamp();
  const endTimestamp = bridgeName === "ccip" ? Math.floor(now / 86400) * 86400 : now;
  const window = bridgeName === "ccip" ? CCIP_LOOKBACK_DAYS * 86400 : lookbackSeconds;
  await aggregate(startTimestamp ?? endTimestamp - window, endTimestamp, bridgeName, signal);
};

export const publishAggregations = async (
  aggregationRuns: Promise<unknown>[],
  aggregateHourly: () => Promise<void>,
  aggregateDaily: () => Promise<void>
) => {
  await Promise.all(aggregationRuns);
  await aggregateHourly();
  await aggregateDaily();
};
