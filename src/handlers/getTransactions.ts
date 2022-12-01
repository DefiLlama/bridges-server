import { IResponse, successResponse, errorResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { queryTransactionsTimestampRangeByBridgeNetwork } from "../utils/wrappa/postgres/query";
import { importBridgeNetwork } from "../data/importBridgeNetwork";

const getTransactions = async (
  startTimestamp?: string,
  endTimestamp?: string,
  bridgeNetworkId?: string,
  chain?: string,
  sourceChain?: string
) => {
  if (bridgeNetworkId && !(bridgeNetworkId === "all") && isNaN(parseInt(bridgeNetworkId))) {
    return errorResponse({
      message: "Invalid Bridge ID entered. Use Bridge ID from 'bridges' endpoint as path param, or `all`.",
    });
  }

  if (chain && sourceChain) {
    return errorResponse({
      message: "Cannot include both 'chain' and 'sourceChain' as query params.",
    });
  }
  const queryStartTimestamp = startTimestamp ? parseInt(startTimestamp) : 0;
  const queryEndTimestamp = endTimestamp ? parseInt(endTimestamp) : undefined;
  const queryChain = sourceChain ? sourceChain : chain;
  let queryName = undefined;
  if (bridgeNetworkId && !isNaN(parseInt(bridgeNetworkId))) {
    const bridgeNetwork = importBridgeNetwork(undefined, parseInt(bridgeNetworkId));
    const { bridgeDbName } = bridgeNetwork!;
    queryName = bridgeDbName;
  }

  const transactions = (await queryTransactionsTimestampRangeByBridgeNetwork(
    queryStartTimestamp,
    queryEndTimestamp,
    queryName,
    queryChain
  )) as any[];

  const response = transactions
    .map((tx) => {
      if (sourceChain) {
        if (tx.is_deposit && sourceChain === tx.chain) {
          delete tx.is_deposit;
        } else return null;
      }
      delete tx.bridge_id;
      return tx;
    })
    .filter((tx) => tx);
 
  return response;
};

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const id = event.pathParameters?.id?.toLowerCase();
  const startTimestamp = event.queryStringParameters?.starttimestamp;
  const endTimestamp = event.queryStringParameters?.endtimestamp;
  const chain = event.queryStringParameters?.chain;
  const source = event.queryStringParameters?.source;
  const response = await getTransactions(startTimestamp, endTimestamp, id, chain, source);
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);
