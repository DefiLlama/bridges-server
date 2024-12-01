import { IResponse, successResponse, errorResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getDailyBridgeVolume, getHourlyBridgeVolume } from "../utils/bridgeVolume";
import { importBridgeNetwork } from "../data/importBridgeNetwork";
import { secondsInDay, getCurrentUnixTimestamp } from "../utils/date";
import { normalizeChain } from "../utils/normalizeChain";
import { DEFAULT_TTL } from "../utils/cache";

const getBridgeVolume = async (chain?: string, bridgeNetworkId?: string) => {
  if (!chain) {
    return errorResponse({
      message: "Must include a chain or 'all' as path parameter.",
    });
  }
  let bridgeNetwork;
  if (bridgeNetworkId) {
    bridgeNetwork = importBridgeNetwork(undefined, parseInt(bridgeNetworkId));
  }
  const destinationChain = bridgeNetwork?.destinationChain;
  if (destinationChain && chain === destinationChain?.toLowerCase()) {
    chain = "all";
  }
  const queryChain = chain === "all" ? undefined : normalizeChain(chain);

  const queryId = bridgeNetworkId ? parseInt(bridgeNetworkId) : undefined;
  if (bridgeNetworkId && queryId) {
    try {
      const bridgeNetwork = importBridgeNetwork(undefined, queryId);
      if (!bridgeNetwork) {
        if (!bridgeNetwork) {
          throw new Error("No bridge network found.");
        }
      }
    } catch (e) {
      return errorResponse({
        message: "Invalid bridgeNetworkId entered.",
      });
    }
  }
  const dailyVolumes = await getDailyBridgeVolume(undefined, undefined, queryChain, queryId);

  let currentDayEntry = null as unknown;
  const lastDailyTs = parseInt(dailyVolumes?.[dailyVolumes.length - 1]?.date);
  if (lastDailyTs) {
    const currentTimestamp = getCurrentUnixTimestamp();
    const hourlyStartTimestamp = currentTimestamp - secondsInDay;
    const lastDayHourlyVolume = await getHourlyBridgeVolume(
      hourlyStartTimestamp,
      currentTimestamp,
      queryChain,
      queryId
    );
    if (lastDayHourlyVolume?.length) {
      let currentDayDepositUSD = 0;
      let currentDayWithdrawUSD = 0;
      let currentDayDepositTxs = 0;
      let currentDayWithdrawTxs = 0;
      lastDayHourlyVolume.map((entry) => {
        const { date, depositTxs, withdrawTxs, depositUSD, withdrawUSD } = entry;
        // lastDailyTs is timestamp at 00:00 UTC of *previous* day
        if (parseInt(date) > lastDailyTs + secondsInDay) {
          currentDayDepositUSD += depositUSD;
          currentDayWithdrawUSD += withdrawUSD;
          currentDayDepositTxs += depositTxs;
          currentDayWithdrawTxs += withdrawTxs;
        }
      });
      currentDayEntry = {
        date: (lastDailyTs + secondsInDay).toString(),
        depositUSD: currentDayDepositUSD,
        withdrawUSD: currentDayWithdrawUSD,
        depositTxs: currentDayDepositTxs,
        withdrawTxs: currentDayWithdrawTxs,
      };
    } else {
      currentDayEntry = {
        date: (lastDailyTs + secondsInDay).toString(),
        depositUSD: 0,
        withdrawUSD: 0,
        depositTxs: 0,
        withdrawTxs: 0,
      };
    }
  }

  let response = dailyVolumes;
  if (currentDayEntry) {
    response.push(currentDayEntry);
  }

  return response;
};

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const chain = event.pathParameters?.chain?.toLowerCase().replace(/%20/g, " ");
  const bridgeNetworkId = event.queryStringParameters?.id;

  const response = await getBridgeVolume(chain, bridgeNetworkId);
  return successResponse(response, DEFAULT_TTL);
};

export default wrap(handler);
