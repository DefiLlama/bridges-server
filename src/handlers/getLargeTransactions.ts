import { IResponse, successResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { queryLargeTransactionsTimestampRange } from "../utils/wrappa/postgres/query";
import { getCurrentUnixTimestamp } from "../utils/date";
import { normalizeChain } from "../utils/normalizeChain";
import { enrichLargeTransactions } from "./largeTransactions.shared";

const MAX_TRANSACTIONS = 2000;

const getLargeTransactions = async (
  chain: string = "all",
  startTimestamp: string = "0",
  endTimestamp: string = "0"
) => {
  const queryStartTimestamp = parseInt(startTimestamp);
  const queryEndTimestamp = endTimestamp === "0" ? getCurrentUnixTimestamp() : parseInt(endTimestamp);
  const queryChain = chain === "all" ? null : normalizeChain(chain);

  const largeTransactions = await queryLargeTransactionsTimestampRange(
    queryChain,
    queryStartTimestamp,
    queryEndTimestamp,
    MAX_TRANSACTIONS
  );
  return enrichLargeTransactions(largeTransactions);
};

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const chain = event.pathParameters?.chain?.toLowerCase();
  const startTimestamp = event.queryStringParameters?.starttimestamp;
  const endTimestamp = event.queryStringParameters?.endtimestamp;
  const { transactions, pricingDegraded } = await getLargeTransactions(chain, startTimestamp, endTimestamp);
  return successResponse(
    transactions,
    pricingDegraded ? undefined : 10 * 60,
    pricingDegraded ? { "Cache-Control": "no-store" } : undefined
  );
};

export default wrap(handler);
