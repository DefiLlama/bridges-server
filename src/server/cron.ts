import { runAllAdapters } from "./jobs/runAllAdapters";
import { runAggregateAllAdapters } from "./jobs/runAggregateAllAdapter";
import { handler as runWormhole } from "../handlers/runWormhole";
import { handler as runMayan } from "../handlers/runMayan";
import { aggregateHourlyVolume } from "./jobs/aggregateHourlyVolume";
import { aggregateDailyVolume } from "./jobs/aggregateDailyVolume";
import runLayerZero from "../handlers/runLayerZero";
import { querySql, sql } from "../utils/db";
import { runAggregateHistoricalByName } from "../utils/aggregate";
import { handler as runInterSoon } from "../handlers/runInterSoon";
import { runCCIPDefaultMode as runCCIP } from "../handlers/runCCIP";
import dayjs from "dayjs";
import runHyperlane from "../handlers/runHyperlane";
import runTeleswap from "../handlers/runTeleswap";
import { handler as runRelay } from "../handlers/runRelay";
import { handler as runCashmere } from "../handlers/runCashmere";
import { getAllGetLogsCounts } from "../utils/cache";
import { handler as runSnowbridge } from "../handlers/runSnowbridge";
import { handler as runAcross } from "../handlers/runAcross";
import { createAbortError } from "../utils/errors";
import { JobCriticality, JobResult, ScheduledJob, summarizeCronJobs } from "./cronState";

const scheduledJobs: ScheduledJob[] = [];
const jobResults: JobResult[] = [];
const activeJobs = new Map<string, AbortController>();

const withTimeout = async (job: ScheduledJob, fn: (signal: AbortSignal) => Promise<any>, timeoutMinutes: number) => {
  console.log(`[INFO] Starting ${job.criticality} job: ${job.name}`);
  const startTime = Date.now();
  const controller = new AbortController();
  activeJobs.set(job.name, controller);
  let timedOut = false;
  let timeout: NodeJS.Timeout | undefined;
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        timedOut = true;
        controller.abort();
        reject(createAbortError(`Operation timed out after ${timeoutMinutes} minutes`));
      }, timeoutMinutes * 60 * 1000);
    });
    const result = await Promise.race([fn(controller.signal), timeoutPromise]);

    const duration = (Date.now() - startTime) / 1000;
    const degraded = Boolean(result && typeof result === "object" && result.degraded === true);
    const detail = degraded && typeof result.error === "string" ? result.error : undefined;
    jobResults.push({ ...job, status: degraded ? "degraded" : "ok", durationSec: duration, error: detail });
    console.log(
      `[${degraded ? "WARN" : "INFO"}] Job ${job.name} completed ${degraded ? "in degraded mode" : "successfully"} in ${duration.toFixed(2)}s`
    );

    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    jobResults.push({
      ...job,
      status: timedOut ? "timed_out" : "failed",
      durationSec: (Date.now() - startTime) / 1000,
      error: errorMsg,
    });
    console.error(`[ERROR] ${job.criticality} job ${job.name} ${timedOut ? "timed out" : "failed"}: ${errorMsg}`);
  } finally {
    if (timeout) clearTimeout(timeout);
    activeJobs.delete(job.name);
  }
};

const printJobSummary = () => {
  const summary = summarizeCronJobs(scheduledJobs, jobResults);

  console.log("[SUMMARY] Job results:");
  for (const r of jobResults) {
    const line = `  ${r.status.toUpperCase().padEnd(9)} ${r.criticality.padEnd(11)} ${r.name} (${r.durationSec.toFixed(
      0
    )}s)${r.error ? ` - ${r.error}` : ""}`;
    console.log(line);
  }
  for (const job of summary.neverSettled) {
    console.log(`  STUCK     ${job.criticality.padEnd(11)} ${job.name} - still running or never started at shutdown`);
  }
  console.log(
    `[SUMMARY] ${summary.ok}/${scheduledJobs.length} ok, ${summary.recoverableFailures} recoverable failures, ` +
      `${summary.criticalFailures} critical failures, ${summary.neverSettled.length} unsettled; ` +
      `result=${summary.exitCode === 0 ? (summary.recoverableFailures > 0 ? "DEGRADED" : "OK") : "FAILED"}`
  );
  return summary.exitCode;
};

const printGetLogsSummary = async () => {
  const counts = await getAllGetLogsCounts();
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  console.log("[GETLOGS SUMMARY] Top callers today:");
  for (const [key, count] of sorted.slice(0, 30)) {
    console.log(`  ${key}: ${count} calls`);
  }
  console.log(`[GETLOGS SUMMARY] Total unique adapter:chain combinations: ${sorted.length}`);
};

const exit = () => {
  setTimeout(async () => {
    console.log("[INFO] Timeout! Shutting down. Bye bye!");
    for (const [name, controller] of activeJobs) {
      console.warn(`[WARN] Aborting active job during shutdown: ${name}`);
      controller.abort();
    }
    const exitCode = printJobSummary();
    try {
      await printGetLogsSummary();
      await sql.end();
      await querySql.end();
    } catch (e) {
      console.error("[ERROR] Shutdown cleanup failed:", e);
    }
    process.exit(exitCode);
  }, 1000 * 60 * 54);
};

const runAfterDelay = async (
  jobName: string,
  delayMinutes: number,
  fn: (signal: AbortSignal) => Promise<any>,
  timeoutMinutes: number = 5,
  criticality: JobCriticality = "recoverable"
) => {
  const job = { name: jobName, criticality };
  scheduledJobs.push(job);
  setTimeout(async () => {
    await withTimeout(job, fn, timeoutMinutes);
  }, delayMinutes * 60 * 1000);
};

const cron = () => {
  if (process.env.NO_CRON) {
    return;
  }

  console.log(`[INFO] Starting cron service at ${new Date().toISOString()}`);

  runAfterDelay(
    "aggregateLayerZero",
    0,
    () => runAggregateHistoricalByName(dayjs().subtract(2, "day").unix(), dayjs().unix(), "layerzero"),
    15,
    "critical"
  );

  runAfterDelay(
    "aggregateHyperlane",
    0,
    () => runAggregateHistoricalByName(dayjs().subtract(2, "day").unix(), dayjs().unix(), "hyperlane"),
    20,
    "critical"
  );

  runAfterDelay("aggregateAll", 0, runAggregateAllAdapters, 15, "critical");
  runAfterDelay("aggregateHourly", 5, aggregateHourlyVolume, 15, "critical");
  runAfterDelay("aggregateDaily", 5, aggregateDailyVolume, 15, "critical");
  runAfterDelay("runAllAdapters", 5, runAllAdapters, 40, "critical");
  runAfterDelay("runWormhole", 25, runWormhole, 25);
  runAfterDelay("runMayan", 25, runMayan, 25);
  runAfterDelay("runLayerZero", 25, runLayerZero, 25);
  runAfterDelay("runHyperlane", 25, runHyperlane, 25);
  runAfterDelay("runInterSoon", 25, runInterSoon, 25);
  runAfterDelay("runRelay", 25, runRelay, 25);
  runAfterDelay("runAcross", 25, runAcross, 25);
  runAfterDelay("runCashmere", 25, runCashmere, 25);
  runAfterDelay("runTeleswap", 25, runTeleswap, 25);
  runAfterDelay("runCCIP", 25, runCCIP, 25);
  runAfterDelay("runSnowbridge", 25, runSnowbridge, 25);

  exit();
};

export default cron;
