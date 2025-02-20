import { CronJob } from "cron";
import { runAllAdapters } from "./jobs/runAllAdapters";
import { runAggregateAllAdapters } from "./jobs/runAggregateAllAdapter";
import { runAdaptersFromTo } from "./jobs/runAdaptersFromTo";
import { handler as runWormhole } from "../handlers/runWormhole";
import { aggregateHourlyVolume } from "./jobs/aggregateHourlyVolume";
import { aggregateDailyVolume } from "./jobs/aggregateDailyVolume";
import { warmAllCaches } from "./jobs/warmCache";
import runLayerZero from "../handlers/runLayerZero";
import { getCache, setCache } from "../utils/cache";
import dayjs from "dayjs";
import { sql } from "../utils/db";

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

const cron = async () => {
  if (process.env.NO_CRON) {
    return;
  }

  const cronRuns = await getCache("cronRuns");
  const currentRunTs = dayjs().unix();
  await setCache("cronRuns", JSON.stringify([...cronRuns, { ts: currentRunTs }]), null);

  setTimeout(async () => {
    console.log("Forcing process exit after 55 minutes");
    await sql.end();
    process.exit(0);
  }, 55 * 60 * 1000);

  const jobs = [
    { schedule: "20,30,45 * * * *", handler: () => withTimeout(runAllAdapters(), 10) },
    { schedule: "5 * * * *", handler: () => withTimeout(runAggregateAllAdapters(), 20) },
    { schedule: "0 * * * *", handler: () => withTimeout(runAdaptersFromTo(), 15) },
    { schedule: "0 * * * *", handler: () => withTimeout(runWormhole(), 40) },
    { schedule: "0 * * * *", handler: () => withTimeout(runLayerZero(), 40) },
    { schedule: "20 * * * *", handler: () => withTimeout(aggregateHourlyVolume(), 20) },
    { schedule: "40 * * * *", handler: () => withTimeout(aggregateDailyVolume(), 20) },
    { schedule: "*/5 * * * *", handler: () => withTimeout(warmAllCaches(), 4) },
  ];

  jobs.forEach(({ schedule, handler }) => {
    new CronJob(schedule, handler).start();
  });

  process.on("SIGTERM", async () => {
    console.log("Received SIGTERM, cleaning up...");
    await sql.end();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("Received SIGINT, cleaning up...");
    await sql.end();
    process.exit(0);
  });
};

cron().catch(console.error);
