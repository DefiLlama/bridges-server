import Redis from "ioredis";
import hash from "object-hash";
import { PromisePool } from "@supercharge/promise-pool";

const REDIS_URL = process.env.REDIS_URL;
const REDIS_COMMAND_TIMEOUT_MS = 750;
const REDIS_CONNECT_TIMEOUT_MS = 1000;
const API_CACHE_STALE_TTL_SECONDS = 6 * 60 * 60;

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

const parsePipelineValue = (entry: [Error | null, unknown] | null | undefined) => {
  if (!entry || entry[0]) {
    if (entry?.[0]) throw entry[0];
    return null;
  }
  return typeof entry[1] === "string" ? entry[1] : null;
};

export const getApiCache = async (key: string): Promise<ApiCacheLookup> => {
  if (!redis) return { state: "miss" };

  try {
    const result = await redis.pipeline().get(key).get(staleApiCacheKey(key)).get(apiCacheMetadataKey(key)).exec();
    const freshRaw = parsePipelineValue(result?.[0]);
    const staleRaw = parsePipelineValue(result?.[1]);
    const metadataRaw = parsePipelineValue(result?.[2]);
    const metadata = metadataRaw ? (JSON.parse(metadataRaw) as ApiCacheMetadata) : undefined;

    if (freshRaw) return { state: "fresh", value: JSON.parse(freshRaw), metadata };
    if (staleRaw) return { state: "stale", value: JSON.parse(staleRaw), metadata };
    return { state: "miss" };
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
