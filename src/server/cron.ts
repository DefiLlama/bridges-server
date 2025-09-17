import { CronJob } from "cron";
import { runAllAdapters } from "./jobs/runAllAdapters";
import { runAggregateAllAdapters } from "./jobs/runAggregateAllAdapter";
import { runAdaptersFromTo } from "./jobs/runAdaptersFromTo";
import { handler as runWormhole } from "../handlers/runWormhole";
import { aggregateHourlyVolume } from "./jobs/aggregateHourlyVolume";
import { aggregateDailyVolume } from "./jobs/aggregateDailyVolume";
import { warmAllCaches } from "./jobs/warmCache";
import runLayerZero from "../handlers/runLayerZero";
import { querySql, sql } from "../utils/db";
import { runAggregateHistoricalByName } from "../utils/aggregate";
import { handler as runInterSoon } from "../handlers/runInterSoon";
import dayjs from "dayjs";
import runHyperlane from "../handlers/runHyperlane";
import runTeleswap from "../handlers/runTeleswap";
import { handler as runRelay } from "../handlers/runRelay";

const createTimeout = (minutes: number) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Operation timed out after ${minutes} minutes`)), minutes * 60 * 1000)
  );

const withTimeout = async (jobName: string, promise: Promise<any>, timeoutMinutes: number) => {
  try {
    console.log(`[INFO] Starting job: ${jobName}`);

    const startTime = Date.now();
    const result = await Promise.race([promise, createTimeout(timeoutMinutes)]);

    const duration = (Date.now() - startTime) / 1000;
    console.log(`[INFO] Job ${jobName} completed successfully in ${duration.toFixed(2)}s`);

    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[ERROR] Job ${jobName} failed: ${errorMsg}`);
  }
};

const exit = () => {
  setTimeout(async () => {
    console.log("[INFO] Timeout! Shutting down. Bye bye!");
    await sql.end();
    await querySql.end();
    process.exit(0);
  }, 1000 * 60 * 54);
};

const runAfterDelay = async (jobName: string, delayMinutes: number, fn: () => Promise<void>) => {
  setTimeout(async () => {
    try {
      await withTimeout(jobName, fn(), delayMinutes);
    } catch (error) {
      console.error(`[ERROR] Job ${jobName} failed:`, error);
    }
  }, delayMinutes * 60 * 1000);
};

const runEvery = (jobName: string, minutes: number, fn: () => Promise<void>) => {
  setInterval(async () => {
    try {
      await withTimeout(jobName, fn(), minutes);
    } catch (error) {
      console.error(`[ERROR] Job ${jobName} failed:`, error);
    }
  }, minutes * 60 * 1000);
};

const cron = () => {
  if (process.env.NO_CRON) {
    return;
  }

  console.log(`[INFO] Starting cron service at ${new Date().toISOString()}`);

  withTimeout("warmCache", warmAllCaches(), 5);

  runAfterDelay("aggregateLayerZero", 5, () =>
    runAggregateHistoricalByName(dayjs().subtract(2, "day").unix(), dayjs().unix(), "layerzero")
  );

  runAfterDelay("aggregateAll", 5, runAggregateAllAdapters);
  runAfterDelay("aggregateHourly", 5, aggregateHourlyVolume);
  runAfterDelay("aggregateDaily", 5, aggregateDailyVolume);
  runAfterDelay("runAllAdapters", 10, runAllAdapters);
  runAfterDelay("runAdaptersFromTo", 50, runAdaptersFromTo);
  runEvery("runWormhole", 30, runWormhole);
  runEvery("runLayerZero", 30, runLayerZero);
  runEvery("runHyperlane", 30, runHyperlane);
  runEvery("runInterSoon", 30, runInterSoon);
  runEvery("runRelay", 30, runRelay);
  runEvery("runTeleswap", 30, runTeleswap);

  exit();
};

export default cron;
