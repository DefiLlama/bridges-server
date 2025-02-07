import Redis from "ioredis";
import hash from "object-hash";

const REDIS_URL = process.env.REDIS_URL;

export const redis = new Redis(REDIS_URL!, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

interface APIEvent {
  pathParameters?: Record<string, any>;
  queryStringParameters?: Record<string, any>;
  body?: any;
}

export const handlerRegistry = new Map<string, Function>();

export const generateApiCacheKey = (event: APIEvent): string => {
  const eventToNormalize = {
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
export const DEFAULT_TTL = 600;

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
  const value = await redis.get(key);
  console.log("Cache HIT", key);
  return value ? JSON.parse(value) : null;
};

export const setCache = async (key: string, value: any, ttl: number = DEFAULT_TTL): Promise<void> => {
  await redis.set(key, JSON.stringify(value), "EX", ttl);
};

export const deleteCache = async (key: string): Promise<void> => {
  await redis.del(key);
};
