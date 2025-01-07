import { CronJob } from "cron";
import { runAllAdapters } from "./jobs/runAllAdapters";
import { runAggregateAllAdapters } from "./jobs/runAggregateAllAdapter";
import { runAdaptersFromTo } from "./jobs/runAdaptersFromTo";
import { handler as runWormhole } from "../handlers/runWormhole";
import { aggregateHourlyVolume } from "./jobs/aggregateHourlyVolume";
import { aggregateDailyVolume } from "./jobs/aggregateDailyVolume";
import { warmAllCaches } from "./jobs/warmCache";

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

const cron = () => {
  if (process.env.NO_CRON) {
    return;
  }

  new CronJob("15,30,45 * * * *", async () => {
    await withTimeout(runAllAdapters(), 10);
  }).start();

  new CronJob("5 * * * *", async () => {
    await withTimeout(runAggregateAllAdapters(), 20);
  }).start();

  new CronJob("0 * * * *", async () => {
    await withTimeout(runAdaptersFromTo(), 15);
  }).start();

  new CronJob("0 * * * *", async () => {
    await withTimeout(runWormhole(), 30);
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
};

export default cron;
