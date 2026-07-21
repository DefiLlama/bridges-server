import assert from "node:assert/strict";
import test from "node:test";
import { assertCompleteLlamaPriceFetch, buildLlamaPriceBatches } from "./prices";

test("buildLlamaPriceBatches keeps price request URLs bounded", () => {
  const tokens = Array.from({ length: 100 }, (_, index) => `ethereum:0x${index.toString(16).padStart(40, "0")}`);
  const batches = buildLlamaPriceBatches(tokens);

  assert.deepEqual(batches.flat(), tokens);
  assert.ok(batches.length > 1);
  assert.ok(batches.every((batch) => batch.length <= 150));
  assert.ok(batches.every((batch) => `https://coins.llama.fi/prices/current/${batch.join(",")}`.length <= 3500));
});

test("buildLlamaPriceBatches does not drop a single unusually long token", () => {
  const token = `ethereum:${"x".repeat(4000)}`;

  assert.deepEqual(buildLlamaPriceBatches([token]), [[token]]);
});

test("partial price responses are rejected before aggregates are persisted", () => {
  assert.throws(
    () => assertCompleteLlamaPriceFetch({ prices: {}, failedBatches: 1, totalBatches: 3 }, "hourly aggregate"),
    /Refusing to persist hourly aggregate/
  );
  assert.doesNotThrow(() =>
    assertCompleteLlamaPriceFetch({ prices: {}, failedBatches: 0, totalBatches: 3 }, "hourly aggregate")
  );
});
