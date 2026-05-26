import { IResponse, successResponse, errorResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getNetflows } from "../utils/wrappa/postgres/query";
import { normalizeChain, getChainDisplayName } from "../utils/normalizeChain";

const MAX_CHAINS = 10;

type Period = "day" | "week" | "month";

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const period = event.queryStringParameters?.period?.toLowerCase() as Period;
  const chainsParam = event.queryStringParameters?.chains;

  if (!period || !["day", "week", "month"].includes(period)) {
    return errorResponse({ message: "period must be one of: day, week, month" });
  }

  if (!chainsParam) {
    return errorResponse({ message: "chains parameter is required (comma-separated list)" });
  }

  const requestedChains = chainsParam
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, MAX_CHAINS);

  if (requestedChains.length === 0) {
    return errorResponse({ message: "at least one chain is required" });
  }

  const normalizedRequested = requestedChains.map((c) => normalizeChain(c));

  const raw = await getNetflows(period);

  const merged = new Map<string, { chain: string; net_flow: number; deposited_usd: number; withdrawn_usd: number }>();
  for (const row of raw) {
    const name = getChainDisplayName(normalizeChain(row.chain), true);
    const normalized = normalizeChain(row.chain);
    const prev = merged.get(normalized);
    const net = parseFloat(row.net_flow ?? "0");
    const dep = parseFloat(row.deposited_usd ?? "0");
    const wdr = parseFloat(row.withdrawn_usd ?? "0");
    if (!prev) {
      merged.set(normalized, { chain: name, net_flow: net, deposited_usd: dep, withdrawn_usd: wdr });
    } else {
      prev.net_flow += net;
      prev.deposited_usd += dep;
      prev.withdrawn_usd += wdr;
    }
  }

  const missing: string[] = [];
  const results = normalizedRequested.map((normalized, i) => {
    const data = merged.get(normalized);
    if (!data) {
      missing.push(requestedChains[i]);
      return { chain: getChainDisplayName(normalized, true), net_flow: null, deposited_usd: null, withdrawn_usd: null };
    }
    return data;
  });

  return successResponse(
    {
      period,
      chains: results,
      ...(missing.length > 0 ? { missing } : {}),
    },
    10 * 60
  );
};

export default wrap(handler);
