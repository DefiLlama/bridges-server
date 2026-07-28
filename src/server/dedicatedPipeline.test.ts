import assert from "node:assert/strict";
import test from "node:test";
import { publishDedicatedAggregations, runDedicatedIngestionPipeline } from "./dedicatedPipeline";

test("dedicated ingestion is aggregated immediately after a successful handler", async () => {
  const calls: string[] = [];
  const controller = new AbortController();

  const result = await runDedicatedIngestionPipeline({
    bridgeName: "relay",
    signal: controller.signal,
    ingest: async (signal) => {
      assert.equal(signal, controller.signal);
      calls.push("ingest");
      return { degraded: false };
    },
    aggregate: async (startTimestamp, endTimestamp, bridgeName) => {
      calls.push(`aggregate:${bridgeName}:${startTimestamp}-${endTimestamp}`);
    },
    getCurrentTimestamp: () => 200_000,
  });

  assert.deepEqual(result, { degraded: false });
  assert.deepEqual(calls, ["ingest", "aggregate:relay:70400-200000"]);
});

test("dedicated aggregation is not run when ingestion fails", async () => {
  let aggregated = false;

  await assert.rejects(
    runDedicatedIngestionPipeline({
      bridgeName: "relay",
      signal: new AbortController().signal,
      ingest: async () => {
        throw new Error("ingestion failed");
      },
      aggregate: async () => {
        aggregated = true;
      },
      getCurrentTimestamp: () => 200_000,
    }),
    /ingestion failed/
  );

  assert.equal(aggregated, false);
});

test("dedicated publication waits for every ingestion pipeline and then rolls hourly before daily", async () => {
  const calls: string[] = [];
  let completeFirstRun: () => void = () => {};
  let completeSecondRun: () => void = () => {};
  const firstRun = new Promise<void>((resolve) => {
    completeFirstRun = resolve;
  });
  const secondRun = new Promise<void>((resolve) => {
    completeSecondRun = resolve;
  });

  const publication = publishDedicatedAggregations(
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
