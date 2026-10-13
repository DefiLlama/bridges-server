import { IResponse, successResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import { buildStaleBridgeActivity } from "../utils/staleBridgeActivity";
import { queryBridgeDailyActivity } from "../utils/wrappa/postgres/query";

const STALE_THRESHOLD_DAYS = 3;

const getStaleBridges = async () => {
  const startTs = Math.floor(Date.now() / 1000 - 60 * 60 * 24 * 7);
  const endTs = Math.floor(Date.now() / 1000);
  const currentDate = new Date();

  let results;
  try {
    const activity = await queryBridgeDailyActivity(startTs, endTs);
    results = buildStaleBridgeActivity(
      bridgeNetworks,
      activity.map(({ bridge_name, chain, last_active_day }) => ({
        bridgeName: bridge_name,
        chain,
        lastActiveDay: last_active_day,
      })),
      currentDate
    );
  } catch {
    results = buildStaleBridgeActivity(bridgeNetworks, [], currentDate).map((entry) => ({ ...entry, staleDays: -1 }));
  }

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
