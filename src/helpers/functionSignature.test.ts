import assert from "node:assert/strict";
import test from "node:test";
import { matchesFunctionSignature } from "./functionSignature";

const transfer = "0xa9059cbb000000000000000000000000000000000000000000000000000000000000dead";

test("a full four byte selector matches the call it names", () => {
  assert.equal(matchesFunctionSignature(transfer, ["0xa9059cbb"]), true);
});

test("a full four byte selector does not match a different call", () => {
  assert.equal(matchesFunctionSignature(transfer, ["0xa9059cbc"]), false);
  assert.equal(matchesFunctionSignature(transfer, ["0x23b872dd"]), false);
});

test("the three byte prefixes the adapters already carry keep working", () => {
  assert.equal(matchesFunctionSignature(transfer, ["0xa9059c"]), true);
  assert.equal(matchesFunctionSignature(transfer, ["0x1114cd", "0xa9059c"]), true);
  assert.equal(matchesFunctionSignature(transfer, ["0x1114cd"]), false);
});

test("a selector sharing three bytes with the filter is still told apart", () => {
  assert.equal(matchesFunctionSignature("0xa9059cff" + "00".repeat(32), ["0xa9059cbb"]), false);
  assert.equal(matchesFunctionSignature("0xa9059cff" + "00".repeat(32), ["0xa9059c"]), true);
});

test("input data too short to hold a selector matches nothing", () => {
  assert.equal(matchesFunctionSignature("0x", ["0xa9059cbb"]), false);
  assert.equal(matchesFunctionSignature("", ["0xa9059cbb"]), false);
  assert.equal(matchesFunctionSignature(undefined, ["0xa9059cbb"]), false);
  assert.equal(matchesFunctionSignature(null, ["0xa9059cbb"]), false);
});

test("an empty or degenerate filter entry does not match everything", () => {
  assert.equal(matchesFunctionSignature(transfer, [""]), false);
  assert.equal(matchesFunctionSignature(transfer, ["0x"]), false);
  assert.equal(matchesFunctionSignature(transfer, []), false);
});
