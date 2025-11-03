import { IResponse, successResponse, errorResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getNetflows } from "../utils/wrappa/postgres/query";
import { normalizeChain, getChainDisplayName } from "../utils/normalizeChain";

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const period = event.pathParameters?.period?.toLowerCase() as "day" | "week" | "month";

  if (!period || !["day", "week", "month"].includes(period)) {
    return errorResponse({
      message: "Period must be one of: day, week, month",
    });
  }

  const raw = await getNetflows(period);
  const merged = new Map<string, { chain: string; net_flow: string; deposited_usd: string; withdrawn_usd: string }>();
  for (const row of raw) {
    const name = getChainDisplayName(normalizeChain(row.chain), true);
    const prev = merged.get(name);
    const net = parseFloat(row.net_flow ?? "0");
    const dep = parseFloat(row.deposited_usd ?? "0");
    const wdr = parseFloat(row.withdrawn_usd ?? "0");
    if (!prev) {
      merged.set(name, {
        chain: name,
        net_flow: net.toString(),
        deposited_usd: dep.toString(),
        withdrawn_usd: wdr.toString(),
      });
    } else {
      const pnet = parseFloat(prev.net_flow ?? "0");
      const pdep = parseFloat(prev.deposited_usd ?? "0");
      const pwdr = parseFloat(prev.withdrawn_usd ?? "0");
      merged.set(name, {
        chain: name,
        net_flow: (pnet + net).toString(),
        deposited_usd: (pdep + dep).toString(),
        withdrawn_usd: (pwdr + wdr).toString(),
      });
    }
  }
  const response = Array.from(merged.values());
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);
