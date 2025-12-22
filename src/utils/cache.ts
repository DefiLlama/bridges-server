import Redis from "ioredis";
import hash from "object-hash";

const REDIS_URL = process.env.REDIS_URL;

let redis: Redis;

if (REDIS_URL) {
  redis = new Redis(REDIS_URL, {
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
}

interface APIEvent {
  pathParameters?: Record<string, any>;
  queryStringParameters?: Record<string, any>;
  body?: any;
  routePath?: string;
}

export const handlerRegistry = new Map<string, Function>();

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

export const CACHE_WARM_THRESHOLD = 1000 * 60 * 10;
export const DEFAULT_TTL = 60 * 70; // 70 minutes

export const needsWarming = async (cacheKey: string): Promise<boolean> => {
  const ttl = await redis.ttl(cacheKey);
  if (ttl === -2) return true;
  if (ttl === -1) return false;
  return ttl * 1000 < CACHE_WARM_THRESHOLD;
};

export const warmCache = async (cacheKey: string): Promise<void> => {
  const handler = handlerRegistry.get(cacheKey);
  if (!handler) {
    return;
  }
  try {
    const result = await handler();
    const parsedBody = JSON.parse(result.body);
    await redis.set(cacheKey, JSON.stringify(parsedBody), "EX", DEFAULT_TTL);
  } catch (error) {
    throw error;
  }
};

export const registerCacheHandler = (cacheKey: string, handler: Function) => {
  handlerRegistry.set(cacheKey, handler);
};

export const getCacheKey = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(":");

export const getCache = async (key: string): Promise<any> => {
  if (!redis) {
    return null;
  }
  try {
    const value = await redis.get(key);
    if (value) {
      console.log("Cache HIT", key);
    } else {
      console.log("Cache MISS", key);
    }
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error(`[CACHE] getCache error for ${key}:`, e);
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
    console.error(`[CACHE] setCache error for ${key}:`, e);
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  if (!redis) {
    return;
  }
  try {
    await redis.del(key);
  } catch (e) {
    console.error(`[CACHE] deleteCache error for ${key}:`, e);
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
    for (const key of keys) {
      const val = await redis.get(key);
      const parts = key.replace(`getlogs_count:${today}:`, "");
      counts[parts] = parseInt(val || "0", 10);
    }
    return counts;
  } catch (e) {
    console.error("[CACHE] getAllGetLogsCounts error:", e);
    return {};
  }
};
