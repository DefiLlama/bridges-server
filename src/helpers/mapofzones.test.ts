import assert from "node:assert/strict";
import test from "node:test";
import {
  MAP_OF_ZONES_UNVERIFIED_USD_THRESHOLD,
  MapOfZonesTransferTx,
  normalizeMapOfZonesTransfer,
} from "./mapofzones";

const transfer = (usdValue: unknown): MapOfZonesTransferTx => ({
  destination_address: "destination",
  height: 123,
  source_address: "source",
  timestamp: "2026-08-09 00:33:29",
  tx_hash: "tx-hash",
  tx_type: "Deposit",
  usd_value: usdValue,
  token: { base_denom: "orai", symbol: "ORAI" },
});

test("normalizes trusted MapOfZones USD transfers", () => {
  const event = normalizeMapOfZonesTransfer(transfer("999999.99"));

  assert.ok(event);
  assert.equal(event.amount, "999999.99");
  assert.equal(event.isUSDVolume, true);
  assert.equal(event.isDeposit, true);
  assert.equal(event.from, "destination");
  assert.equal(event.to, "source");
  assert.equal(event.timestamp, Date.parse("2026-08-09T00:33:29Z"));
});

test("drops MapOfZones USD transfers at or above the unverifiable threshold", () => {
  assert.equal(normalizeMapOfZonesTransfer(transfer(MAP_OF_ZONES_UNVERIFIED_USD_THRESHOLD)), null);
  assert.equal(normalizeMapOfZonesTransfer(transfer("127426807.16747026")), null);
});

test("drops invalid and non-positive MapOfZones USD values", () => {
  assert.equal(normalizeMapOfZonesTransfer(transfer(null)), null);
  assert.equal(normalizeMapOfZonesTransfer(transfer("not-a-number")), null);
  assert.equal(normalizeMapOfZonesTransfer(transfer("0")), null);
  assert.equal(normalizeMapOfZonesTransfer(transfer("-1")), null);
});
