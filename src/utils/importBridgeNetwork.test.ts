import assert from "node:assert/strict";
import test from "node:test";
import bridgeNetworks from "../data/bridgeNetworkData";
import { importBridgeNetwork } from "../data/importBridgeNetwork";

test("Relay is linked to its protocol page and resolves through the bridge volume slug", () => {
  const relay = importBridgeNetwork(undefined, undefined, "relay");

  assert.ok(relay);
  assert.equal(relay.id, 95);
  assert.equal(relay.bridgeDbName, "relay");
  assert.equal(relay.defillamaId, "8916");
  assert.equal(importBridgeNetwork("relay"), relay);
  assert.equal(importBridgeNetwork(undefined, 95), relay);
  assert.equal(bridgeNetworks.filter((bridge) => bridge.slug === "relay").length, 1);
});

test("bridge volume slug lookup does not fall back to the adapter name", () => {
  assert.equal(importBridgeNetwork(undefined, undefined, "unknown-bridge"), undefined);
  assert.equal(importBridgeNetwork(undefined, undefined, "Relay"), undefined);
});
