import { IResponse, successResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { queryLargeTransactionsTimestampRange } from "../utils/wrappa/postgres/query";
import { getCurrentUnixTimestamp, convertToUnixTimestamp } from "../utils/date";
import { getLlamaPrices } from "../utils/prices";
import { transformTokens } from "../helpers/tokenMappings";

const getLargeTransactions = async (
  chain: string = "all",
  startTimestamp: string = "0",
  endTimestamp: string = "0"
) => {
  const queryStartTimestamp = parseInt(startTimestamp);
  const queryEndTimestamp = endTimestamp === "0" ? getCurrentUnixTimestamp() : parseInt(endTimestamp);
  const queryChain = chain === "all" ? null : chain;

  const largeTransactions = await queryLargeTransactionsTimestampRange(
    queryChain,
    queryStartTimestamp,
    queryEndTimestamp
  );

  const tokenSet = new Set<string>();
  largeTransactions.map((tx) => {
    const symbol = transformTokens[tx.chain]?.[tx.token]
      ? transformTokens[tx.chain]?.[tx.token]
      : `${tx.chain}:${tx.token}`;
    tokenSet.add(symbol);
  });
  const prices = await getLlamaPrices(Array.from(tokenSet));
  const response = largeTransactions.map((tx) => {
    const transformedToken = transformTokens[tx.chain]?.[tx.token]
      ? transformTokens[tx.chain]?.[tx.token]
      : `${tx.chain}:${tx.token}`;
    const symbol = prices?.[transformedToken]?.symbol ?? "unknown";
    return {
      date: convertToUnixTimestamp(tx.ts),
      txHash: `${tx.chain}:${tx.tx_hash}`,
      from: tx.tx_from,
      to: tx.tx_to,
      token: `${tx.chain}:${tx.token}`,
      symbol: symbol,
      amount: tx.amount,
      isDeposit: tx.is_deposit,
      chain: tx.chain,
      usdValue: tx.usd_value,
    };
  });

  return response;
};

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const chain = event.pathParameters?.chain?.toLowerCase();
  const startTimestamp = event.queryStringParameters?.starttimestamp;
  const endTimestamp = event.queryStringParameters?.endtimestamp;
  const response = await getLargeTransactions(chain, startTimestamp, endTimestamp);
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);
