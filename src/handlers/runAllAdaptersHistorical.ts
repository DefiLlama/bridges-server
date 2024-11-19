import { wrapScheduledLambda } from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { closeIdleConnections } from "../utils/wrappa/postgres/write";

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

const handler = async (_event: any) => {
  await closeIdleConnections();
  const now = Math.floor(Date.now() / 1000);
  const dayAgo = now - 86400;

  for (const bridge of bridgeNetworks) {
    await invokeLambda("llama-bridges-prod-runAdapterFromTo", {
      bridgeName: bridge.bridgeDbName,
      fromTimestamp: dayAgo,
      toTimestamp: now,
    });
  }

  console.log("Initiated historical runs for all adapters");
};

export default wrapScheduledLambda(handler);
