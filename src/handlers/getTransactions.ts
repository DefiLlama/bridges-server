import { IResponse, successResponse, errorResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { queryTransactionsTimestampRangeByBridgeNetwork } from "../utils/wrappa/postgres/query";
import { importBridgeNetwork } from "../data/importBridgeNetwork";
import { normalizeChain } from "../utils/normalizeChain";
import {
  decodeTransactionCursor,
  DEFAULT_TRANSACTIONS_LIMIT,
  encodeTransactionCursor,
  parseTransactionsLimit,
  TransactionCursor,
} from "../utils/transactionCursor";

interface TransactionsPage {
  transactions: any[];
  hasMore: boolean;
  nextCursor?: string;
}

const getTransactions = async (
  startTimestamp?: string,
  endTimestamp?: string,
  bridgeNetworkId?: string,
  chain?: string,
  sourceChain?: string,
  address?: string,
  limit: number = DEFAULT_TRANSACTIONS_LIMIT,
  cursor?: TransactionCursor
): Promise<TransactionsPage | IResponse> => {
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
  const defaultStartTimestamp = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
  const queryStartTimestamp = startTimestamp ? parseInt(startTimestamp) : defaultStartTimestamp;
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
  const transactions = (await queryTransactionsTimestampRangeByBridgeNetwork(
    queryStartTimestamp,
    queryEndTimestamp,
    queryName,
    queryChain,
    limit + 1,
    cursor
  )) as any[];

  const hasMore = transactions.length > limit;
  const pageTransactions = transactions.slice(0, limit);
  const lastTransaction = pageTransactions.at(-1);
  const nextCursor =
    hasMore && lastTransaction?.cursor_ts && lastTransaction?.transaction_id
      ? encodeTransactionCursor({
          timestamp: lastTransaction.cursor_ts,
          id: String(lastTransaction.transaction_id),
        })
      : undefined;

  const response = pageTransactions
    .map((tx) => {
      delete tx.transaction_id;
      delete tx.cursor_ts;
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
            (addressHash === tx.tx_to?.toLowerCase() || addressHash === tx.tx_from?.toLowerCase()) &&
            addressChain === tx.chain
          )
        )
          return null;
      }
      return tx;
    })
    .filter((tx) => tx);

  return { transactions: response, hasMore, nextCursor };
};

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const id = event.pathParameters?.id?.toLowerCase();
  const startTimestamp = event.queryStringParameters?.starttimestamp;
  const endTimestamp = event.queryStringParameters?.endtimestamp;
  const chain = event.queryStringParameters?.chain?.toLowerCase();
  const sourceChain = event.queryStringParameters?.sourcechain?.toLowerCase();
  const address = event.queryStringParameters?.address?.toLowerCase();
  const requestedLimit = event.queryStringParameters?.limit;
  const limit = parseTransactionsLimit(requestedLimit);
  if (limit === undefined) {
    return errorResponse({ message: "Invalid limit. Use an integer from 1 to 10000." });
  }

  const cursorValue = event.queryStringParameters?.cursor;
  const cursor = cursorValue ? decodeTransactionCursor(cursorValue) : undefined;
  if (cursorValue && !cursor) {
    return errorResponse({ message: "Invalid transaction cursor." });
  }

  const response = await getTransactions(startTimestamp, endTimestamp, id, chain, sourceChain, address, limit, cursor);
  if ("statusCode" in response) return response;

  return successResponse(response.transactions, undefined, {
    "Cache-Control": "no-store",
    "X-Has-More": String(response.hasMore),
    ...(response.nextCursor ? { "X-Next-Cursor": response.nextCursor } : {}),
  });
};

export default wrap(handler);
