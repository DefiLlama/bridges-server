export type JobCriticality = "critical" | "recoverable";
export type JobStatus = "ok" | "degraded" | "failed" | "timed_out";

export type ScheduledJob = {
  name: string;
  criticality: JobCriticality;
  diagnostics?: () => string;
};

export type JobResult = ScheduledJob & {
  status: JobStatus;
  durationSec: number;
  error?: string;
};

export type CronSummary = {
  ok: number;
  recoverableFailures: number;
  criticalFailures: number;
  neverSettled: ScheduledJob[];
  exitCode: 0 | 1;
};

export const summarizeCronJobs = (scheduledJobs: ScheduledJob[], jobResults: JobResult[]): CronSummary => {
  const settled = new Set(jobResults.map((result) => result.name));
  const neverSettled = scheduledJobs.filter((job) => !settled.has(job.name));
  const hardFailures = jobResults.filter((result) => result.status === "failed" || result.status === "timed_out");
  const recoverableFailures =
    jobResults.filter((result) => result.status === "degraded").length +
    hardFailures.filter((result) => result.criticality === "recoverable").length +
    neverSettled.filter((job) => job.criticality === "recoverable").length;
  const criticalFailures =
    hardFailures.filter((result) => result.criticality === "critical").length +
    neverSettled.filter((job) => job.criticality === "critical").length;

  return {
    ok: jobResults.filter((result) => result.status === "ok").length,
    recoverableFailures,
    criticalFailures,
    neverSettled,
    exitCode: criticalFailures > 0 ? 1 : 0,
  };
};
