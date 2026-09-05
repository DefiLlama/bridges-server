import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { throwIfAborted } from "../../utils/errors";

export type CCIPEvent = {
  chain: string;
  tx_hash: string;
  ts: number;
  tx_from: string;
  tx_to: string;
  token: string;
  amount: string;
  is_deposit: boolean;
  is_usd_volume: boolean;
};

export const CCIP_LOOKBACK_DAYS = 10;
const DAY_MS = 86400000;
const API_BASE_URL = "https://dsa-metrics-api-gw-8p4u7g34.nw.gateway.dev/v1/ccip_transactions";
const chainAliases: Record<string, string> = {
  etlk: "etherlink",
  op_bnb: "opbnb",
};

export function ccipDayStart(date: string): number {
  const start = Date.parse(`${date}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(start) ||
    new Date(start).toISOString().slice(0, 10) !== date
  ) {
    throw new Error(`Invalid CCIP date: ${date}`);
  }
  return start;
}

export function ccipDateRange(startDate: string, endDate: string): string[] {
  const start = ccipDayStart(startDate);
  const end = ccipDayStart(endDate);
  if (end < start || end >= Math.floor(Date.now() / DAY_MS) * DAY_MS) {
    throw new Error("CCIP range must contain completed UTC days in ascending order.");
  }
  const dates: string[] = [];
  for (let ts = start; ts <= end; ts += DAY_MS) dates.push(new Date(ts).toISOString().slice(0, 10));
  return dates;
}

// The endpoint supplies one complete UTC-day snapshot, without pagination.
// Reject unrecognized envelopes/rows instead of treating them as missing transfers.
export function parseCCIPSnapshot(data: unknown, date: string): CCIPEvent[] {
  const start = ccipDayStart(date);
  if (
    !data ||
    typeof data !== "object" ||
    Object.keys(data).some((key) => key !== "transactions") ||
    !Array.isArray((data as any).transactions)
  ) {
    throw new Error(`Invalid or partial CCIP snapshot for ${date}`);
  }
  const events: CCIPEvent[] = [];
  for (const tx of (data as any).transactions) {
    if (!tx || typeof tx !== "object") throw new Error(`Invalid CCIP transaction for ${date}`);
    for (const field of [
      "messageID",
      "sourceChain",
      "destChain",
      "sourceTxHash",
      "destTxHash",
      "tokenTransferFrom",
      "tokenTransferTo",
      "tokenAddressSource",
      "tokenAddressDest",
    ]) {
      if (typeof tx[field] !== "string" || !tx[field].trim()) throw new Error(`Missing CCIP ${field} for ${date}`);
    }
    if (
      !Number.isInteger(tx.blockTimestamp) ||
      tx.blockTimestamp * 1000 < start ||
      tx.blockTimestamp * 1000 >= start + DAY_MS ||
      typeof tx.tokenAmountUsd !== "number" ||
      !Number.isFinite(tx.tokenAmountUsd) ||
      tx.tokenAmountUsd < 0
    ) {
      throw new Error(`Invalid CCIP timestamp or USD amount for ${tx.messageID}`);
    }
    for (const isDeposit of [false, true]) {
      const rawChain = isDeposit ? tx.destChain : tx.sourceChain;
      const chain = chainAliases[rawChain] ?? rawChain;
      if (!chains.includes(chain)) throw new Error(`Unknown CCIP chain ${rawChain} for ${date}`);
      events.push({
        chain,
        tx_hash: isDeposit ? tx.destTxHash : tx.sourceTxHash,
        ts: tx.blockTimestamp * 1000,
        tx_from: tx.tokenTransferFrom,
        tx_to: tx.tokenTransferTo,
        token: isDeposit ? tx.tokenAddressDest : tx.tokenAddressSource,
        // tokenAmount mixes human units and base units across integrations. Use the
        // provider's USD valuation, including zero, without guessing its decimals.
        amount: String(tx.tokenAmountUsd),
        is_deposit: isDeposit,
        is_usd_volume: true,
      });
    }
  }
  return events;
}

export async function fetchEventsForDate(date: string, signal?: AbortSignal): Promise<CCIPEvent[]> {
  ccipDayStart(date);
  throwIfAborted(signal);
  const apiKey = process.env.CCIP_API_KEY;
  if (!apiKey) throw new Error("CCIP_API_KEY is required");
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(abort, 60000);
  try {
    throwIfAborted(signal);
    const response = await fetch(`${API_BASE_URL}?date=${date}`, {
      headers: { "x-api-key": apiKey, Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`CCIP API returned ${response.status} for ${date}`);
    return parseCCIPSnapshot(await response.json(), date);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}

export async function fetchCCIPEvents(fromTimestamp: number, toTimestamp: number): Promise<CCIPEvent[]> {
  if (
    !Number.isFinite(fromTimestamp) ||
    !Number.isFinite(toTimestamp) ||
    fromTimestamp <= 0 ||
    toTimestamp < fromTimestamp
  ) {
    throw new Error("Invalid CCIP timestamp range");
  }
  const events: CCIPEvent[] = [];
  for (let ts = Math.floor(fromTimestamp / 86400) * DAY_MS; ts <= toTimestamp * 1000; ts += DAY_MS) {
    events.push(...(await fetchEventsForDate(new Date(ts).toISOString().slice(0, 10))));
  }
  return events.filter((event) => event.ts >= fromTimestamp * 1000 && event.ts <= toTimestamp * 1000);
}

export const chains = [
  "celo",
  "ethereum",
  "bsc",
  "bitlayer",
  "base",
  "fhe",
  "soneium",
  "astar",
  "berachain",
  "polygon",
  "avalanche",
  "arbitrum",
  "optimism",
  "ronin",
  "linea",
  "aptos",
  "shibarium",
  "sonic",
  "wemix",
  "bsquared",
  "xdai",
  "bob",
  "hyperliquid",
  "unichain",
  "katana",
  "mantle",
  "world chain",
  "plume",
  "zksync era",
  "metis",
  "sei",
  "solana",
  "plasma",
  "ink",
  "xdc",
  "tac",
  "bittensor",
  "hedera",
  "monad",
  "0g",
  "morph",
  "ab chain",
  "abstract",
  "apechain",
  "blast",
  "botanix",
  "core",
  "corn",
  "cronos",
  "cronos zkevm",
  "etherlink",
  "everclear",
  "fraxtal",
  "hsk",
  "hemi",
  "henesys",
  "jovay",
  "kaia",
  "lens",
  "lisk",
  "memento",
  "merlin",
  "metal",
  "mind network",
  "mint",
  "mode",
  "opbnb",
  "polygon zkevm",
  "rootstock",
  "scroll",
  "stable",
  "superseed",
  "taiko",
  "x layer",
  "zircuit",
  "zora",
  "pharos",
  "robinhood",
  "adi",
  "tempo",
  "neox",
  "megaeth",
];

export const adapter: BridgeAdapter = Object.fromEntries(chains.map((chain) => [chain, fetchCCIPEvents as any]));
export default adapter;
