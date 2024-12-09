import { LRUCache } from "lru-cache";
import hash from "object-hash";

export const cache = new LRUCache({
  max: 1000,
  ttl: 1000 * 60 * 60,
});

interface APIEvent {
  pathParameters?: Record<string, any>;
  queryStringParameters?: Record<string, any>;
  body?: any;
}

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

export const getCacheKey = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(":");

export const DEFAULT_TTL = 600;
