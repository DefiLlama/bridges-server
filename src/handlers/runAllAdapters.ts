import { wrapScheduledLambda } from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { sql } from "../utils/db";
import { store } from "../utils/s3";

const lambdaClient = new LambdaClient({});

async function invokeLambda(functionName: string, event: any) {
  const command = new InvokeCommand({
    FunctionName: functionName,
    InvocationType: "Event",
    Payload: Buffer.from(JSON.stringify(event, null, 2)),
  });

  try {
    const data = await lambdaClient.send(command);
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export default wrapScheduledLambda(async (event) => {
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

  if (event?.bridgeName) {
    const bridge = bridgeNetworks.findIndex((x) => x.bridgeDbName === event.bridgeName);
    if (!bridge) {
      throw new Error(`Bridge ${event.bridgeName} not found`);
    }
    await invokeLambda("llama-bridges-prod-runAdapter", {
      bridgeIndices: [bridge],
      lastRecordedBlocks: lastRecordedBlocks[0].result,
    });
    return;
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
  try {
    await sql.end();
  } catch (e) {
    console.error(e);
  }
});
