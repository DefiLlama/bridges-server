import { wrapScheduledLambda } from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import aws from "aws-sdk";

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
  for (let i =0; i<bridgeNetworks.length; i++) {
    await invokeLambda(`llama-bridges-prod-runAdapter`, {
      bridgeIndex: i
    });
  }
});
