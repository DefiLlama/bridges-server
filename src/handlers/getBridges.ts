import { IResponse, successResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getDailyBridgeVolumesByBridge } from "../utils/bridgeVolume";
import { craftBridgeChainsResponse } from "./getBridgeChains";
import { secondsInDay, getCurrentUnixTimestamp, getTimestampAtStartOfDay } from "../utils/date";
import bridgeNetworks from "../data/bridgeNetworkData";
import { normalizeChain, getChainDisplayName } from "../utils/normalizeChain";
import { getAllLast24HVolumes } from "../utils/wrappa/postgres/query";

const getBridges = async () => {
  const startOfTheDayTs = getTimestampAtStartOfDay(getCurrentUnixTimestamp());
  const dailyStartTimestamp = startOfTheDayTs - 30 * secondsInDay;

  const [all24hVolumes, monthlyVolumesByBridge] = await Promise.all([
    getAllLast24HVolumes(),
    getDailyBridgeVolumesByBridge(dailyStartTimestamp, startOfTheDayTs),
  ]);

  const response = bridgeNetworks
    .map((bridgeNetwork) => {
      const { id, bridgeDbName, url, displayName, iconLink, chains, destinationChain, slug, defillamaId } =
        bridgeNetwork;

      const last24hVolume = all24hVolumes[bridgeDbName] ?? 0;
      const lastMonthDailyVolume = monthlyVolumesByBridge[bridgeDbName] ?? [];

      let lastDailyVolume = 0;
      let dayBeforeLastVolume = 0;
      let weeklyVolume = 0;
      let monthlyVolume = 0;

      if (lastMonthDailyVolume?.length) {
        const lastRecord = lastMonthDailyVolume[lastMonthDailyVolume.length - 1];
        const lastDeposit = Number.isFinite(lastRecord.depositUSD) ? lastRecord.depositUSD : 0;
        const lastWithdraw = Number.isFinite(lastRecord.withdrawUSD) ? lastRecord.withdrawUSD : 0;
        lastDailyVolume = (lastDeposit + lastWithdraw) / 2;

        const prevRecord = lastMonthDailyVolume[lastMonthDailyVolume.length - 2];
        if (prevRecord && Object.keys(prevRecord).length > 0) {
          const prevDeposit = Number.isFinite(prevRecord.depositUSD) ? prevRecord.depositUSD : 0;
          const prevWithdraw = Number.isFinite(prevRecord.withdrawUSD) ? prevRecord.withdrawUSD : 0;
          dayBeforeLastVolume = (prevDeposit + prevWithdraw) / 2;
        }

        lastMonthDailyVolume.forEach((entry: any, i: number) => {
          const depositUSD = Number.isFinite(entry.depositUSD) ? entry.depositUSD : 0;
          const withdrawUSD = Number.isFinite(entry.withdrawUSD) ? entry.withdrawUSD : 0;
          const volume = (depositUSD + withdrawUSD) / 2;
          monthlyVolume += volume;
          if (i > lastMonthDailyVolume.length - 8) {
            weeklyVolume += volume;
          }
        });
      }

      const normalizedChains = (chains || []).map((c) => getChainDisplayName(normalizeChain(c), true));
      const destinationChainDisplay = destinationChain
        ? getChainDisplayName(normalizeChain(destinationChain), true)
        : "false";

      return {
        id,
        defillamaId,
        name: bridgeDbName,
        displayName,
        icon: iconLink,
        volumePrevDay: last24hVolume,
        volumePrev2Day: dayBeforeLastVolume,
        lastHourlyVolume: 0,
        last24hVolume,
        lastDailyVolume: lastDailyVolume,
        dayBeforeLastVolume,
        weeklyVolume,
        monthlyVolume,
        chains: normalizedChains,
        destinationChain: destinationChainDisplay,
        url,
        slug,
      };
    })
    .filter((b) => b !== null)
    .sort((a, b) => b.lastDailyVolume - a.lastDailyVolume);

  return response;
};

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const includeChains = event.queryStringParameters?.includeChains === "true";
  const promises = [getBridges()];
  if (includeChains) {
    promises.push(craftBridgeChainsResponse() as Promise<any>);
  }
  const [bridges, chainData] = await Promise.all(promises);
  let response: any = { bridges };
  if (includeChains) {
    response.chains = chainData;
  }
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);
