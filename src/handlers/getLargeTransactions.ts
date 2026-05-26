import { IResponse, successResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { queryLargeTransactionsTimestampRange, queryConfig } from "../utils/wrappa/postgres/query";
import { getCurrentUnixTimestamp, convertToUnixTimestamp } from "../utils/date";
import { getLlamaPrices } from "../utils/prices";
import { transformTokens } from "../helpers/tokenMappings";
import { importBridgeNetwork } from "../data/importBridgeNetwork";
import { normalizeChain } from "../utils/normalizeChain";

const MAX_LIMIT = 2000;
const DEFAULT_LIMIT = 100;

const getLargeTransactions = async (
  chain: string = "all",
  startTimestamp: string = "0",
  endTimestamp: string = "0",
  limit: number = DEFAULT_LIMIT,
  offset: number = 0
) => {
  const queryStartTimestamp = parseInt(startTimestamp);
  const queryEndTimestamp = endTimestamp === "0" ? getCurrentUnixTimestamp() : parseInt(endTimestamp);
  const queryChain = chain === "all" ? null : normalizeChain(chain);

  const configs = await queryConfig();
  const configMapping = {} as Record<string, string>;
  configs.forEach((config) => {
    const bridgeNetwork = importBridgeNetwork(config.bridge_name);
    if (bridgeNetwork) {
      configMapping[config.id] = bridgeNetwork.displayName;
    }
  });

  const largeTransactions = await queryLargeTransactionsTimestampRange(
    queryChain,
    queryStartTimestamp,
    queryEndTimestamp
  );

  const tokenSet = new Set<string>();
  largeTransactions.forEach((tx: any) => {
    const symbol = transformTokens[tx.chain]?.[tx.token] ?? `${tx.chain}:${tx.token}`;
    tokenSet.add(symbol);
  });
  const prices = await getLlamaPrices(Array.from(tokenSet));

  const allResults = largeTransactions.map((tx: any) => {
    const bridgeName = configMapping[tx.bridge_id] ?? "unknown";
    const transformedToken = transformTokens[tx.chain]?.[tx.token] ?? `${tx.chain}:${tx.token}`;
    const symbol = prices?.[transformedToken]?.symbol ?? "unknown";
    return {
      date: convertToUnixTimestamp(tx.ts),
      txHash: `${tx.chain}:${tx.tx_hash}`,
      from: tx.tx_from,
      to: tx.tx_to,
      token: `${tx.chain}:${tx.token}`,
      symbol,
      amount: tx.amount,
      isDeposit: tx.is_deposit,
      bridge: bridgeName,
      chain: tx.chain,
      usdValue: tx.usd_value,
    };
  });

  return {
    total: allResults.length,
    limit,
    offset,
    transactions: allResults.slice(offset, offset + limit),
  };
};

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const chain = event.pathParameters?.chain?.toLowerCase();
  const startTimestamp = event.queryStringParameters?.starttimestamp;
  const endTimestamp = event.queryStringParameters?.endtimestamp;

  const limitParam = event.queryStringParameters?.limit;
  const offsetParam = event.queryStringParameters?.offset;
  const limit = Math.min(limitParam ? parseInt(limitParam) : DEFAULT_LIMIT, MAX_LIMIT);
  const offset = offsetParam ? Math.max(parseInt(offsetParam), 0) : 0;

  const response = await getLargeTransactions(chain, startTimestamp, endTimestamp, limit, offset);
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);
