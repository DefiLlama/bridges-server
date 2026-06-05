import { IResponse, successResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import { queryAggregatedDailyTimestampRange } from "../utils/wrappa/postgres/query";

const STALE_THRESHOLD_DAYS = 3;

const getStaleBridges = async () => {
  const startTs = Math.floor(Date.now() / 1000 - 60 * 60 * 24 * 7);
  const endTs = Math.floor(Date.now() / 1000);
  const currentDate = new Date();

  const queries = bridgeNetworks.flatMap((bridge) =>
    bridge.chains
      .filter((chain) => bridge.destinationChain !== chain)
      .map(async (chain) => {
        try {
          const volume = await queryAggregatedDailyTimestampRange(
            startTs,
            endTs,
            chain.toLowerCase(),
            bridge.bridgeDbName
          );

          let staleDays = 7;
          if (volume.length > 0) {
            let lastActiveDay = new Date(0);
            for (const day of volume) {
              if (day.total_deposit_txs > 0 || day.total_withdrawal_txs > 0) {
                lastActiveDay = new Date(day.ts);
              }
            }
            staleDays =
              lastActiveDay.getTime() === 0
                ? 7
                : Math.floor((currentDate.getTime() - lastActiveDay.getTime()) / (1000 * 3600 * 24));
          }

          return { bridge: bridge.bridgeDbName, chain, staleDays };
        } catch {
          return { bridge: bridge.bridgeDbName, chain, staleDays: -1 };
        }
      })
  );

  const results = await Promise.all(queries);

  const stale = results.filter((r) => r.staleDays >= STALE_THRESHOLD_DAYS);

  const byBridge: Record<string, { chain: string; staleDays: number }[]> = {};
  for (const { bridge, chain, staleDays } of stale) {
    if (!byBridge[bridge]) byBridge[bridge] = [];
    byBridge[bridge].push({ chain, staleDays });
  }

  return {
    thresholdDays: STALE_THRESHOLD_DAYS,
    staleCount: stale.length,
    bridges: byBridge,
  };
};

const handler = async (_event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const response = await getStaleBridges();
  return successResponse(response, 30 * 60); // 30 min cache
};

export default wrap(handler);
