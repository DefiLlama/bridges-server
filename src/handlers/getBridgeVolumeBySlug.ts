import { IResponse, successResponse, errorResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getDailyBridgeVolume } from "../utils/bridgeVolume";
import { importBridgeNetwork } from "../data/importBridgeNetwork";
import { DEFAULT_TTL } from "../utils/cache";

const getBridgeVolumeBySlug = async (slug?: string) => {
  if (!slug) {
    return errorResponse({
      message: "Must include a slug as path parameter.",
    });
  }

  const bridgeNetwork = importBridgeNetwork(undefined, undefined, slug);
  
  if (!bridgeNetwork) {
    return errorResponse({
      message: `No bridge network found with slug: ${slug}`,
    });
  }

  const dailyVolumes = await getDailyBridgeVolume(undefined, undefined, undefined, bridgeNetwork.id);

  return {
    bridge: {
      id: bridgeNetwork.id,
      displayName: bridgeNetwork.displayName,
      slug: bridgeNetwork.slug,
      bridgeDbName: bridgeNetwork.bridgeDbName,
    },
    dailyVolumes,
  };
};

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const slug = event.pathParameters?.slug;

  const response = await getBridgeVolumeBySlug(slug);
  return successResponse(response, DEFAULT_TTL);
};

export default wrap(handler);