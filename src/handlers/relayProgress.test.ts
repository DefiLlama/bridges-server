import assert from "node:assert/strict";
import test from "node:test";
import { requireRelayChainId } from "./relayProgress";
import { resolveIngestStart, splitIngestWindows } from "./runRelay";

test("Relay re-scans the lookback tail behind the checkpoint and starts from the initial lookback without one", () => {
  assert.equal(resolveIngestStart(9_000, 10_000), 9_000 - 2 * 3_600);
  assert.equal(resolveIngestStart(10_500, 10_000), 10_000 - 2 * 3_600);
  assert.equal(resolveIngestStart(null, 10_000), 10_000 - 48 * 3_600);
});

test("Relay splits the range into aligned 10-minute windows", () => {
  assert.deepEqual(splitIngestWindows(1_250, 1_900), [
    [1_250, 1_800],
    [1_800, 1_900],
  ]);
});

test("Relay event legs require a positive integer chain ID", () => {
  assert.equal(requireRelayChainId("deposit", 1), 1);
  assert.throws(() => requireRelayChainId("deposit", undefined), /valid chain ID/);
  assert.throws(() => requireRelayChainId("withdrawal", 0), /valid chain ID/);
});
