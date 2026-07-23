import assert from "node:assert/strict";
import test from "node:test";
import { shouldSkipBridge, shouldSkipScheduledBridge } from "./bridgePolicy";

test("1sec is skipped only by the hourly scheduler when no allowlisted endpoint is configured", () => {
  assert.equal(shouldSkipBridge("1sec"), false);
  assert.equal(shouldSkipScheduledBridge("1sec", {}), true);
  assert.equal(shouldSkipScheduledBridge("1sec", { ONESEC_API_BASE_URL: "https://origin.example/api" }), false);
});

test("specialized handlers remain excluded from generic adapter execution", () => {
  assert.equal(shouldSkipBridge("relay"), true);
  assert.equal(shouldSkipScheduledBridge("relay", {}), true);
});
