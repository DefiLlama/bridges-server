import assert from "node:assert/strict";
import test from "node:test";
import { buildStaleBridgeActivity } from "./staleBridgeActivity";

test("keeps the stale result for active, inactive and destination bridge chains", () => {
  const currentDate = new Date("2026-10-13T12:00:00Z");
  const result = buildStaleBridgeActivity(
    [
      {
        bridgeDbName: "alpha",
        chains: ["Ethereum", "Arbitrum"],
        destinationChain: "Arbitrum",
      },
      {
        bridgeDbName: "beta",
        chains: ["Base", "Optimism"],
      },
    ],
    [
      { bridgeName: "alpha", chain: "ethereum", lastActiveDay: new Date("2026-10-11T00:00:00Z") },
      { bridgeName: "beta", chain: "base", lastActiveDay: null },
    ],
    currentDate
  );

  assert.deepEqual(result, [
    { bridge: "alpha", chain: "Ethereum", staleDays: 2 },
    { bridge: "beta", chain: "Base", staleDays: 7 },
    { bridge: "beta", chain: "Optimism", staleDays: 7 },
  ]);
});
