import fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import getBridgeVolume from "../handlers/getBridgeVolume";
import getBridgeVolumeBySlug from "../handlers/getBridgeVolumeBySlug";
import getBridges from "../handlers/getBridges";
import getBridge from "../handlers/getBridge";
import getBridgeChains from "../handlers/getBridgeChains";
import getBridgeTxCounts from "../handlers/getBridgeTxCounts";
import getLargeTransactions from "../handlers/getLargeTransactions";
import getLargeTransactionsPaginated from "../handlers/getLargeTransactionsPaginated";
import getLastBlocks from "../handlers/getLastBlocks";
import getNetflows from "../handlers/getNetflows";
import getTransactions from "../handlers/getTransactions";
import getBridgeStatsOnDay from "../handlers/getBridgeStatsOnDay";
import getStaleBridges from "../handlers/getStaleBridges";
import searchBridges from "../handlers/searchBridges";
import getNetflowsCompare from "../handlers/getNetflowsCompare";
import getTopGetLogs from "../handlers/getTopGetLogs";
import bridgeNetworks from "../data/bridgeNetworkData";
import { IResponse } from "../utils/lambda-response";
import { DEFAULT_TTL, generateApiCacheKey, getApiCache, setApiCache } from "../utils/cache";
import { getDependencyHealth, getHealthStatus, startHealthMonitoring } from "./health";
import { Singleflight } from "./singleflight";
import { routeSchemas } from "./routeSchemas";
import { normalizeBridgeDayStatsEvent, normalizeBridgesEvent } from "./requestNormalization";
import { responseAllowsCaching } from "./cachePolicy";

dotenv.config();

const debugLevel = Number(process.env.LLAMA_DEBUG_LEVEL ?? "0");
const requestDebugEnabled = process.env.FASTIFY_REQUEST_DEBUG === "1" || debugLevel >= 3;
const verboseRequestDebugEnabled = process.env.FASTIFY_REQUEST_DEBUG_VERBOSE === "1" || debugLevel >= 4;
const requestTimeoutMs = 50_000;
const slowRequestLogMs = 5000;
const cacheSingleflight = new Singleflight();

const cacheMetrics = {
  freshHits: 0,
  staleHits: 0,
  misses: 0,
  backgroundRefreshFailures: 0,
  requestTimeouts: 0,
};
let activeRequests = 0;

const server: FastifyInstance = fastify({
  logger: {
    level: requestDebugEnabled ? "debug" : "info",
  },
  disableRequestLogging: true,
  connectionTimeout: 60_000,
  keepAliveTimeout: 65_000,
  ajv: {
    customOptions: {
      removeAdditional: false,
    },
  },
});

type RequestWithTiming = {
  id: string;
  method: string;
  url: string;
  params: unknown;
  query: unknown;
  routeOptions?: { url?: string };
  log: any;
  requestStartTime?: number;
  countedAsActive?: boolean;
};

type PreparedHandlerResponse = {
  statusCode: number;
  body: any;
  headers: Record<string, any>;
};

class RequestTimeoutError extends Error {
  constructor() {
    super("Request timeout");
    this.name = "RequestTimeoutError";
  }
}

const finishActiveRequest = (request: RequestWithTiming) => {
  if (!request.countedAsActive) return;
  request.countedAsActive = false;
  activeRequests = Math.max(0, activeRequests - 1);
};

const isHealthcheckRequest = (request: RequestWithTiming) =>
  request.routeOptions?.url === "/healthcheck" || request.url.split("?", 1)[0] === "/healthcheck";

server.addHook("onRequest", async (request: any, reply) => {
  request.requestStartTime = Date.now();
  request.countedAsActive = true;
  activeRequests++;
  reply.raw.setTimeout(requestTimeoutMs + 5000);

  if (requestDebugEnabled && !isHealthcheckRequest(request)) {
    request.log.info(
      {
        reqId: request.id,
        method: request.method,
        url: request.url,
        routePath: request.routeOptions?.url,
        ...(verboseRequestDebugEnabled ? { params: request.params, query: request.query } : {}),
      },
      "request:start"
    );
  }
});

server.addHook("onRequestAbort", async (request: any) => {
  finishActiveRequest(request);
});

server.addHook("onResponse", async (request: any, reply) => {
  finishActiveRequest(request);
  const durationMs = typeof request.requestStartTime === "number" ? Date.now() - request.requestStartTime : undefined;
  const isSlow = typeof durationMs === "number" && durationMs >= slowRequestLogMs;
  if (isHealthcheckRequest(request) && !isSlow) return;
  if (!requestDebugEnabled && !isSlow) return;

  const payload = {
    reqId: request.id,
    method: request.method,
    url: request.url,
    routePath: request.routeOptions?.url,
    statusCode: reply.statusCode,
    durationMs,
    ...(verboseRequestDebugEnabled ? { params: request.params, query: request.query } : {}),
  };
  if (isSlow) request.log.warn(payload, "request:slow");
  else request.log.info(payload, "request:done");
});

server.addHook("onError", async (request: any, reply, error) => {
  const durationMs = typeof request.requestStartTime === "number" ? Date.now() - request.requestStartTime : undefined;
  const statusCode = Number((error as any).statusCode ?? reply.statusCode);
  if (statusCode < 500 && !requestDebugEnabled) return;

  const payload = {
    reqId: request.id,
    method: request.method,
    url: request.url,
    routePath: request.routeOptions?.url,
    statusCode,
    durationMs,
    ...(verboseRequestDebugEnabled ? { params: request.params, query: request.query } : {}),
    err: error,
  };
  if (statusCode >= 500) request.log.error(payload, "request:error");
  else request.log.warn(payload, "request:client-error");
});

const withRequestTimeout = <T>(promise: Promise<T>): Promise<T> => {
  let timeout: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new RequestTimeoutError()), requestTimeoutMs);
    timeout.unref?.();
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });
};

const cacheTTLFromResponse = (response: IResponse) => {
  const cacheControlEntry = Object.entries(response.headers ?? {}).find(
    ([name]) => name.toLowerCase() === "cache-control"
  );
  const match =
    typeof cacheControlEntry?.[1] === "string" ? cacheControlEntry[1].match(/(?:^|,)\s*max-age=(\d+)/i) : null;
  const parsed = match ? Number(match[1]) : NaN;
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_TTL;
};

const applyHandlerHeaders = (reply: any, headers: Record<string, any>) => {
  for (const [name, value] of Object.entries(headers)) {
    const normalized = name.toLowerCase();
    if (normalized === "content-length" || normalized === "connection" || normalized.startsWith("access-control-")) {
      continue;
    }
    if (value !== undefined) reply.header(name, value);
  }
};

const runHandlerAndCache = async (
  cacheKey: string,
  handler: Function,
  event: any
): Promise<PreparedHandlerResponse> => {
  const response = (await handler(event)) as IResponse;
  if (!response || typeof response.statusCode !== "number" || typeof response.body !== "string") {
    throw new Error("Handler returned an invalid response");
  }

  const body = JSON.parse(response.body);
  const headers = response.headers ?? {};
  if (responseAllowsCaching(headers) && response.statusCode >= 200 && response.statusCode < 300) {
    await setApiCache(cacheKey, body, cacheTTLFromResponse(response));
  }
  return { statusCode: response.statusCode, body, headers };
};

const refreshCache = (cacheKey: string, handler: Function, event: any) =>
  cacheSingleflight.getOrRun(cacheKey, () => runHandlerAndCache(cacheKey, handler, event));

const sendCachedResponse = (reply: any, cached: Awaited<ReturnType<typeof getApiCache>>) => {
  reply.header("X-Bridges-Cache", cached.state.toUpperCase());
  if (cached.state === "stale") {
    reply.header("Cache-Control", "no-cache");
    reply.header("Warning", '110 - "Response is stale"');
  } else if (cached.metadata) {
    const ageSeconds = Math.max(0, Math.floor((Date.now() - cached.metadata.storedAt) / 1000));
    reply.header("Cache-Control", `max-age=${Math.max(0, cached.metadata.cacheTTL - ageSeconds)}`);
  }
  return reply.code(200).send(cached.value);
};

type RequestValidator = (request: any) => string | undefined;
type EventNormalizer = (event: any) => any;

const validBridgeIds = new Set(bridgeNetworks.map(({ id }) => String(id)));
const validBridgeSlugs = new Set(
  bridgeNetworks.map(({ slug }) => slug).filter((slug): slug is string => Boolean(slug))
);

const validateBridgeId =
  (location: "params" | "query", name: string, allowAll: boolean = false): RequestValidator =>
  (request) => {
    const value = request[location]?.[name];
    if (value === undefined || (allowAll && value === "all")) return undefined;
    return validBridgeIds.has(String(value)) ? undefined : `Unknown bridge ID: ${value}`;
  };

const validateBridgeSlug: RequestValidator = (request) => {
  const slug = request.params?.slug;
  return validBridgeSlugs.has(slug) ? undefined : `Unknown bridge slug: ${slug}`;
};

const lambdaToFastify =
  (handler: Function, validate?: RequestValidator, normalizeEvent?: EventNormalizer) =>
  async (request: any, reply: any) => {
    const validationError = validate?.(request);
    if (validationError) {
      return reply.code(400).send({ error: "Bad Request", message: validationError });
    }

    const rawEvent = {
      pathParameters: request.params,
      queryStringParameters: request.query,
      body: {},
      routePath: request.routeOptions.url,
    };
    const event = normalizeEvent ? normalizeEvent(rawEvent) : rawEvent;
    const cacheKey = generateApiCacheKey(event);
    const cached = await getApiCache(cacheKey);

    if (cached.state === "fresh") {
      cacheMetrics.freshHits++;
      return sendCachedResponse(reply, cached);
    }

    if (cached.state === "stale") {
      cacheMetrics.staleHits++;
      refreshCache(cacheKey, handler, event).catch((error) => {
        cacheMetrics.backgroundRefreshFailures++;
        request.log.error({ err: error, cacheKey }, "background cache refresh failed");
      });
      return sendCachedResponse(reply, cached);
    }

    cacheMetrics.misses++;
    try {
      const response = await withRequestTimeout(refreshCache(cacheKey, handler, event));
      applyHandlerHeaders(reply, response.headers);
      reply.header("X-Bridges-Cache", "MISS");
      return reply.code(response.statusCode).send(response.body);
    } catch (error: any) {
      if (error instanceof RequestTimeoutError) {
        cacheMetrics.requestTimeouts++;
        return reply.code(504).send({
          error: "Gateway Timeout",
          message: "Request took too long to process",
        });
      }

      request.log.error({ err: error, cacheKey }, "handler execution failed");
      return reply.code(500).send({
        error: "Internal Server Error",
        message: error?.message || "An unexpected error occurred",
      });
    }
  };

const registerCachedGet = (
  url: string,
  schema: Record<string, unknown>,
  handler: Function,
  validate?: RequestValidator,
  normalizeEvent?: EventNormalizer
) => {
  server.route({
    method: "GET",
    url,
    schema: schema as any,
    handler: lambdaToFastify(handler, validate, normalizeEvent),
  });
};

const prewarmCriticalCaches = async () => {
  const targets: { routePath: string; pathParameters: Record<string, string>; handler: Function }[] = [
    { routePath: "/bridgetxcounts/:chain", pathParameters: { chain: "all" }, handler: getBridgeTxCounts },
  ];

  for (const { routePath, pathParameters, handler } of targets) {
    const event = { pathParameters, queryStringParameters: {}, body: {}, routePath };
    const cacheKey = generateApiCacheKey(event);
    try {
      const cached = await getApiCache(cacheKey);
      if (cached.state === "fresh") continue;
      await refreshCache(cacheKey, handler, event);
      console.log(`[INFO] Prewarmed ${routePath} ${JSON.stringify(pathParameters)}`);
    } catch (error) {
      console.error(`[ERROR] Prewarm failed for ${routePath} ${JSON.stringify(pathParameters)}:`, error);
    }
  }
};

const runtimeStats = () => ({
  activeRequests,
  cache: {
    ...cacheSingleflight.stats(),
    ...cacheMetrics,
  },
});

const start = async () => {
  try {
    await server.register(cors, {
      origin: true,
      exposedHeaders: ["X-Next-Cursor", "X-Has-More"],
    });

    registerCachedGet(
      "/bridgedaystats/:timestamp/:chain",
      routeSchemas.bridgeDayStats,
      getBridgeStatsOnDay,
      validateBridgeId("query", "id"),
      normalizeBridgeDayStatsEvent
    );
    registerCachedGet(
      "/bridgevolume/slug/:slug",
      routeSchemas.bridgeVolumeBySlug,
      getBridgeVolumeBySlug,
      validateBridgeSlug
    );
    registerCachedGet(
      "/bridgevolume/:chain",
      routeSchemas.bridgeVolume,
      getBridgeVolume,
      validateBridgeId("query", "id")
    );
    registerCachedGet("/bridgetxcounts/:chain", routeSchemas.bridgeTxCounts, getBridgeTxCounts);
    registerCachedGet("/bridges", routeSchemas.bridges, getBridges, undefined, normalizeBridgesEvent);
    registerCachedGet("/bridge/:id", routeSchemas.bridge, getBridge, validateBridgeId("params", "id"));
    registerCachedGet("/bridgechains", routeSchemas.noQuery, getBridgeChains);
    registerCachedGet("/largetransactions/:chain", routeSchemas.largeTransactions, getLargeTransactions);
    registerCachedGet(
      "/v2/largetransactions/:chain",
      routeSchemas.largeTransactionsPaginated,
      getLargeTransactionsPaginated
    );
    registerCachedGet("/lastblocks", routeSchemas.noQuery, getLastBlocks);
    registerCachedGet("/netflows/:period", routeSchemas.netflows, getNetflows);
    registerCachedGet(
      "/transactions/:id",
      routeSchemas.transactions,
      getTransactions,
      validateBridgeId("params", "id", true)
    );
    registerCachedGet("/top-getlogs", routeSchemas.noQuery, getTopGetLogs);
    registerCachedGet("/stale-bridges", routeSchemas.noQuery, getStaleBridges);
    registerCachedGet("/bridge-search", routeSchemas.bridgeSearch, searchBridges);
    registerCachedGet("/netflows/compare", routeSchemas.netflowsCompare, getNetflowsCompare);

    server.get("/healthcheck", { schema: routeSchemas.noQuery as any }, async (_, reply) => {
      const dependencies = getDependencyHealth();
      return reply.code(200).send({ ...getHealthStatus(), db: dependencies.db, redis: dependencies.redis });
    });

    server.get("/ready", { schema: routeSchemas.noQuery as any }, async (_, reply) => {
      const dependencies = getDependencyHealth();
      const ready = dependencies.db.status === "OK" && dependencies.redis.status !== "ERROR";
      return reply.code(ready ? 200 : 503).send({
        status: ready ? "OK" : "ERROR",
        timestamp: new Date().toISOString(),
        ...dependencies,
      });
    });

    startHealthMonitoring();

    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`Server listening on port ${port}`);
    console.log("\nAvailable routes:");
    console.log(server.printRoutes());

    prewarmCriticalCaches().catch((error) => console.error("[ERROR] Initial prewarm failed:", error));
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

let shuttingDown = false;
const shutdown = async (signal: NodeJS.Signals) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.warn("[PROCESS] Shutdown requested", { signal, runtime: runtimeStats() });
  const forceExit = setTimeout(() => {
    console.error("[PROCESS] Graceful shutdown timed out", { signal });
    process.exit(1);
  }, 10_000);
  forceExit.unref?.();
  try {
    await server.close();
    clearTimeout(forceExit);
    process.exit(0);
  } catch (error) {
    console.error("[PROCESS] Graceful shutdown failed:", error);
    process.exit(1);
  }
};

process.on("unhandledRejection", (reason) => {
  console.error("[PROCESS] Unhandled promise rejection:", reason);
});
process.on("uncaughtExceptionMonitor", (error, origin) => {
  console.error("[PROCESS] Uncaught exception", { origin, error });
});
process.on("exit", (code) => {
  console.warn("[PROCESS] Exiting", { code, runtime: runtimeStats() });
});
process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));

start();
