import { NonRetryableError } from "../utils/errors";

export class ConsecutiveFailureCircuitBreaker {
  private failures = 0;
  private openUntil = 0;

  constructor(
    private readonly label: string,
    private readonly failureThreshold: number,
    private readonly cooldownMs: number,
    private readonly now: () => number = Date.now
  ) {
    if (!Number.isInteger(failureThreshold) || failureThreshold <= 0) {
      throw new Error("Circuit breaker failure threshold must be a positive integer.");
    }
    if (!Number.isFinite(cooldownMs) || cooldownMs <= 0) {
      throw new Error("Circuit breaker cooldown must be positive.");
    }
  }

  assertAvailable() {
    const currentTime = this.now();
    if (this.openUntil > currentTime) {
      throw new NonRetryableError(
        `${this.label} circuit is open for another ${Math.ceil((this.openUntil - currentTime) / 1000)}s.`
      );
    }
    if (this.openUntil > 0) {
      this.failures = 0;
      this.openUntil = 0;
    }
  }

  recordSuccess() {
    this.failures = 0;
    this.openUntil = 0;
  }

  recordFailure(): boolean {
    this.failures++;
    if (this.failures < this.failureThreshold) return false;
    this.openUntil = this.now() + this.cooldownMs;
    return true;
  }
}
