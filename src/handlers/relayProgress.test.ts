import assert from "node:assert/strict";
import test from "node:test";
import { createCompletionPrefix, requireRelayChainId, resolveRelayWindowFromCheckpoint } from "./relayProgress";

test("Relay checkpoint only advances across a contiguous run of completed windows", () => {
  const prefix = createCompletionPrefix(4);
  assert.equal(prefix.length, 0);

  assert.equal(prefix.complete(1), 0);
  assert.equal(prefix.complete(3), 0);
  assert.equal(prefix.complete(0), 2);
  assert.equal(prefix.complete(2), 4);
  assert.equal(prefix.length, 4);
});

test("Relay checkpoint stays put while the earliest window is unfinished", () => {
  const prefix = createCompletionPrefix(3);
  prefix.complete(2);
  prefix.complete(1);
  assert.equal(prefix.length, 0);
});

const defaults = {
  now: 10_000,
  checkpointOverlapSeconds: 300,
  initialLookbackSeconds: 2_000,
  maxCatchupSeconds: 4 * 3_600,
};

test("Relay uses the small overlap for an explicit progress checkpoint", () => {
  assert.deepEqual(resolveRelayWindowFromCheckpoint({ ...defaults, checkpoint: 9_000, source: "redis" }), {
    checkpoint: 9_000,
    startTs: 8_700,
    endTs: 10_000,
    source: "redis",
    overlap: 300,
  });
});

test("Relay uses the initial lookback without creating a checkpoint when the Redis key is missing", () => {
  assert.deepEqual(resolveRelayWindowFromCheckpoint({ ...defaults, checkpoint: null, source: "lookback" }), {
    checkpoint: null,
    startTs: 8_000,
    endTs: 10_000,
    source: "lookback",
    overlap: 0,
  });
});

test("Relay fails closed with a far-future checkpoint", () => {
  assert.throws(
    () => resolveRelayWindowFromCheckpoint({ ...defaults, checkpoint: 10_061, source: "redis" }),
    /ahead of current time/
  );
});

test("Relay tolerates small clock skew without preserving a future checkpoint", () => {
  assert.deepEqual(resolveRelayWindowFromCheckpoint({ ...defaults, checkpoint: 10_030, source: "redis" }), {
    checkpoint: 10_000,
    startTs: 9_700,
    endTs: 10_000,
    source: "redis",
    overlap: 300,
  });
});

test("Relay event legs require a positive integer chain ID", () => {
  assert.equal(requireRelayChainId("deposit", 1), 1);
  assert.throws(() => requireRelayChainId("deposit", undefined), /valid chain ID/);
  assert.throws(() => requireRelayChainId("withdrawal", 0), /valid chain ID/);
});
