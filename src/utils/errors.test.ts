import assert from "node:assert/strict";
import test from "node:test";
import { formatError, waitWithSignal } from "./errors";

test("waitWithSignal rejects immediately for an already aborted signal", async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(() => waitWithSignal(10_000, controller.signal), { name: "AbortError" });
});

test("formatError preserves nested causes and structured non-Error values", () => {
  const error = new Error("outer") as Error & { cause?: unknown };
  error.cause = new Error("inner");
  assert.equal(formatError(error), "outer; cause=inner");
  assert.equal(formatError({ code: 429 }), '{"code":429}');
});
