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
import getLastBlocks from "../handlers/getLastBlocks";
import getNetflows from "../handlers/getNetflows";
import getTransactions from "../handlers/getTransactions";
import runAdapter from "../handlers/runAdapter";
import getBridgeStatsOnDay from "../handlers/getBridgeStatsOnDay";
import getTopGetLogs from "../handlers/getTopGetLogs";
import { generateApiCacheKey, registerCacheHandler, warmCache, needsWarming, setCache, getCache } from "../utils/cache";
import { startHealthMonitoring, getHealthStatus } from "./health";
import { warmAllCaches } from "./jobs/warmCache";

dotenv.config();

const debugLevel = Number(process.env.LLAMA_DEBUG_LEVEL ?? "0");
const requestDebugEnabled = process.env.FASTIFY_REQUEST_DEBUG === "1" || debugLevel >= 3;
const verboseRequestDebugEnabled = process.env.FASTIFY_REQUEST_DEBUG_VERBOSE === "1" || debugLevel >= 4;

const server: FastifyInstance = fastify({
  logger: {
    level: requestDebugEnabled ? "debug" : "info",
  },
  connectionTimeout: 60000,
  keepAliveTimeout: 65000,
});

server.addHook("onRequest", async (request: any, reply) => {
  request.requestStartTime = Date.now();
  reply.raw.setTimeout(55000);
  if (requestDebugEnabled) {
    request.log.info(
      {
        reqId: request.id,
        method: request.method,
        url: request.url,
        routePath: request.routeOptions?.url,
        params: request.params,
        query: request.query,
      },
      "request:start"
    );
  }
});

server.addHook("onResponse", async (request: any, reply) => {
  if (!requestDebugEnabled) {
    return;
  }
  const durationMs = typeof request.requestStartTime === "number" ? Date.now() - request.requestStartTime : undefined;
  const payload = {
    reqId: request.id,
    method: request.method,
    url: request.url,
    routePath: request.routeOptions?.url,
    statusCode: reply.statusCode,
    durationMs,
  } as any;
  if (verboseRequestDebugEnabled) {
    payload.params = request.params;
    payload.query = request.query;
  }
  request.log.info(payload, "request:done");
});

server.addHook("onError", async (request: any, reply, error) => {
  if (!requestDebugEnabled) {
    return;
  }
  const durationMs = typeof request.requestStartTime === "number" ? Date.now() - request.requestStartTime : undefined;
  request.log.error(
    {
      reqId: request.id,
      method: request.method,
      url: request.url,
      routePath: request.routeOptions?.url,
      statusCode: reply.statusCode,
      durationMs,
      params: request.params,
      query: request.query,
      err: error,
    },
    "request:error"
  );
});

const lambdaToFastify = (handler: Function) => async (request: any, reply: any) => {
  const event = {
    pathParameters: request.params,
    queryStringParameters: request.query,
    body: request.body,
    routePath: request.routeOptions.url,
  };

  const cacheKey = generateApiCacheKey(event);
  const cachedData = await getCache(cacheKey);

  registerCacheHandler(cacheKey, () => handler(event));

  if (cachedData) {
    if (await needsWarming(cacheKey)) {
      warmCache(cacheKey);
    }
    return reply.code(200).send(cachedData);
  }

  try {
    const timeout = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Request timeout"));
      }, 50000);
    });

    const result = await Promise.race([handler(event), timeout]);
    const parsedBody = JSON.parse(result.body);
    await setCache(cacheKey, parsedBody);
    return reply.code(result.statusCode).send(parsedBody);
  } catch (error: any) {
    request.log.error(error);

    if (error.message === "Request timeout") {
      return reply.code(504).send({
        error: "Gateway Timeout",
        message: "Request took too long to process",
      });
    }

    return reply.code(500).send({
      error: "Internal Server Error",
      message: error.message || "An unexpected error occurred",
    });
  }
};

const start = async () => {
  try {
    await server.register(cors, {
      origin: true,
    });

    server.get("/bridgedaystats/:timestamp/:chain", lambdaToFastify(getBridgeStatsOnDay));
    server.get("/bridgevolume/:chain", lambdaToFastify(getBridgeVolume));
    server.get("/bridgevolume/slug/:slug", lambdaToFastify(getBridgeVolumeBySlug));
    server.get("/bridgetxcounts/:chain", lambdaToFastify(getBridgeTxCounts));
    server.get("/bridges", lambdaToFastify(getBridges));
    server.get("/bridge/:id", lambdaToFastify(getBridge));
    server.get("/bridgechains", lambdaToFastify(getBridgeChains));
    server.get("/largetransactions/:chain", lambdaToFastify(getLargeTransactions));
    server.get("/lastblocks", lambdaToFastify(getLastBlocks));
    server.get("/netflows/:period", lambdaToFastify(getNetflows));
    server.get("/transactions/:id", lambdaToFastify(getTransactions));
    server.post("/run-adapter", lambdaToFastify(runAdapter));
    server.get("/top-getlogs", lambdaToFastify(getTopGetLogs));
    server.get("/healthcheck", async (_, reply) => {
      const { health, statusCode } = getHealthStatus();
      return reply.code(statusCode).send(health);
    });

    startHealthMonitoring();

    setInterval(async () => {
      try {
        console.log("[INFO] Starting cache warming cycle");
        await warmAllCaches();
        console.log("[INFO] Cache warming cycle completed");
      } catch (error) {
        console.error("[ERROR] Cache warming failed:", error);
      }
    }, 10 * 60 * 1000);

    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`Server listening on port ${port}`);
    console.log("\nAvailable routes:");
    server.ready(() => {
      console.log(server.printRoutes());
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
