const DEFAULT_AGGREGATION_LOOKBACK_SECONDS = 36 * 60 * 60;

type BridgeAggregationPipelineOptions = {
  bridgeName: string;
  signal: AbortSignal;
  aggregate: (startTimestamp: number, endTimestamp: number, bridgeName: string, signal: AbortSignal) => Promise<void>;
  getCurrentTimestamp: () => number;
  lookbackSeconds?: number;
};

export const runBridgeAggregationPipeline = async ({
  bridgeName,
  signal,
  aggregate,
  getCurrentTimestamp,
  lookbackSeconds = DEFAULT_AGGREGATION_LOOKBACK_SECONDS,
}: BridgeAggregationPipelineOptions): Promise<void> => {
  const endTimestamp = getCurrentTimestamp();
  await aggregate(endTimestamp - lookbackSeconds, endTimestamp, bridgeName, signal);
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
