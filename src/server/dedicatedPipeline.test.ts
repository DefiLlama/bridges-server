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

test("CCIP recomputes all ten completed UTC days even when the job finishes mid-day", async () => {
  const now = Date.parse("2026-09-05T13:45:00Z") / 1000;
  const calls: number[][] = [];
  await runBridgeAggregationPipeline({
    bridgeName: "ccip",
    signal: new AbortController().signal,
    getCurrentTimestamp: () => now,
    aggregate: async (start, end) => {
      calls.push([start, end]);
    },
  });
  assert.deepEqual(calls, [[Date.parse("2026-08-26T00:00:00Z") / 1000, Date.parse("2026-09-05T00:00:00Z") / 1000]]);
});

test("CCIP aggregation includes the old date of a timestamp correction outside its default window", async () => {
  const calls: number[][] = [];
  const oldDay = Date.parse("2026-08-20T00:00:00Z") / 1000;
  const end = Date.parse("2026-09-05T00:00:00Z") / 1000;
  await runBridgeAggregationPipeline({
    bridgeName: "ccip",
    signal: new AbortController().signal,
    getCurrentTimestamp: () => end,
    startTimestamp: oldDay,
    aggregate: async (start, finish) => {
      calls.push([start, finish]);
    },
  });
  assert.deepEqual(calls, [[oldDay, end]]);
});
