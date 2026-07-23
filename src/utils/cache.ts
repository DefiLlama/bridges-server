import Redis from "ioredis";
import hash from "object-hash";
import { PromisePool } from "@supercharge/promise-pool";

const REDIS_URL = process.env.REDIS_URL;
const REDIS_COMMAND_TIMEOUT_MS = 750;
const REDIS_CONNECT_TIMEOUT_MS = 1000;
const API_CACHE_STALE_TTL_SECONDS = 6 * 60 * 60;
const REDIS_READY_WAIT_MS = REDIS_CONNECT_TIMEOUT_MS + 250;
const ADVANCE_DURABLE_CHECKPOINT_SCRIPT = `
local nextValue = tonumber(ARGV[1])
if not nextValue then
  return redis.error_reply("checkpoint must be numeric")
end

local currentRaw = redis.call("GET", KEYS[1])
if currentRaw then
  local currentValue = tonumber(currentRaw)
  if not currentValue then
    return redis.error_reply("stored checkpoint is not numeric")
  end
  if currentValue >= nextValue then
    redis.call("PERSIST", KEYS[1])
    return currentRaw
  end
end

redis.call("SET", KEYS[1], ARGV[1])
return ARGV[1]
`;

let redis: Redis | undefined;
let lastRedisErrorLogAt = 0;
let suppressedRedisErrors = 0;

const logRedisError = (operation: string, error: unknown) => {
  const now = Date.now();
  suppressedRedisErrors++;
  if (now - lastRedisErrorLogAt < 30_000) return;
  console.error(`[CACHE] Redis ${operation} failed (${suppressedRedisErrors} errors since last log):`, error);
  lastRedisErrorLogAt = now;
  suppressedRedisErrors = 0;
};

if (REDIS_URL) {
  redis = new Redis(REDIS_URL, {
    commandTimeout: REDIS_COMMAND_TIMEOUT_MS,
    connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    autoResendUnfulfilledCommands: false,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
  redis.on("error", (error) => logRedisError("connection", error));
}

const waitForRedisReady = async () => {
  if (!redis || redis.status === "end") return false;
  if (redis.status === "ready") return true;

  return await new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (ready: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      redis?.off("ready", onReady);
      resolve(ready);
    };
    const onReady = () => finish(true);
    const timeout = setTimeout(() => finish(false), REDIS_READY_WAIT_MS);
    timeout.unref?.();
    redis.once("ready", onReady);
    if (redis.status === "ready") finish(true);
  });
};

const requireRedis = async (operation: string): Promise<Redis> => {
  if (!redis) {
    throw new Error(`Redis is required for ${operation}; configure REDIS_URL.`);
  }
  if (!(await waitForRedisReady())) {
    throw new Error(`Redis is unavailable for ${operation}.`);
  }
  return redis;
};

export const parseDurableCheckpoint = (raw: string | null, key: string): number | null => {
  if (raw === null) return null;
  const checkpoint = Number(raw);
  if (!Number.isSafeInteger(checkpoint) || checkpoint < 0) {
    throw new Error(`Redis checkpoint ${key} contains an invalid value: ${raw}`);
  }
  return checkpoint;
};

export const getDurableCheckpoint = async (key: string): Promise<number | null> => {
  const client = await requireRedis(`checkpoint read for ${key}`);
  const raw = await client.get(key);
  return parseDurableCheckpoint(raw, key);
};

export const advanceDurableCheckpoint = async (key: string, checkpoint: number): Promise<number> => {
  if (!Number.isSafeInteger(checkpoint) || checkpoint < 0) {
    throw new Error(`Refusing to store invalid Redis checkpoint ${checkpoint} for ${key}.`);
  }
  const client = await requireRedis(`checkpoint write for ${key}`);
  const stored = await client.eval(ADVANCE_DURABLE_CHECKPOINT_SCRIPT, 1, key, String(checkpoint));
  return parseDurableCheckpoint(String(stored), key)!;
};

interface APIEvent {
  pathParameters?: Record<string, any>;
  queryStringParameters?: Record<string, any>;
  body?: any;
  routePath?: string;
}

export const generateApiCacheKey = (event: APIEvent): string => {
  const eventToNormalize = {
    routePath: event.routePath || "",
    path: event.pathParameters || {},
    query: event.queryStringParameters || {},
    body: event.body || {},
  };

  return hash(eventToNormalize, {
    algorithm: "sha256",
    encoding: "hex",
    unorderedArrays: true,
    unorderedObjects: true,
  }).substring(0, 16);
};

export const DEFAULT_TTL = 60 * 70; // 70 minutes

type ApiCacheMetadata = {
  cacheTTL: number;
  storedAt: number;
};

export type ApiCacheLookup = {
  state: "fresh" | "stale" | "miss";
  value?: any;
  metadata?: ApiCacheMetadata;
};

const staleApiCacheKey = (key: string) => `api-stale:${key}`;
const apiCacheMetadataKey = (key: string) => `api-meta:${key}`;

const isApiCacheMetadata = (value: unknown): value is ApiCacheMetadata => {
  if (!value || Array.isArray(value) || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return Object.keys(record).length === 2 && Number.isFinite(record.cacheTTL) && Number.isFinite(record.storedAt);
};

export const resolveApiCacheLookup = (
  freshRaw: string | null,
  staleRaw: string | null,
  metadataRaw: string | null
): ApiCacheLookup => {
  const parsedMetadata = metadataRaw ? JSON.parse(metadataRaw) : undefined;
  const metadata = isApiCacheMetadata(parsedMetadata) ? parsedMetadata : undefined;

  if (freshRaw) {
    const value = JSON.parse(freshRaw);
    if (!isApiCacheMetadata(value)) return { state: "fresh", value, metadata };
  }

  if (staleRaw) {
    const value = JSON.parse(staleRaw);
    if (!isApiCacheMetadata(value)) return { state: "stale", value, metadata };
  }

  return { state: "miss" };
};

export const getApiCache = async (key: string): Promise<ApiCacheLookup> => {
  if (!redis) return { state: "miss" };
  if (!(await waitForRedisReady())) return { state: "miss" };

  try {
    const [freshRaw, staleRaw, metadataRaw] = await redis.mget(key, staleApiCacheKey(key), apiCacheMetadataKey(key));
    return resolveApiCacheLookup(freshRaw, staleRaw, metadataRaw);
  } catch (error) {
    logRedisError("API cache read", error);
    return { state: "miss" };
  }
};

export const setApiCache = async (key: string, value: any, ttl: number): Promise<void> => {
  if (!redis || !Number.isInteger(ttl) || ttl < 1) return;

  const serialized = JSON.stringify(value);
  const metadata: ApiCacheMetadata = { cacheTTL: ttl, storedAt: Date.now() };
  const staleTTL = ttl + API_CACHE_STALE_TTL_SECONDS;

  try {
    await redis
      .pipeline()
      .set(key, serialized, "EX", ttl)
      .set(staleApiCacheKey(key), serialized, "EX", staleTTL)
      .set(apiCacheMetadataKey(key), JSON.stringify(metadata), "EX", staleTTL)
      .exec();
  } catch (error) {
    logRedisError("API cache write", error);
  }
};

export const checkRedisConnectivity = async (): Promise<{
  status: "OK" | "ERROR" | "DISABLED";
  latencyMs?: number;
}> => {
  if (!redis) return { status: "DISABLED" };
  const start = Date.now();
  if (!(await waitForRedisReady())) return { status: "ERROR" };
  try {
    await redis.ping();
    return { status: "OK", latencyMs: Date.now() - start };
  } catch (error) {
    logRedisError("ping", error);
    return { status: "ERROR" };
  }
};

export const getCacheKey = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(":");

export const getCache = async (key: string): Promise<any> => {
  if (!redis) {
    return null;
  }
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    logRedisError("read", e);
    return null;
  }
};

export const setCache = async (key: string, value: any, ttl: number | null = DEFAULT_TTL): Promise<void> => {
  if (!redis) {
    return;
  }
  try {
    if (ttl === null) {
      await redis.set(key, JSON.stringify(value));
    } else {
      await redis.set(key, JSON.stringify(value), "EX", ttl);
    }
  } catch (e) {
    logRedisError("write", e);
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  if (!redis) {
    return;
  }
  try {
    await redis.del(key);
  } catch (e) {
    logRedisError("delete", e);
  }
};

const GETLOGS_COUNT_TTL = 60 * 60 * 24 * 7;

export const incrementGetLogsCount = async (adapterName: string, chain: string): Promise<void> => {
  if (!redis) return;
  try {
    const today = new Date().toISOString().split("T")[0];
    const key = `getlogs_count:${today}:${adapterName.toLowerCase()}:${chain.toLowerCase()}`;
    await redis.incr(key);
    await redis.expire(key, GETLOGS_COUNT_TTL);
  } catch (e) {}
};

export const getAllGetLogsCounts = async (): Promise<Record<string, number>> => {
  if (!redis) return {};
  try {
    const today = new Date().toISOString().split("T")[0];
    const keys = await redis.keys(`getlogs_count:${today}:*`);
    if (keys.length === 0) return {};

    const counts: Record<string, number> = {};
    const pool = PromisePool.withConcurrency(20);
    await pool.for(keys).process(async (key) => {
      const val = await redis.get(key);
      const parts = key.replace(`getlogs_count:${today}:`, "");
      counts[parts] = parseInt(val || "0", 10);
    });
    return counts;
  } catch (e) {
    console.error("[CACHE] getAllGetLogsCounts error:", e);
    return {};
  }
};

const localDailyRequestCounts = new Map<string, { date: string; count: number }>();

export const claimDailyRequestBudget = async (
  namespace: string,
  limit: number
): Promise<{ allowed: boolean; count: number }> => {
  const today = new Date().toISOString().split("T")[0];
  const safeNamespace = namespace.toLowerCase().replace(/[^a-z0-9_-]+/g, "_");
  if (redis && (await waitForRedisReady())) {
    try {
      const key = `request_budget:${today}:${safeNamespace}`;
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, GETLOGS_COUNT_TTL);
      return { allowed: count <= limit, count };
    } catch (error) {
      logRedisError("request budget", error);
    }
  }

  const current = localDailyRequestCounts.get(safeNamespace);
  const count = current?.date === today ? current.count + 1 : 1;
  localDailyRequestCounts.set(safeNamespace, { date: today, count });
  return { allowed: count <= limit, count };
};
