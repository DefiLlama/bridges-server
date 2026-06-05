import { IResponse, successResponse, errorResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import bridgeNetworks from "../data/bridgeNetworkData";
import { normalizeChain, getChainDisplayName } from "../utils/normalizeChain";

const searchBridges = (query?: string, chain?: string) => {
  const q = query?.toLowerCase().trim();
  const normalizedChainFilter = chain ? normalizeChain(chain) : undefined;

  const results = bridgeNetworks.filter((bridge) => {
    const matchesQuery = q
      ? bridge.displayName.toLowerCase().includes(q) || bridge.bridgeDbName.toLowerCase().includes(q)
      : true;

    const matchesChain = normalizedChainFilter
      ? bridge.chains.some((c) => normalizeChain(c) === normalizedChainFilter)
      : true;

    return matchesQuery && matchesChain;
  });

  return results.map((bridge) => ({
    id: bridge.id,
    name: bridge.bridgeDbName,
    displayName: bridge.displayName,
    icon: bridge.iconLink,
    url: bridge.url,
    slug: bridge.slug,
    chains: bridge.chains.map((c) => getChainDisplayName(normalizeChain(c), true)),
  }));
};

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const query = event.queryStringParameters?.q;
  const chain = event.queryStringParameters?.chain;

  if (!query && !chain) {
    return errorResponse({ message: "At least one of q or chain query parameters is required." });
  }

  const results = searchBridges(query, chain);
  return successResponse(results, 10 * 60); // 10 min cache
};

export default wrap(handler);
