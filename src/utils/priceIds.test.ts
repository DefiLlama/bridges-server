import assert from "node:assert/strict";
import test from "node:test";
import { isValidPriceId } from "./priceIds";

test("accepts normal price ids and rejects malformed database values", () => {
  assert.equal(isValidPriceId("ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"), true);
  assert.equal(isValidPriceId("ethereum:null"), false);
  assert.equal(isValidPriceId("ethereum:\\N"), false);
  assert.equal(isValidPriceId("ethereum:bad/value"), false);
  assert.equal(isValidPriceId("missing-chain-separator"), false);
});
