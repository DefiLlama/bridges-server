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

const createTimeout = (minutes: number) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Operation timed out after ${minutes} minutes`)), minutes * 60 * 1000)
  );

type JobResult = { name: string; status: "ok" | "failed"; durationSec: number; error?: string };
const scheduledJobNames: string[] = [];
const jobResults: JobResult[] = [];

const withTimeout = async (jobName: string, promise: Promise<any>, timeoutMinutes: number) => {
  console.log(`[INFO] Starting job: ${jobName}`);
  const startTime = Date.now();
  try {
    const result = await Promise.race([promise, createTimeout(timeoutMinutes)]);

    const duration = (Date.now() - startTime) / 1000;
    jobResults.push({ name: jobName, status: "ok", durationSec: duration });
    console.log(`[INFO] Job ${jobName} completed successfully in ${duration.toFixed(2)}s`);

    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    jobResults.push({ name: jobName, status: "failed", durationSec: (Date.now() - startTime) / 1000, error: errorMsg });
    console.error(`[ERROR] Job ${jobName} failed: ${errorMsg}`);
  }
};

const printJobSummary = () => {
  const failed = jobResults.filter((r) => r.status === "failed");
  const settled = new Set(jobResults.map((r) => r.name));
  const neverSettled = scheduledJobNames.filter((name) => !settled.has(name));

  console.log("[SUMMARY] Job results:");
  for (const r of jobResults) {
    const line = `  ${r.status === "ok" ? "OK    " : "FAILED"} ${r.name} (${r.durationSec.toFixed(0)}s)${
      r.error ? ` - ${r.error}` : ""
    }`;
    console.log(line);
  }
  for (const name of neverSettled) {
    console.log(`  STUCK  ${name} - still running or never started at shutdown`);
  }
  console.log(
    `[SUMMARY] ${jobResults.length - failed.length}/${scheduledJobNames.length} ok, ${failed.length} failed, ${
      neverSettled.length
    } stuck`
  );
  return failed.length + neverSettled.length;
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
    const failedCount = printJobSummary();
    try {
      await printGetLogsSummary();
      await sql.end();
      await querySql.end();
    } catch (e) {
      console.error("[ERROR] Shutdown cleanup failed:", e);
    }
    process.exit(failedCount > 0 ? 1 : 0);
  }, 1000 * 60 * 54);
};

const runAfterDelay = async (
  jobName: string,
  delayMinutes: number,
  fn: () => Promise<void>,
  timeoutMinutes: number = 5
) => {
  scheduledJobNames.push(jobName);
  setTimeout(async () => {
    try {
      await withTimeout(jobName, fn(), timeoutMinutes);
    } catch (error) {
      jobResults.push({ name: jobName, status: "failed", durationSec: 0, error: String(error) });
      console.error(`[ERROR] Job ${jobName} failed:`, error);
    }
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
    15
  );

  runAfterDelay(
    "aggregateHyperlane",
    0,
    () => runAggregateHistoricalByName(dayjs().subtract(2, "day").unix(), dayjs().unix(), "hyperlane"),
    20
  );

  runAfterDelay("aggregateAll", 0, runAggregateAllAdapters, 15);
  runAfterDelay("aggregateHourly", 5, aggregateHourlyVolume, 15);
  runAfterDelay("aggregateDaily", 5, aggregateDailyVolume, 15);
  runAfterDelay("runAllAdapters", 5, runAllAdapters, 40);
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
