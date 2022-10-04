import {
  IResponse,
  successResponse,
  errorResponse,
} from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getDailyBridgeVolume } from "../utils/bridgeVolume";
import bridgeNetworkData from "../data/bridgeNetworkData";

const getBridgeVolume = async (chain?: string, bridgeNetworkId?: string) => {
  const queryChain = chain === "all" ? undefined : chain;
  const queryId = bridgeNetworkId ? parseInt(bridgeNetworkId) : undefined
  if (bridgeNetworkId && queryId) {
    try {
      const bridgeNetwork = bridgeNetworkData[queryId - 1];
      if (!bridgeNetwork) {
        throw new Error("No bridge network found.");
      }
    } catch (e) {
      return errorResponse({
        message: "Invalid bridgeNetworkId entered.",
      });
    }
  }
  const response = await getDailyBridgeVolume(undefined, undefined, queryChain, queryId);

  return response;
};

const handler = async (
  event: AWSLambda.APIGatewayEvent
): Promise<IResponse> => {
  const chain = event.pathParameters?.chain?.toLowerCase();
  const bridgeNetworkId = event.queryStringParameters?.id;
  const response = await getBridgeVolume(chain, bridgeNetworkId);
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);
