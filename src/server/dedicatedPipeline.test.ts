import assert from "node:assert/strict";
import test from "node:test";
import { publishAggregations, runBridgeAggregationPipeline } from "./dedicatedPipeline";

test("bridge aggregation gets an independent window and abort signal", async () => {
  const calls: string[] = [];
  const controller = new AbortController();

  await runBridgeAggregationPipeline({
    bridgeName: "relay",
    signal: controller.signal,
    aggregate: async (startTimestamp, endTimestamp, bridgeName, signal) => {
      assert.equal(signal, controller.signal);
      calls.push(`aggregate:${bridgeName}:${startTimestamp}-${endTimestamp}`);
    },
    getCurrentTimestamp: () => 200_000,
  });

  assert.deepEqual(calls, ["aggregate:relay:70400-200000"]);
});

test("publication waits for every aggregation and then rolls hourly before daily", async () => {
  const calls: string[] = [];
  let completeFirstRun: () => void = () => {};
  let completeSecondRun: () => void = () => {};
  const firstRun = new Promise<void>((resolve) => {
    completeFirstRun = resolve;
  });
  const secondRun = new Promise<void>((resolve) => {
    completeSecondRun = resolve;
  });

  const publication = publishAggregations(
    [firstRun, secondRun],
    async () => {
      calls.push("hourly");
    },
    async () => {
      calls.push("daily");
    }
  );

  await Promise.resolve();
  assert.deepEqual(calls, []);
  completeFirstRun();
  await Promise.resolve();
  assert.deepEqual(calls, []);
  completeSecondRun();
  await publication;
  assert.deepEqual(calls, ["hourly", "daily"]);
});
