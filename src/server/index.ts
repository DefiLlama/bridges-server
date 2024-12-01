import fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import getBridgeVolume from "../handlers/getBridgeVolume";
import getBridges from "../handlers/getBridges";
import getBridge from "../handlers/getBridge";
import getBridgeChains from "../handlers/getBridgeChains";
import getLargeTransactions from "../handlers/getLargeTransactions";
import getLastBlocks from "../handlers/getLastBlocks";
import getNetflows from "../handlers/getNetflows";
import getTransactions from "../handlers/getTransactions";
import runAdapter from "../handlers/runAdapter";
import getBridgeStatsOnDay from "../handlers/getBridgeStatsOnDay";
import cron from "./cron";

dotenv.config();

const server: FastifyInstance = fastify({
  logger: true,
  connectionTimeout: 60000,
  keepAliveTimeout: 65000,
});

server.addHook("onRequest", async (request, reply) => {
  reply.raw.setTimeout(55000);

  const startTime = process.hrtime();
  request.raw.on("end", () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    request.log.info(`Request to ${request.url} took ${duration.toFixed(2)}ms`);
  });
});

const lambdaToFastify = (handler: Function) => async (request: any, reply: any) => {
  const event = {
    pathParameters: request.params,
    queryStringParameters: request.query,
    body: request.body,
  };

  try {
    const timeout = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Request timeout"));
      }, 50000);
    });

    const result = await Promise.race([handler(event), timeout]);

    return reply.code(result.statusCode).send(JSON.parse(result.body));
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
    server.get("/bridges", lambdaToFastify(getBridges));
    server.get("/bridge/:id", lambdaToFastify(getBridge));
    server.get("/bridgechains", lambdaToFastify(getBridgeChains));
    server.get("/largetransactions/:chain", lambdaToFastify(getLargeTransactions));
    server.get("/lastblocks", lambdaToFastify(getLastBlocks));
    server.get("/netflows/:period", lambdaToFastify(getNetflows));
    server.get("/transactions/:id", lambdaToFastify(getTransactions));
    server.post("/run-adapter", lambdaToFastify(runAdapter));
    server.get("/healthcheck", (_, reply) => {
      return reply.send("OK");
    });
    cron();

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
