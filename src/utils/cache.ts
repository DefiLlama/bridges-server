import { LRUCache } from "lru-cache";
import hash from "object-hash";

interface APIEvent {
  pathParameters?: Record<string, any>;
  queryStringParameters?: Record<string, any>;
  body?: any;
}

export const handlerRegistry = new Map<string, Function>();

export const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 1000 * 60 * 60,
  updateAgeOnGet: false,
});

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

export const needsWarming = (cacheKey: string): boolean => {
  if (!cache.has(cacheKey)) return true;

  const ttlRemaining = cache.getRemainingTTL(cacheKey);
  return ttlRemaining !== undefined && ttlRemaining < CACHE_WARM_THRESHOLD;
};

export const warmCache = async (cacheKey: string): Promise<void> => {
  const handler = handlerRegistry.get(cacheKey);
  if (!handler) {
    return;
  }
  try {
    const result = await handler();
    const parsedBody = JSON.parse(result.body);
    cache.set(cacheKey, parsedBody);
  } catch (error) {
    throw error;
  }
};

export const registerCacheHandler = (cacheKey: string, handler: Function) => {
  handlerRegistry.set(cacheKey, handler);
};

export const getCacheKey = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(":");

export const DEFAULT_TTL = 600;
