import assert from "node:assert/strict";
import test from "node:test";
import { getMerlinRetryAfterMs, MERLIN_REQUEST_INTERVAL_MS, toMerlinExhaustedError } from "./merlin";
import { isNonRetryableError, NonRetryableError } from "../utils/errors";

test("Merlin limiter stays within the observed one-request-per-second limit", () => {
  assert.ok(MERLIN_REQUEST_INTERVAL_MS >= 1_000);
});

test("Merlin retry delay honors provider headers", () => {
  assert.equal(
    getMerlinRetryAfterMs({ response: { headers: { "retry-after": "2", "x-ratelimit-reset": "1000" } } }, 1),
    2_000
  );
  assert.equal(getMerlinRetryAfterMs({ response: { headers: { "x-ratelimit-reset": "1000" } } }, 1), 1_000);
});

test("Merlin marks exhausted local retries as non-retryable for the outer block-range runner", () => {
  const exhausted = toMerlinExhaustedError({ response: { status: 429 } });
  assert.equal(isNonRetryableError(exhausted), true);
  assert.match(exhausted.message, /retries exhausted/);

  const existing = new NonRetryableError("already final");
  assert.equal(toMerlinExhaustedError(existing), existing);
});
