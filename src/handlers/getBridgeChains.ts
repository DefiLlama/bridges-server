import { IResponse, successResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getDailyBridgeVolume } from "../utils/bridgeVolume";
import { getChainDisplayName, chainCoingeckoIds } from "../utils/normalizeChain";
import { getCurrentUnixTimestamp, secondsInDay } from "../utils/date";
import bridgeNetworks from "../data/bridgeNetworkData";
import { normalizeChain } from "../utils/normalizeChain";
import { sql } from "../utils/db";

export async function craftBridgeChainsResponse() {
  const chainsSet = new Set<string>();
  const currentTimestamp = getCurrentUnixTimestamp();
  await Promise.all(
    bridgeNetworks.map(async (bridgeNetwork) => {
      const { chains, destinationChain } = bridgeNetwork;
      if (destinationChain) chainsSet.add(destinationChain);
      chains.map((chain) => chainsSet.add(chain));
    })
  );

  const chainPromises = Promise.all(
    Array.from(chainsSet).map(async (chain) => {
      const chainName = getChainDisplayName(chain, true);
      if (chainCoingeckoIds[chainName] === undefined) {
        return;
      }

      const lastWeekDailyBridgeVolume = await getDailyBridgeVolume(
        currentTimestamp - 7 * secondsInDay,
        currentTimestamp,
        normalizeChain(chain)
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
  try {
    await sql.end();
  } catch (e) {
    console.error(e);
  }
  return successResponse(chainData, 10 * 60); // 10 mins cache
};

export default wrap(handler);
