import assert from "node:assert/strict";
import test from "node:test";
import { resolveProviderChain } from "./chainResolver";

test("normal adapters resolve EVM aliases without leaking Cosmos zone IDs", () => {
  assert.equal(resolveProviderChain("Kava", "stargate"), "kava");
  assert.equal(resolveProviderChain("Sei", "circle"), "sei");
  assert.equal(resolveProviderChain("World Chain", "layerswap"), "wc");
  assert.equal(resolveProviderChain("PGN (Public Goods Network)", "layerswap"), "pgn");
});

test("IBC adapters still resolve Cosmos zone IDs", () => {
  assert.equal(resolveProviderChain("Kava", "ibc"), "kava_2222-10");
  assert.equal(resolveProviderChain("Sei", "ibc"), "pacific-1");
});
