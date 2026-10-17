import wrap, { wrapScheduledLambda } from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import { runAdapterToCurrentBlock } from "../utils/adapter";
import { sql } from "../utils/db";
import { successResponse } from "../utils/lambda-response";
import { getLastRecordedBlocks } from "../utils/wrappa/postgres/query";

const handler = async () => {
  const lastRecordedBlocks = await getLastRecordedBlocks();

  const bridgeConfig = await sql`SELECT * FROM bridges.config`;

  const bridgeConfigById = bridgeConfig.reduce((acc: any, config: any) => {
    acc[config.id] = config;
    return acc;
  }, {});

  const lastBlocksByName = Object.keys(lastRecordedBlocks).reduce((acc: any, bridgeId: any) => {
    acc[`${bridgeConfigById[bridgeId].bridge_name}-${bridgeConfigById[bridgeId].chain}`] = lastRecordedBlocks[bridgeId];
    return acc;
  }, {});
  return successResponse(lastBlocksByName);
};

export default wrap(handler);
