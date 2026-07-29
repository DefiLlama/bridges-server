import assert from "node:assert/strict";
import test from "node:test";
import { parseAggregationErrorCleanupArgs } from "./aggregationErrorCleanup";

test("aggregation error cleanup is bounded and dry-run by default", () => {
  assert.deepEqual(parseAggregationErrorCleanupArgs([]), {
    execute: false,
    retentionDays: 7,
    batchSize: 10_000,
    maxBatches: 100,
    pauseMs: 250,
  });
});

test("aggregation error cleanup accepts explicit execution bounds", () => {
  assert.deepEqual(
    parseAggregationErrorCleanupArgs([
      "--execute",
      "--retention-days=30",
      "--batch-size=5000",
      "--max-batches=20",
      "--pause-ms=1000",
    ]),
    {
      execute: true,
      retentionDays: 30,
      batchSize: 5000,
      maxBatches: 20,
      pauseMs: 1000,
    }
  );
});

test("aggregation error cleanup rejects typos and unbounded values", () => {
  assert.throws(() => parseAggregationErrorCleanupArgs(["--excecute"]), /Unknown cleanup option/);
  assert.throws(() => parseAggregationErrorCleanupArgs(["--batch-size=1000000"]), /between 1 and 100000/);
});
