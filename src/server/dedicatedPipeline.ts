const DEFAULT_AGGREGATION_LOOKBACK_SECONDS = 36 * 60 * 60;

type DedicatedIngestionPipelineOptions<T> = {
  bridgeName: string;
  signal: AbortSignal;
  ingest: (signal: AbortSignal) => Promise<T>;
  aggregate: (startTimestamp: number, endTimestamp: number, bridgeName: string) => Promise<void>;
  getCurrentTimestamp: () => number;
  lookbackSeconds?: number;
};

export const runDedicatedIngestionPipeline = async <T>({
  bridgeName,
  signal,
  ingest,
  aggregate,
  getCurrentTimestamp,
  lookbackSeconds = DEFAULT_AGGREGATION_LOOKBACK_SECONDS,
}: DedicatedIngestionPipelineOptions<T>): Promise<T> => {
  const result = await ingest(signal);
  const endTimestamp = getCurrentTimestamp();
  await aggregate(endTimestamp - lookbackSeconds, endTimestamp, bridgeName);
  return result;
};

export const publishDedicatedAggregations = async (
  dedicatedRuns: Promise<unknown>[],
  aggregateHourly: () => Promise<void>,
  aggregateDaily: () => Promise<void>
) => {
  await Promise.all(dedicatedRuns);
  await aggregateHourly();
  await aggregateDaily();
};
