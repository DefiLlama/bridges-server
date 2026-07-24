import assert from "node:assert/strict";
import test from "node:test";
import { getRelayBootstrapCheckpoint, requireRelayChainId, resolveRelayWindowFromCheckpoint } from "./relayProgress";

const defaults = {
  now: 10_000,
  checkpointOverlapSeconds: 300,
  bootstrapLookbackSeconds: 2_000,
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

test("Relay bootstraps from the configured lookback when the Redis key is missing", () => {
  assert.deepEqual(resolveRelayWindowFromCheckpoint({ ...defaults, checkpoint: null, source: "bootstrap" }), {
    checkpoint: null,
    startTs: 8_000,
    endTs: 10_000,
    source: "bootstrap",
    overlap: 0,
  });
});

test("Relay persists a stable bootstrap low-water mark across failed hourly runs", () => {
  const checkpoint = getRelayBootstrapCheckpoint(defaults.now, defaults.bootstrapLookbackSeconds);
  const firstRun = resolveRelayWindowFromCheckpoint({
    ...defaults,
    checkpoint,
    source: "redis",
  });
  const nextHourlyRun = resolveRelayWindowFromCheckpoint({
    ...defaults,
    now: defaults.now + 3_600,
    checkpoint,
    source: "redis",
  });

  assert.equal(firstRun.startTs, 7_700);
  assert.equal(nextHourlyRun.startTs, firstRun.startTs);
  assert.equal(nextHourlyRun.endTs, defaults.now + 3_600);
});

test("Relay validates bootstrap checkpoint inputs", () => {
  assert.equal(getRelayBootstrapCheckpoint(10_000, 2_000), 8_000);
  assert.throws(() => getRelayBootstrapCheckpoint(0, 2_000), /positive Unix timestamp/);
  assert.throws(() => getRelayBootstrapCheckpoint(10_000, 0), /positive integer/);
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
