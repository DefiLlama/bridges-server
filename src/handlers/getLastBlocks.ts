import wrap, { wrapScheduledLambda } from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import { runAdapterToCurrentBlock } from "../utils/adapter";
import { sql } from "../utils/db";
import { successResponse } from "../utils/lambda-response";

const handler = async (event: any) => {
  const lastRecordedBlocks = (
    await sql`SELECT jsonb_object_agg(bridge_id::text, subresult) as result
  FROM (
      SELECT bridge_id, jsonb_build_object('startBlock', MIN(tx_block), 'endBlock', MAX(tx_block)) as subresult
      FROM bridges.transactions
      GROUP BY bridge_id
  ) subquery;
  `
  )[0].result;

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
