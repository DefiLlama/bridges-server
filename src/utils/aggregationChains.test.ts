import assert from "node:assert/strict";
import test from "node:test";
import { mergeRelayAggregationChains } from "./aggregationChains";

test("Relay aggregation includes configured dynamic chains and static fallbacks", () => {
  assert.deepEqual(
    mergeRelayAggregationChains(["ethereum", "abstract"], ["ethereum", "base"]),
    ["ethereum", "abstract", "base"]
  );
});

test("Relay aggregation preserves distinct config keys that only differ by case", () => {
  assert.deepEqual(mergeRelayAggregationChains(["B3", "b3"], ["B3"]), ["B3", "b3"]);
});
