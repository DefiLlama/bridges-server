import assert from "node:assert/strict";
import test from "node:test";
import { JobResult, ScheduledJob, summarizeCronJobs } from "./cronState";

test("recoverable failures leave the cron exit code successful", () => {
  const scheduled: ScheduledJob[] = [
    { name: "critical", criticality: "critical" },
    { name: "optional", criticality: "recoverable" },
  ];
  const results: JobResult[] = [
    { ...scheduled[0], status: "ok", durationSec: 1 },
    { ...scheduled[1], status: "failed", durationSec: 1, error: "upstream unavailable" },
  ];

  assert.deepEqual(summarizeCronJobs(scheduled, results), {
    ok: 1,
    recoverableFailures: 1,
    criticalFailures: 0,
    neverSettled: [],
    exitCode: 0,
  });
});

test("failed or unsettled critical jobs fail the cron", () => {
  const scheduled: ScheduledJob[] = [
    { name: "failed", criticality: "critical" },
    { name: "stuck", criticality: "critical" },
  ];
  const results: JobResult[] = [{ ...scheduled[0], status: "timed_out", durationSec: 10, error: "timeout" }];
  const summary = summarizeCronJobs(scheduled, results);

  assert.equal(summary.criticalFailures, 2);
  assert.equal(summary.exitCode, 1);
  assert.deepEqual(summary.neverSettled, [scheduled[1]]);
});

test("a degraded critical job is reported without failing the cron", () => {
  const scheduled: ScheduledJob[] = [{ name: "adapters", criticality: "critical" }];
  const results: JobResult[] = [{ ...scheduled[0], status: "degraded", durationSec: 10 }];
  const summary = summarizeCronJobs(scheduled, results);

  assert.equal(summary.recoverableFailures, 1);
  assert.equal(summary.criticalFailures, 0);
  assert.equal(summary.exitCode, 0);
});
