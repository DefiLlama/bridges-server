import assert from "node:assert/strict";
import test from "node:test";
import { toUnixSeconds } from "./largeTransactions.shared";

test("normalizes database and serialized transaction timestamps", () => {
  assert.equal(toUnixSeconds(1784516338), 1784516338);
  assert.equal(toUnixSeconds(1784516338000), 1784516338);
  assert.equal(toUnixSeconds(new Date("2026-07-20T02:58:58.000Z")), 1784516338);
  assert.equal(toUnixSeconds("2026-07-20T02:58:58.000Z"), 1784516338);
});

test("rejects invalid transaction timestamps", () => {
  assert.throws(() => toUnixSeconds("not-a-date"), /Invalid transaction timestamp/);
});
