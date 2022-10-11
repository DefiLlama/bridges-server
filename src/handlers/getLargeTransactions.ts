import { IResponse, successResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { queryLargeTransactionsTimestampRange } from "../utils/wrappa/postgres/query";
import { getCurrentUnixTimestamp, convertToUnixTimestamp } from "../utils/date";

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

  const response = largeTransactions.map((tx) => {
    return {
      date: convertToUnixTimestamp(tx.ts),
      txHash: tx.tx_hash,
      from: tx.tx_from,
      to: tx.tx_to,
      token: `${tx.chain}:${tx.token}`,
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
