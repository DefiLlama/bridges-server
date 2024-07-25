import { wrapScheduledLambda } from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import aws from "aws-sdk";
import { sql } from "../utils/db";
import { store } from "../utils/s3";

async function invokeLambda(functioName: string, event: any) {
  return new Promise((resolve, _reject) => {
    new aws.Lambda().invoke(
      {
        FunctionName: functioName,
        InvocationType: "Event",
        Payload: JSON.stringify(event, null, 2), // pass params
      },
      function (error, data) {
        console.log(error, data);
        resolve(data);
      }
    );
  });
}

export default wrapScheduledLambda(async (_event) => {
  const lastRecordedBlocks = await sql`SELECT jsonb_object_agg(bridge_id::text, subresult) as result
  FROM (
      SELECT bridge_id, jsonb_build_object('startBlock', MIN(tx_block), 'endBlock', MAX(tx_block)) as subresult
      FROM bridges.transactions
      GROUP BY bridge_id
  ) subquery;
  `;
  try {
    const bridgeConfig = await sql`SELECT * FROM bridges.config`;

    const bridgeConfigById = bridgeConfig.reduce((acc: any, config: any) => {
      acc[config.id] = config;
      return acc;
    }, {});

    const lastBlocksByName = Object.keys(lastRecordedBlocks[0].result).reduce((acc: any, bridgeId: any) => {
      acc[`${bridgeConfigById[bridgeId].bridge_name}-${bridgeConfigById[bridgeId].chain}`] =
        lastRecordedBlocks[0].result[bridgeId];
      return acc;
    }, {});
    await store("lastRecordedBlocks.json", JSON.stringify(lastBlocksByName));
    console.log("Stored last recorded blocks");
  } catch (e) {
    console.error("Failed to store last recorded blocks");
    console.error(e);
  }
  const bridgeIndices = bridgeNetworks.map((_, i) => i);
  const randomIndices = bridgeIndices.sort(() => Math.random() - 0.5);

  const groupedIndices = [];
  for (let i = 0; i < randomIndices.length; i += 3) {
    groupedIndices.push(randomIndices.slice(i, i + 3));
  }

  for (const group of groupedIndices) {
    await invokeLambda("llama-bridges-prod-runAdapter", {
      bridgeIndices: group,
      lastRecordedBlocks: lastRecordedBlocks[0].result,
    });
  }
});
