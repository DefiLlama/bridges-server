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
  assert.equal(resolveProviderChain("Ape", "stargate"), "apechain");
  assert.equal(resolveProviderChain("Bera", "stargate"), "berachain");
  assert.equal(resolveProviderChain("Iota", "stargate"), "iotaevm");
  assert.equal(resolveProviderChain("Kaia", "stargate"), "klaytn");
  assert.equal(resolveProviderChain("Lightlink", "stargate"), "lightlink_phoenix");
  assert.equal(resolveProviderChain("Plume", "stargate"), "plume_mainnet");
});

test("B2 adapter and internal names use the SDK bsquared provider", () => {
  assert.equal(resolveProviderChain("bsquared", "minibridge"), "bsquared");
  assert.equal(resolveProviderChain("b2-mainnet", "oooo"), "bsquared");
  assert.equal(resolveProviderChain("B2 Mainnet", "bunnyfi"), "bsquared");
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
