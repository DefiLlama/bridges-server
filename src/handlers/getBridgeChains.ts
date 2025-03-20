import { IResponse, successResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getDailyBridgeVolume } from "../utils/bridgeVolume";
import { getChainDisplayName, chainCoingeckoIds } from "../utils/normalizeChain";
import { getCurrentUnixTimestamp, secondsInDay } from "../utils/date";
import bridgeNetworks from "../data/bridgeNetworkData";
import { normalizeChain } from "../utils/normalizeChain";

export async function craftBridgeChainsResponse() {
  const chainsMap = new Map<string, string>();
  const currentTimestamp = getCurrentUnixTimestamp();

  await Promise.all(
    bridgeNetworks.map(async (bridgeNetwork) => {
      const { chains, destinationChain } = bridgeNetwork;

      if (destinationChain) {
        const normalizedName = normalizeChain(destinationChain);
        chainsMap.set(normalizedName, destinationChain);
      }

      chains.forEach((chain) => {
        const normalizedName = normalizeChain(chain);
        chainsMap.set(normalizedName, chain);
      });
    })
  );

  const chainPromises = Promise.all(
    Array.from(chainsMap.keys()).map(async (normalizedChain) => {
      const chainName = getChainDisplayName(normalizedChain, true);
      if (chainCoingeckoIds[chainName] === undefined) {
        return;
      }

      const lastWeekDailyBridgeVolume = await getDailyBridgeVolume(
        currentTimestamp - 7 * secondsInDay,
        currentTimestamp,
        normalizedChain
      );

      let volumePrevDay = 0;
      if (lastWeekDailyBridgeVolume.length > 1) {
        const lastDailyBridgeVolume = lastWeekDailyBridgeVolume[lastWeekDailyBridgeVolume.length - 1];
        volumePrevDay = lastDailyBridgeVolume?.depositUSD + lastDailyBridgeVolume?.withdrawUSD;
      }

      return {
        gecko_id: chainCoingeckoIds[chainName]?.geckoId ?? null,
        volumePrevDay: volumePrevDay,
        tokenSymbol: chainCoingeckoIds[chainName]?.symbol ?? null,
        name: chainName,
      };
    })
  );

  const response = (await chainPromises).filter((chain) => chain);

  return response;
}

const handler = async (_event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const chainData = await craftBridgeChainsResponse();
  return successResponse(chainData, 10 * 60); // 10 mins cache
};

export default wrap(handler);
