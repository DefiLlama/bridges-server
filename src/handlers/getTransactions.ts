import { IResponse, successResponse, errorResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { queryTransactionsTimestampRangeByBridgeNetwork } from "../utils/wrappa/postgres/query";
import { importBridgeNetwork } from "../data/importBridgeNetwork";

const getTransactions = async (startTimestamp?: string, endTimestamp?: string, bridgeNetworkId?: string) => {
  if (!startTimestamp || !endTimestamp) {
    return errorResponse({
      message: "Must include start and end timestamps with 'starttimestamp' and 'endtimestamp' query params.",
    });
  }
  const queryStartTimestamp = parseInt(startTimestamp);
  const queryEndTimestamp = parseInt(endTimestamp);
  let queryName = undefined;
  if (bridgeNetworkId) {
    const bridgeNetwork = importBridgeNetwork(undefined, parseInt(bridgeNetworkId));
    const { bridgeDbName } = bridgeNetwork!;
    queryName = bridgeDbName;
  }

  const transactions = (await queryTransactionsTimestampRangeByBridgeNetwork(
    queryStartTimestamp,
    queryEndTimestamp,
    queryName
  )) as any[];

  const response = transactions.map((tx) => {
    delete tx.bridge_id;
    return tx;
  });

  return response;
};

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const id = event.pathParameters?.id?.toLowerCase();
  const startTimestamp = event.queryStringParameters?.starttimestamp;
  const endTimestamp = event.queryStringParameters?.endtimestamp;
  const response = await getTransactions(startTimestamp, endTimestamp, id);
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);
