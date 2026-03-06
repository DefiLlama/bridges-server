import { IResponse, successResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import { normalizeChain } from "../utils/normalizeChain";
import { DEFAULT_TTL } from "../utils/cache";
import { queryBridgeTxCounts24h } from "../utils/wrappa/postgres/query";

const secondsInDay = 24 * 60 * 60;

const getBridgeTxCounts = async (chain?: string) => {
  const queryChain = chain && chain !== "all" ? normalizeChain(chain) : undefined;
  const startTimestamp = Math.floor(Date.now() / 1000) - secondsInDay;
  const txCounts = await queryBridgeTxCounts24h(startTimestamp, queryChain);
  const txCountsByBridgeName = txCounts.reduce((acc, row) => {
    acc[row.bridge_name] = row;
    return acc;
  }, {} as Record<string, (typeof txCounts)[number]>);

  return {
    bridges: bridgeNetworks.map(({ id, displayName, slug, bridgeDbName }) => {
      const counts = txCountsByBridgeName[bridgeDbName];
      const depositTxs24h = counts?.deposit_txs_24h ?? 0;
      const withdrawTxs24h = counts?.withdraw_txs_24h ?? 0;

      return {
        id,
        displayName,
        slug,
        txsPrevDay: depositTxs24h + withdrawTxs24h,
        depositTxs24h,
        withdrawTxs24h,
      };
    }),
  };
};

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const chain = event.pathParameters?.chain?.toLowerCase().replace(/%20/g, " ");
  const response = await getBridgeTxCounts(chain);
  return successResponse(response, DEFAULT_TTL);
};

export default wrap(handler);
