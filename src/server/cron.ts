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
import dayjs from "dayjs";

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

const runAfterDelay = async (delayMinutes: number, fn: () => Promise<void>) => {
  setTimeout(async () => {
    try {
      await withTimeout(fn(), delayMinutes);
    } catch (error) {
      console.error("Job failed:", error);
    }
  }, delayMinutes * 60 * 1000);
};

const runEvery = (minutes: number, fn: () => Promise<void>) => {
  setInterval(async () => {
    try {
      await fn();
    } catch (error) {
      console.error("Job failed:", error);
    }
  }, minutes * 60 * 1000);
};

const cron = () => {
  if (process.env.NO_CRON) {
    return;
  }
  warmAllCaches();

  runAfterDelay(10, () => runAggregateHistoricalByName(dayjs().subtract(2, "day").unix(), dayjs().unix(), "layerzero"));
  runAfterDelay(5, runAggregateAllAdapters);
  runAfterDelay(10, aggregateHourlyVolume);
  runAfterDelay(10, aggregateDailyVolume);

  const run = async () => {
    runEvery(10, runAllAdapters);
    runEvery(15, runAdaptersFromTo);
    runEvery(40, runWormhole);
    runEvery(40, runLayerZero);
  };

  runAfterDelay(15, run);

  exit();
};

export default cron;
