import assert from "node:assert/strict";
import test from "node:test";
import { ConsecutiveFailureCircuitBreaker } from "./circuitBreaker";
import { isNonRetryableError } from "../utils/errors";

test("circuit breaker opens after repeated global failures and recovers after cooldown", () => {
  let now = 1_000;
  const breaker = new ConsecutiveFailureCircuitBreaker("upstream", 3, 10_000, () => now);

  assert.equal(breaker.recordFailure(), false);
  assert.equal(breaker.recordFailure(), false);
  assert.equal(breaker.recordFailure(), true);
  assert.throws(
    () => breaker.assertAvailable(),
    (error: unknown) => isNonRetryableError(error) && /circuit is open/.test((error as Error).message)
  );

  now += 10_001;
  assert.doesNotThrow(() => breaker.assertAvailable());
  breaker.recordSuccess();
  assert.equal(breaker.recordFailure(), false);
});
