import { IResponse, successResponse, errorResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { queryTransactionsTimestampRangeByBridgeNetwork } from "../utils/wrappa/postgres/query";
import { importBridgeNetwork } from "../data/importBridgeNetwork";
import { normalizeChain } from "../utils/normalizeChain";

const maxResponseTxs = 6000; // maximum number of transactions to return

const getTransactions = async (
  startTimestamp?: string,
  endTimestamp?: string,
  bridgeNetworkId?: string,
  chain?: string,
  sourceChain?: string,
  address?: string,
  limit?: string
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
  const queryChain = sourceChain ? normalizeChain(sourceChain) : chain ? normalizeChain(chain) : chain;
  let queryName = undefined;
  if (bridgeNetworkId && !isNaN(parseInt(bridgeNetworkId))) {
    const bridgeNetwork = importBridgeNetwork(undefined, parseInt(bridgeNetworkId));
    const { bridgeDbName } = bridgeNetwork!;
    queryName = bridgeDbName;
  }
  let addressChain = undefined as unknown;
  let addressHash = undefined as unknown;
  if (typeof address === "string") {
    [addressChain, addressHash] = address?.split(":");
  }
  const integerLimit = isNaN(parseInt(limit ?? "100000")) ? maxResponseTxs : parseInt(limit ?? "100000");
  const responseLimit = Math.min(maxResponseTxs, integerLimit);

  const transactions = (await queryTransactionsTimestampRangeByBridgeNetwork(
    queryStartTimestamp,
    queryEndTimestamp,
    queryName,
    queryChain
  )) as any[];

  const response = transactions
    .map((tx) => {
      delete tx.bridge_id;
      if (sourceChain) {
        tx.sourceChain = sourceChain;
        if ((tx.is_deposit && sourceChain === tx.chain) || (!tx.is_deposit && sourceChain === tx.destination_chain)) {
          delete tx.is_deposit;
        } else return null;
      }
      delete tx.destination_chain;
      if (addressHash) {
        if (
          !(
            (addressHash === tx.tx_to.toLowerCase() || addressHash === tx.tx_from.toLowerCase()) &&
            addressChain === tx.chain
          )
        )
          return null;
      }
      return tx;
    })
    .filter((tx) => tx)
    .slice(0, responseLimit);

  return response;
};

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const id = event.pathParameters?.id?.toLowerCase();
  const startTimestamp = event.queryStringParameters?.starttimestamp;
  const endTimestamp = event.queryStringParameters?.endtimestamp;
  const chain = event.queryStringParameters?.chain?.toLowerCase();
  const sourceChain = event.queryStringParameters?.sourcechain?.toLowerCase();
  const address = event.queryStringParameters?.address?.toLowerCase();
  const limit = event.queryStringParameters?.limit;
  const response = await getTransactions(startTimestamp, endTimestamp, id, chain, sourceChain, address, limit);
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);
