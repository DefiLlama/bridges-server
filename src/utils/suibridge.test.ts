import assert from "node:assert/strict";
import test from "node:test";
import { BigNumber } from "ethers";
import { getTokenAddressFromTokenID } from "../adapters/suibridge";

test("Suibridge maps BigNumber token IDs without leaking undefined tokens", () => {
  assert.equal(getTokenAddressFromTokenID(BigNumber.from(2)), "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
  assert.throws(() => getTokenAddressFromTokenID(BigNumber.from(99)), /Unsupported Sui bridge token ID/);
});
