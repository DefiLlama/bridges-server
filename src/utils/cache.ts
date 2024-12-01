import NodeCache from "node-cache";
import hash from "object-hash";

const MAX_KEYS = 10000;
const CLEANUP_THRESHOLD = 0.9;

export const cache = new NodeCache({
  stdTTL: 600,
  checkperiod: 120,
  maxKeys: Number.MAX_SAFE_INTEGER,
  useClones: false,
  deleteOnExpire: true,
});

cache.on("set", () => {
  const keys = cache.keys();
  if (keys.length > MAX_KEYS * CLEANUP_THRESHOLD) {
    const keysToRemove = keys.slice(0, Math.floor(MAX_KEYS * 0.2));
    keysToRemove.forEach((key) => cache.del(key));
  }
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
