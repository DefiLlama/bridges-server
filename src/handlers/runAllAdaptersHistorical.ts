import { wrapScheduledLambda } from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import aws from "aws-sdk";
import { sql } from "../utils/db";

async function invokeLambda(functionName: string, event: any) {
  return new Promise((resolve, _reject) => {
    new aws.Lambda().invoke(
      {
        FunctionName: functionName,
        InvocationType: "Event",
        Payload: JSON.stringify(event, null, 2),
      },
      function (error, data) {
        console.log(error, data);
        resolve(data);
      }
    );
  });
}

const handler = async (event: any) => {
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
