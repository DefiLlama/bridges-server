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

dotenv.config();

const server: FastifyInstance = fastify({
  logger: true,
});

const lambdaToFastify = (handler: Function) => async (request: any, reply: any) => {
  const event = {
    pathParameters: request.params,
    queryStringParameters: request.query,
    body: request.body,
  };

  try {
    const result = await handler(event);
    return reply.code(result.statusCode).send(JSON.parse(result.body));
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: "Internal Server Error" });
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
    server.get("/netflows/:day", lambdaToFastify(getNetflows));
    server.get("/transactions/:id", lambdaToFastify(getTransactions));
    server.post("/run-adapter", lambdaToFastify(runAdapter));
    server.get("/healthcheck", (_, reply) => {
      return reply.send("OK");
    });

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
