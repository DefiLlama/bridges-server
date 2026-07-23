import assert from "node:assert/strict";
import test from "node:test";
import { classifyAdapterFailure, evaluateAdapterQuality, getAdapterQualityLimits } from "./jobs/adapterQuality";

test("adapter quality fails closed when count or ratio exceeds the configured threshold", () => {
  assert.equal(evaluateAdapterQuality(88, 36).exceeded, true);
  assert.equal(evaluateAdapterQuality(88, 10).exceeded, false);
  assert.equal(evaluateAdapterQuality(10, 3, { maxFailedAdapters: 20, maxFailedRatio: 0.25 }).exceeded, true);
});

test("adapter quality limits can be tuned by Jenkins environment", () => {
  assert.deepEqual(getAdapterQualityLimits({ CRON_MAX_FAILED_ADAPTERS: "5", CRON_MAX_FAILED_ADAPTER_RATIO: "0.1" }), {
    maxFailedAdapters: 5,
    maxFailedRatio: 0.1,
  });
});

test("empty Jenkins quality variables keep the safe defaults", () => {
  assert.deepEqual(
    getAdapterQualityLimits({
      CRON_MAX_FAILED_ADAPTERS: "",
      CRON_MAX_FAILED_ADAPTER_RATIO: "   ",
    }),
    {
      maxFailedAdapters: 20,
      maxFailedRatio: 0.25,
    }
  );
});

test("adapter failures are grouped into actionable categories", () => {
  assert.deepEqual(
    classifyAdapterFailure(
      new Error("a: No supported explorer configured; b: HTTP 403 fetching transactions; c: block range unavailable")
    ),
    ["block_range", "explorer_missing", "forbidden"]
  );
});
