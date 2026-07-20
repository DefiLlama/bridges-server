import { querySql as sql } from "../utils/db";
import { checkRedisConnectivity } from "../utils/cache";

const DEPENDENCY_CHECK_INTERVAL_MS = 5 * 60 * 1000;
const DB_CHECK_TIMEOUT_MS = 1500;

type DependencyResult = {
  status: "OK" | "ERROR" | "DISABLED" | "UNKNOWN";
  latencyMs?: number;
  checkedAt: string;
};

export type DependencyHealth = {
  db: DependencyResult;
  redis: DependencyResult;
  checkedAt: string;
};

const neverChecked = new Date(0).toISOString();
let dependencyHealth: DependencyHealth = {
  db: { status: "UNKNOWN", checkedAt: neverChecked },
  redis: { status: process.env.REDIS_URL ? "UNKNOWN" : "DISABLED", checkedAt: neverChecked },
  checkedAt: neverChecked,
};
let dependencyCheck: Promise<void> | undefined;
let monitoringStarted = false;

const checkDependencies = () => {
  if (dependencyCheck) return dependencyCheck;

  dependencyCheck = (async () => {
    const startedAt = Date.now();
    const dbCheck = Promise.race([
      Promise.resolve(sql`SELECT 1`).then(() => ({ status: "OK" as const, latencyMs: Date.now() - startedAt })),
      new Promise<{ status: "ERROR"; latencyMs: number }>((resolve) =>
        setTimeout(() => resolve({ status: "ERROR", latencyMs: Date.now() - startedAt }), DB_CHECK_TIMEOUT_MS)
      ),
    ]).catch(() => ({ status: "ERROR" as const, latencyMs: Date.now() - startedAt }));

    const [db, redis] = await Promise.all([dbCheck, checkRedisConnectivity()]);
    const checkedAt = new Date().toISOString();
    dependencyHealth = {
      db: { ...db, checkedAt },
      redis: { ...redis, checkedAt },
      checkedAt,
    };
  })().finally(() => {
    dependencyCheck = undefined;
  });

  return dependencyCheck;
};

export function startHealthMonitoring() {
  if (monitoringStarted) return;
  monitoringStarted = true;
  void checkDependencies();
  const interval = setInterval(() => void checkDependencies(), DEPENDENCY_CHECK_INTERVAL_MS);
  interval.unref?.();
}

export function getDependencyHealth() {
  return dependencyHealth;
}

export function getHealthStatus() {
  return {
    status: "OK",
    timestamp: new Date().toISOString(),
  };
}
