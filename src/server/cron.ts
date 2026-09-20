import {
  AdapterQualityGateError,
  getRunAllAdaptersDiagnostics,
  RunAllAdaptersResult,
  runAllAdapters,
} from "./jobs/runAllAdapters";
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
import { handler as runLayerswap } from "../handlers/runLayerswap";
import { handler as runCashmere } from "../handlers/runCashmere";
import { getAllGetLogsCounts } from "../utils/cache";
import { getExplorerRequestStats } from "../helpers/etherscan";
import { handler as runSnowbridge } from "../handlers/runSnowbridge";
import { handler as runAcross } from "../handlers/runAcross";
import { createAbortError, throwIfAborted } from "../utils/errors";
import {
  JobCriticality,
  JobExecution,
  JobResult,
  ScheduledJob,
  jobCompletedSuccessfully,
  summarizeCronJobs,
} from "./cronState";
import { publishAggregations, runBridgeAggregationPipeline } from "./dedicatedPipeline";
import { PromisePool } from "@supercharge/promise-pool";

const scheduledJobs: ScheduledJob[] = [];
const jobResults: JobResult[] = [];
const activeJobs = new Map<string, AbortController>();
type TimeoutSettleMode = "wait" | "detach";

const withTimeout = async <T>(
  job: ScheduledJob,
  fn: (signal: AbortSignal) => Promise<T>,
  timeoutMinutes: number,
  timeoutSettleMode: TimeoutSettleMode = "wait"
): Promise<JobExecution<T>> => {
  console.log(`[INFO] Starting ${job.criticality} job: ${job.name}`);
  const startTime = Date.now();
  const controller = new AbortController();
  activeJobs.set(job.name, controller);
  let timedOut = false;
  let timeout: NodeJS.Timeout | undefined;
  let jobPromise: Promise<T> | undefined;
  let cleanupWhenSettled = false;
  const clearActiveJob = () => {
    if (activeJobs.get(job.name) === controller) activeJobs.delete(job.name);
  };
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        timedOut = true;
        controller.abort();
        reject(createAbortError(`Operation timed out after ${timeoutMinutes} minutes`));
      }, timeoutMinutes * 60 * 1000);
    });
    jobPromise = fn(controller.signal);
    const result = await Promise.race([jobPromise, timeoutPromise]);

    const duration = (Date.now() - startTime) / 1000;
    const resultMetadata =
      result && typeof result === "object" ? (result as { degraded?: unknown; error?: unknown }) : undefined;
    const degraded = resultMetadata?.degraded === true;
    const detail = degraded && typeof resultMetadata.error === "string" ? resultMetadata.error : undefined;
    jobResults.push({ ...job, status: degraded ? "degraded" : "ok", durationSec: duration, error: detail });
    console.log(
      `[${degraded ? "WARN" : "INFO"}] Job ${job.name} completed ${
        degraded ? "in degraded mode" : "successfully"
      } in ${duration.toFixed(2)}s`
    );

    return { status: degraded ? "degraded" : "ok", result };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const status = timedOut ? "timed_out" : "failed";
    jobResults.push({
      ...job,
      status,
      durationSec: (Date.now() - startTime) / 1000,
      error: errorMsg,
    });
    console.error(`[ERROR] ${job.criticality} job ${job.name} ${timedOut ? "timed out" : "failed"}: ${errorMsg}`);
    if (job.diagnostics) {
      console.error(`[DIAGNOSTICS] ${job.name}: ${job.diagnostics()}`);
    }
    const result = error instanceof AdapterQualityGateError ? (error.result as T) : undefined;
    return { status, result, error };
  } finally {
    if (timeout) clearTimeout(timeout);
    if (timedOut && jobPromise) {
      if (timeoutSettleMode === "wait") {
        try {
          await jobPromise;
        } catch {
          // The timeout has already been recorded. Wait for aggregation writes to settle
          // so dependent publication cannot race them.
        }
      } else {
        // Adapter implementations are third-party code and do not all honor AbortSignal.
        // Let dependencies observe the timeout immediately instead of blocking the whole
        // cron cycle, while still tracking the adapter until its background work settles.
        cleanupWhenSettled = true;
        void jobPromise.then(clearActiveJob, clearActiveJob);
      }
    }
    if (!cleanupWhenSettled) clearActiveJob();
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

const printExplorerSummary = () => {
  const stats = getExplorerRequestStats();
  console.log("[EXPLORER SUMMARY] Requests by chain:");
  for (const [chain, values] of Object.entries(stats)) {
    console.log(
      `  ${chain}: ${values.requests} requests, ${values.successes} ok, ${values.failures} failed, ${values.cacheHits} cache hits`
    );
  }
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
      printExplorerSummary();
      await sql.end();
      await querySql.end();
    } catch (e) {
      console.error("[ERROR] Shutdown cleanup failed:", e);
    }
    process.exit(exitCode);
  }, 1000 * 60 * 54);
};

const runAfterDelay = <T>(
  jobName: string,
  delayMinutes: number,
  fn: (signal: AbortSignal) => Promise<T>,
  timeoutMinutes: number = 5,
  criticality: JobCriticality = "recoverable",
  diagnostics?: () => string,
  timeoutSettleMode: TimeoutSettleMode = "wait"
): Promise<JobExecution<T>> => {
  const job = { name: jobName, criticality, diagnostics };
  scheduledJobs.push(job);
  return new Promise<JobExecution<T>>((resolve, reject) => {
    setTimeout(() => {
      withTimeout(job, fn, timeoutMinutes, timeoutSettleMode).then(resolve, reject);
    }, delayMinutes * 60 * 1000);
  });
};

const runDependentJob = async <TDependency, TResult>(
  dependency: Promise<JobExecution<TDependency>>,
  jobName: string,
  shouldRun: (execution: JobExecution<TDependency>) => boolean,
  fn: (execution: JobExecution<TDependency>, signal: AbortSignal) => Promise<TResult>,
  timeoutMinutes: number,
  criticality: JobCriticality = "recoverable"
): Promise<JobExecution<TResult> | undefined> => {
  const execution = await dependency;
  if (!shouldRun(execution)) {
    console.warn(`[WARN] Skipping ${jobName}: its ingestion dependency ended with status ${execution.status}.`);
    return;
  }
  return runAfterDelay(jobName, 0, (signal) => fn(execution, signal), timeoutMinutes, criticality);
};

type DedicatedJob = {
  jobName: string;
  bridgeName: string;
  handler: (signal: AbortSignal) => Promise<any>;
};

const dedicatedJobs: DedicatedJob[] = [
  { jobName: "runWormhole", bridgeName: "wormhole", handler: runWormhole },
  { jobName: "runMayan", bridgeName: "mayan", handler: runMayan },
  { jobName: "runLayerZero", bridgeName: "layerzero", handler: runLayerZero },
  { jobName: "runHyperlane", bridgeName: "hyperlane", handler: runHyperlane },
  { jobName: "runInterSoon", bridgeName: "intersoon", handler: runInterSoon },
  { jobName: "runRelay", bridgeName: "relay", handler: runRelay },
  { jobName: "runLayerswap", bridgeName: "layerswap", handler: runLayerswap },
  { jobName: "runAcross", bridgeName: "across", handler: runAcross },
  { jobName: "runCashmere", bridgeName: "cashmere", handler: runCashmere },
  { jobName: "runTeleswap", bridgeName: "teleswap", handler: runTeleswap },
  { jobName: "runCCIP", bridgeName: "ccip", handler: runCCIP },
  { jobName: "runSnowbridge", bridgeName: "snowbridge", handler: runSnowbridge },
];

const cron = () => {
  if (process.env.NO_CRON) {
    return;
  }

  console.log(`[INFO] Starting cron service at ${new Date().toISOString()}`);

  // Adapter ingestion and adapter-scoped aggregation are best-effort: upstream/provider
  // failures must be visible in the summary without turning the hourly Jenkins job red.
  // The database publication jobs below remain critical and still fail Jenkins.
  const initialAggregationRuns = [
    runAfterDelay(
      "aggregateLayerZero",
      0,
      () => runAggregateHistoricalByName(dayjs().subtract(2, "day").unix(), dayjs().unix(), "layerzero"),
      15,
      "recoverable"
    ),
    runAfterDelay(
      "aggregateHyperlane",
      0,
      () => runAggregateHistoricalByName(dayjs().subtract(2, "day").unix(), dayjs().unix(), "hyperlane"),
      20,
      "recoverable"
    ),
  ];

  const aggregateAllJob = runAfterDelay("aggregateAll", 0, runAggregateAllAdapters, 15, "recoverable");
  const initialPublicationRuns = [
    runAfterDelay("aggregateHourly", 5, aggregateHourlyVolume, 15, "critical"),
    runAfterDelay("aggregateDaily", 5, aggregateDailyVolume, 15, "critical"),
  ];

  const runAllAdaptersJob = runAfterDelay<RunAllAdaptersResult>(
    "runAllAdapters",
    5,
    runAllAdapters,
    40,
    "recoverable",
    getRunAllAdaptersDiagnostics,
    "detach"
  );
  const runAllAdaptersAfterPriorAggregation = Promise.all([runAllAdaptersJob, aggregateAllJob]).then(
    ([execution]) => execution
  );
  const aggregateSuccessfulGenericAdapters = runDependentJob(
    runAllAdaptersAfterPriorAggregation,
    "aggregateSuccessfulGenericAdapters",
    (execution) => Boolean(execution.result?.succeededAdapters.length),
    async (execution, signal) => {
      const bridgeNames = execution.result!.succeededAdapters;
      const endTimestamp = dayjs().unix();
      const startTimestamp = endTimestamp - 36 * 60 * 60;
      console.log(`[AGGREGATE] Recomputing ${bridgeNames.length} successful generic adapters before publication.`);
      const { errors } = await PromisePool.withConcurrency(5)
        .for(bridgeNames)
        .process(async (bridgeName) => {
          throwIfAborted(signal);
          await runAggregateHistoricalByName(startTimestamp, endTimestamp, bridgeName, signal);
        });
      throwIfAborted(signal);
      if (errors.length > 0) throw errors[0].raw;
    },
    15,
    "recoverable"
  );

  const dedicatedIngestionRuns = dedicatedJobs.map((job) => ({
    ...job,
    execution: runAfterDelay(job.jobName, 25, job.handler, 25, "recoverable", undefined, "detach"),
  }));
  const dedicatedAggregationRuns = dedicatedIngestionRuns.map(({ jobName, bridgeName, execution }) =>
    runDependentJob(
      execution,
      `aggregateAfter${jobName[0].toUpperCase()}${jobName.slice(1)}`,
      jobCompletedSuccessfully,
      (ingestion, signal) =>
        runBridgeAggregationPipeline({
          bridgeName,
          signal,
          aggregate: runAggregateHistoricalByName,
          aggregationDates: bridgeName === "ccip"
            ? (ingestion.result as Awaited<ReturnType<typeof runCCIP>>).aggregationDates
            : undefined,
          startTimestamp: bridgeName === "ccip"
            ? (ingestion.result as Awaited<ReturnType<typeof runCCIP>>).startTimestamp
            : undefined,
          getCurrentTimestamp: () =>
            bridgeName === "ccip"
              ? (ingestion.result as Awaited<ReturnType<typeof runCCIP>>).endTimestamp
              : dayjs().unix(),
        }),
      8
    )
  );

  runAfterDelay(
    "publishPostIngestionAggregations",
    0,
    (signal) =>
      publishAggregations(
        [
          ...initialAggregationRuns,
          aggregateAllJob,
          ...initialPublicationRuns,
          aggregateSuccessfulGenericAdapters,
          ...dedicatedAggregationRuns,
        ],
        async () => {
          throwIfAborted(signal);
          await aggregateHourlyVolume();
        },
        async () => {
          throwIfAborted(signal);
          await aggregateDailyVolume();
        }
      ),
    53,
    "recoverable"
  );

  exit();
};

export default cron;
