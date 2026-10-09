import { IResponse, successResponse, errorResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getDailyBridgeVolume } from "../utils/bridgeVolume";
import { importBridgeNetwork } from "../data/importBridgeNetwork";
import { normalizeChain } from "../utils/normalizeChain";
import { DEFAULT_TTL } from "../utils/cache";
import { parseBridgeId } from "../utils/bridgeId";

const getBridgeVolume = async (chain?: string, bridgeNetworkId?: string) => {
  if (!chain) {
    return errorResponse({
      message: "Must include a chain or 'all' as path parameter.",
    });
  }
  const queryChain = chain === "all" ? undefined : normalizeChain(chain);

  const queryId = bridgeNetworkId ? parseInt(bridgeNetworkId) : undefined;
  if (bridgeNetworkId && queryId) {
    try {
      const bridgeNetwork = importBridgeNetwork(undefined, queryId);
      if (!bridgeNetwork) {
        throw new Error("No bridge network found.");
      }
    } catch (e) {
      return errorResponse({
        message: "Invalid bridgeNetworkId entered.",
      });
    }
  }
  const dailyVolumes = await getDailyBridgeVolume(undefined, undefined, queryChain, queryId);

  return dailyVolumes;
};

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const chain = event.pathParameters?.chain?.toLowerCase().replace(/%20/g, " ");
  const bridgeNetworkId = event.queryStringParameters?.id;
  if (bridgeNetworkId !== undefined && parseBridgeId(bridgeNetworkId) === undefined) {
    return errorResponse({ message: "Invalid bridge ID entered." });
  }

  const response = await getBridgeVolume(chain, bridgeNetworkId);
  if ("statusCode" in response) return response;
  return successResponse(response, DEFAULT_TTL);
};

export default wrap(handler);
