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
    await store("lastRecordedBlocks.json", lastRecordedBlocks[0].result);
  } catch (e) {
    console.error(e);
  }
  for (let i = 0; i < bridgeNetworks.length; i++) {
    await invokeLambda(`llama-bridges-prod-runAdapter`, {
      bridgeIndex: i,
      lastRecordedBlocks: lastRecordedBlocks[0].result,
    });
  }
});
