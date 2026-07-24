import assert from "node:assert/strict";
import test from "node:test";
import { isRetiredProviderChain, resolveProviderChain } from "./chainResolver";

test("normal adapters resolve EVM aliases without leaking Cosmos zone IDs", () => {
  assert.equal(resolveProviderChain("Kava", "stargate"), "kava");
  assert.equal(resolveProviderChain("Sei", "circle"), "sei");
  assert.equal(resolveProviderChain("World Chain", "layerswap"), "wc");
  assert.equal(resolveProviderChain("PGN (Public Goods Network)", "layerswap"), "pgn");
  assert.equal(resolveProviderChain("Unchain", "butternetwork"), "unichain");
  assert.equal(resolveProviderChain("Defi Oracle Meta", "dbis-gru"), "dfio_meta_main");
});

test("IBC adapters still resolve Cosmos zone IDs", () => {
  assert.equal(resolveProviderChain("Kava", "ibc"), "kava_2222-10");
  assert.equal(resolveProviderChain("Sei", "ibc"), "pacific-1");
});

test("scheduled adapters can distinguish retired chains from transient provider failures", () => {
  assert.equal(isRetiredProviderChain("Polygon zkEVM", "hop"), true);
  assert.equal(isRetiredProviderChain("Corn", "usdt0"), true);
  assert.equal(isRetiredProviderChain("Ethereum", "hop"), false);
});
