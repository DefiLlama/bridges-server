import { IResponse, successResponse, errorResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getCurrentUnixTimestamp, getTimestampAtStartOfDay } from "../utils/date";
import { queryAggregatedTokenStatsTop30 } from "../utils/wrappa/postgres/query";
import { getLlamaPrices } from "../utils/prices";
import { importBridgeNetwork } from "../data/importBridgeNetwork";
import { normalizeChain, normlizeTokenSymbol } from "../utils/normalizeChain";
import { getCache } from "../utils/cache";

type TokenRecord = {
  [token: string]: {
    amount: string;
    usdValue: number;
    symbol?: string;
    decimals?: number;
  };
};

type AddressRecord = {
  [address: string]: {
    usdValue: number;
    txs: number;
  };
};

type StatsRow = {
  kind: "dt" | "wt" | "da" | "wa";
  key: string;
  amount: string | null;
  usd_value: string;
  txs: number | null;
};

const isValidPriceId = (id?: string) => {
  if (!id) return false;
  if (id.includes("\\") || id.includes("/") || id.includes(" ")) return false;
  const parts = id.split(":");
  if (parts.length !== 2) return false;
  if (!parts[0] || !parts[1]) return false;
  if (parts[1] === "\\N" || parts[1] === "\\n" || parts[1].toLowerCase() === "null" || parts[1].toLowerCase() === "undefined") return false;
  return true;
};

const getBridgeStatsOnDay = async (timestamp: string = "0", chain: string, bridgeId?: string) => {
  let bridgeDbName = undefined as any;
  const queryChain = chain === "" ? "" : normalizeChain(chain);
  if (bridgeId) {
    try {
      const bridgeNetwork = importBridgeNetwork(undefined, parseInt(bridgeId));
      if (!bridgeNetwork) {
        throw new Error("No bridge network found.");
      }
      ({ bridgeDbName } = bridgeNetwork);
    } catch (e) {
      return errorResponse({ message: "Invalid bridgeId entered." });
    }
  }

  const queryTimestamp = getTimestampAtStartOfDay(parseInt(timestamp));
  const maxEndTimestamp = queryTimestamp + 86400;
  const currentTimestamp = getCurrentUnixTimestamp();
  const endTimestamp = Math.max(queryTimestamp, Math.min(maxEndTimestamp, currentTimestamp));

  const rows = (await queryAggregatedTokenStatsTop30(
    queryTimestamp,
    endTimestamp,
    queryChain,
    bridgeDbName
  )) as StatsRow[];

  const dt = rows.filter((r) => r.kind === "dt");
  const wt = rows.filter((r) => r.kind === "wt");
  const da = rows.filter((r) => r.kind === "da");
  const wa = rows.filter((r) => r.kind === "wa");

  const tokenIds = new Set<string>();
  for (const r of dt) {
    const id = r.key?.toLowerCase();
    if (isValidPriceId(id)) tokenIds.add(id);
  }
  for (const r of wt) {
    const id = r.key?.toLowerCase();
    if (isValidPriceId(id)) tokenIds.add(id);
  }

  const lzSymbols = ((await getCache("lz_token_symbols")) || {}) as Record<string, string>;
  let prices: Record<string, any> = {};
  try {
    prices = (await Promise.race([
      getLlamaPrices(Array.from(tokenIds)),
      new Promise((resolve) => setTimeout(() => resolve({}), 5000)),
    ])) as Record<string, any>;
  } catch {
    prices = {};
  }

  const buildTokenRecord = (xs: typeof dt): TokenRecord => {
    const out: TokenRecord = {};
    for (const r of xs) {
      const token = r.key;
      const lower = token?.toLowerCase?.() ?? token;
      const priceEntry = prices?.[lower] ?? prices?.[token];
      const addrOnly = lower.includes(":") ? lower.split(":")[1] : lower;
      const fallbackSymbol = lzSymbols?.[addrOnly] ?? lzSymbols?.[lower] ?? "";
      const symbol = priceEntry?.symbol ?? fallbackSymbol ?? "";
      const decimalsVal = priceEntry?.decimals;
      out[token] = {
        amount: r.amount ?? "0",
        usdValue: Number(r.usd_value),
        symbol: normlizeTokenSymbol(symbol),
        decimals: typeof decimalsVal === "string" ? Number(decimalsVal) : decimalsVal ?? 0,
      };
    }
    return out;
  };

  const buildAddressRecord = (xs: typeof da): AddressRecord => {
    const out: AddressRecord = {};
    for (const r of xs) {
      out[r.key] = {
        usdValue: Number(r.usd_value),
        txs: r.txs ?? 0,
      };
    }
    return out;
  };

  return {
    date: queryTimestamp,
    totalTokensDeposited: buildTokenRecord(dt),
    totalTokensWithdrawn: buildTokenRecord(wt),
    totalAddressDeposited: buildAddressRecord(da),
    totalAddressWithdrawn: buildAddressRecord(wa),
  };
};

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const timestamp = event.pathParameters?.timestamp;
  if (Number(timestamp) % 3600 !== 0) {
    return errorResponse({
      message: "timestamp must be divible by 3600",
    });
  }
  const chain = event.pathParameters?.chain?.toLowerCase() ?? "";
  const bridgeNetworkId = event.queryStringParameters?.id;
  const response = await getBridgeStatsOnDay(timestamp, chain, bridgeNetworkId);
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);
