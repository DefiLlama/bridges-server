import { wrapScheduledLambda } from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

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
  const now = Math.floor(Date.now() / 1000);
  const fourHoursAgo = now - 60 * 60;

  for (const bridge of bridgeNetworks) {
    await invokeLambda("llama-bridges-prod-runAdapterFromTo", {
      bridgeName: bridge.bridgeDbName,
      fromTimestamp: fourHoursAgo,
    });
  }

  console.log("Initiated historical runs for all adapters");
};

export default wrapScheduledLambda(handler);
