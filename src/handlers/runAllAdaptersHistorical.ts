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
  const oneDayAgo = now - 86400;
  const halfDayAgo = now - 43200;

  const timeRanges = [
    { start: oneDayAgo, end: halfDayAgo },
    { start: halfDayAgo, end: now },
  ];

  for (const timeRange of timeRanges) {
    for (const bridge of bridgeNetworks) {
      await invokeLambda("llama-bridges-prod-runAdapterFromTo", {
        bridgeName: bridge.bridgeDbName,
        fromTimestamp: timeRange.start,
        toTimestamp: timeRange.end,
      });
    }
  }

  console.log("Initiated historical runs for all adapters");
};

export default wrapScheduledLambda(handler);
