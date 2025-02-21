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

const createTimeout = (minutes: number) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Operation timed out after ${minutes} minutes`)), minutes * 60 * 1000)
  );

const withTimeout = async (promise: Promise<any>, timeoutMinutes: number) => {
  try {
    const result = await Promise.race([promise, createTimeout(timeoutMinutes)]);
    return result;
  } catch (error) {
    console.error("Job failed:", error);
  }
};

const exit = () => {
  setTimeout(async () => {
    console.log("Timeout! Shutting down. Bye bye!");
    await sql.end();
    await querySql.end();
    process.exit(0);
  }, 1000 * 60 * 54);
};

const cron = () => {
  if (process.env.NO_CRON) {
    return;
  }

  new CronJob("20,30,45 * * * *", async () => {
    await withTimeout(runAllAdapters(), 10);
  }).start();

  new CronJob("5 * * * *", async () => {
    await withTimeout(runAggregateAllAdapters(), 20);
  }).start();

  new CronJob("0 * * * *", async () => {
    await withTimeout(runAdaptersFromTo(), 15);
  }).start();

  new CronJob("0 * * * *", async () => {
    await withTimeout(runWormhole(), 40);
  }).start();

  new CronJob("0 * * * *", async () => {
    await withTimeout(runLayerZero(), 40);
  }).start();

  new CronJob("20 * * * *", async () => {
    await withTimeout(aggregateHourlyVolume(), 20);
  }).start();

  new CronJob("40 * * * *", async () => {
    await withTimeout(aggregateDailyVolume(), 20);
  }).start();

  new CronJob("*/5 * * * *", async () => {
    await withTimeout(warmAllCaches(), 4);
  }).start();

  exit();
};

export default cron;
