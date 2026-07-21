import { IResponse, successResponse, errorResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import {
  countLargeTransactionsTimestampRange,
  queryLargeTransactionsTimestampRange,
} from "../utils/wrappa/postgres/query";
import { getCurrentUnixTimestamp } from "../utils/date";
import { normalizeChain } from "../utils/normalizeChain";
import { enrichLargeTransactions } from "./largeTransactions.shared";

const MAX_LIMIT = 2000;
const DEFAULT_LIMIT = 100;

const parseIntegerQueryParam = (value?: string) => {
  if (value === undefined) return undefined;
  if (value.trim() === "") return null;

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

const getLargeTransactionsPaginated = async (
  chain: string = "all",
  startTimestamp: string = "0",
  endTimestamp: string = "0",
  limit: number = DEFAULT_LIMIT,
  offset: number = 0
) => {
  const queryStartTimestamp = parseInt(startTimestamp);
  const queryEndTimestamp = endTimestamp === "0" ? getCurrentUnixTimestamp() : parseInt(endTimestamp);
  const queryChain = chain === "all" ? null : normalizeChain(chain);

  const [largeTransactions, total] = await Promise.all([
    queryLargeTransactionsTimestampRange(queryChain, queryStartTimestamp, queryEndTimestamp, limit, offset),
    countLargeTransactionsTimestampRange(queryChain, queryStartTimestamp, queryEndTimestamp),
  ]);
  const { transactions, pricingDegraded } = await enrichLargeTransactions(largeTransactions);

  return {
    total,
    limit,
    offset,
    transactions,
    pricingDegraded,
  };
};

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const chain = event.pathParameters?.chain?.toLowerCase();
  const startTimestamp = event.queryStringParameters?.starttimestamp;
  const endTimestamp = event.queryStringParameters?.endtimestamp;
  const limitParam = event.queryStringParameters?.limit;
  const offsetParam = event.queryStringParameters?.offset;
  const parsedLimit = parseIntegerQueryParam(limitParam);
  const parsedOffset = parseIntegerQueryParam(offsetParam);

  if (parsedLimit === null || (parsedLimit !== undefined && (parsedLimit < 1 || parsedLimit > MAX_LIMIT))) {
    return errorResponse({ message: `limit must be an integer between 1 and ${MAX_LIMIT}.` });
  }

  if (parsedOffset === null || (parsedOffset !== undefined && parsedOffset < 0)) {
    return errorResponse({ message: "offset must be a non-negative integer." });
  }

  const limit = parsedLimit ?? DEFAULT_LIMIT;
  const offset = parsedOffset ?? 0;

  const response = await getLargeTransactionsPaginated(chain, startTimestamp, endTimestamp, limit, offset);
  const { pricingDegraded, ...body } = response;
  return successResponse(
    body,
    pricingDegraded ? undefined : 10 * 60,
    pricingDegraded ? { "Cache-Control": "no-store" } : undefined
  );
};

export default wrap(handler);
