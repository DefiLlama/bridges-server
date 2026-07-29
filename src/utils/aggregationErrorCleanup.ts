export type AggregationErrorCleanupConfig = {
  execute: boolean;
  retentionDays: number;
  batchSize: number;
  maxBatches: number;
  pauseMs: number;
};

const readPositiveInteger = (args: string[], name: string, fallback: number, max: number) => {
  const prefix = `--${name}=`;
  const raw = args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > max) {
    throw new Error(`--${name} must be an integer between 1 and ${max}.`);
  }
  return value;
};

export const parseAggregationErrorCleanupArgs = (args: string[]): AggregationErrorCleanupConfig => {
  const knownFlags = ["--execute", "--retention-days=", "--batch-size=", "--max-batches=", "--pause-ms="];
  const unknown = args.find(
    (arg) => !knownFlags.some((flag) => (flag.endsWith("=") ? arg.startsWith(flag) : arg === flag))
  );
  if (unknown) throw new Error(`Unknown cleanup option: ${unknown}`);

  return {
    execute: args.includes("--execute"),
    retentionDays: readPositiveInteger(args, "retention-days", 7, 3650),
    batchSize: readPositiveInteger(args, "batch-size", 10_000, 100_000),
    maxBatches: readPositiveInteger(args, "max-batches", 100, 10_000),
    pauseMs: readPositiveInteger(args, "pause-ms", 250, 60_000),
  };
};
