import assert from "node:assert/strict";
import test from "node:test";
import { parseBridgeId } from "./bridgeId";

test("accepts positive digit-only bridge ids", () => {
  assert.equal(parseBridgeId("1"), 1);
  assert.equal(parseBridgeId("01"), 1);
  assert.equal(parseBridgeId("123"), 123);
});

test("rejects malformed bridge ids instead of partially parsing them", () => {
  for (const value of [undefined, "", "0", "1junk", "1.5", "-1", " 1", "1 ", "99999999999999999999"]) {
    assert.equal(parseBridgeId(value), undefined);
  }
});
