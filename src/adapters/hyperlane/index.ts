import { setProvider, getProvider } from "@defillama/sdk";
import { LlamaProvider } from "@defillama/sdk/build/util/LlamaProvider";
import { Chain } from "@defillama/sdk/build/general";
import * as yaml from "js-yaml";

import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { NonRetryableError } from "../../utils/errors";

const baseUri = "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main";
const kyveApiBaseUri = "https://data.services.hyperlane.xyz";

export async function setUp(): Promise<string[]> {
  const chains = [];

  const metadata = (await fetch(`${baseUri}/chains/metadata.yaml`)
    .then((r) => r.text())
    .then((t) => yaml.load(t))) as Record<string, any>;

  for (const [name, chainData] of Object.entries(metadata)) {
    if (chainData.isTestnet) continue;

    chains.push(name);
  }

  return chains;
}

export interface KyveEvent {
  blockNumber: number;
  chain: string;
  from: string;
  isDeposit: boolean;
  timestamp: number;
  to: string;
  token: string;
  txHash: string;
  usdAmount: string;
}

type HyperlaneFetch = (
  input: string,
  init?: { headers?: Record<string, string> }
) => Promise<{
  ok: boolean;
  status: number;
  statusText: string;
  text(): Promise<string>;
  json(): Promise<unknown>;
}>;

export const fetchHyperlaneEvents = async (
  fromTimestamp: number,
  toTimestamp: number,
  fetchImpl: HyperlaneFetch = fetch as HyperlaneFetch
): Promise<KyveEvent[]> => {
  const apiUrl = `${kyveApiBaseUri}/events?fromTimestamp=${fromTimestamp}&toTimestamp=${toTimestamp}`;
  console.log(apiUrl);
  const response = await fetchImpl(apiUrl, {
    headers: {
      Accept: "application/json",
      "User-Agent": "defillama-bridges-server/1.0",
    },
  });
  if (!response.ok) {
    const responseBody = await response.text().catch(() => "");
    const detail = responseBody.trim().slice(0, 300);
    const message = `Hyperlane events API HTTP ${response.status} ${response.statusText}${detail ? `: ${detail}` : ""}`;
    if (response.status >= 400 && response.status < 500 && response.status !== 429) {
      throw new NonRetryableError(message);
    }
    throw new Error(message);
  }

  const events = await response.json();
  if (!Array.isArray(events)) {
    throw new NonRetryableError("Hyperlane events API returned a non-array response.");
  }
  return events as KyveEvent[];
};

export const getEvents = async (fromTimestamp: number, toTimestamp: number): Promise<any[]> => {
  const events = await fetchHyperlaneEvents(fromTimestamp, toTimestamp);
  const txData: any[] = events.map((event) => {
    let usdAmount: number | undefined = undefined;
    try {
      usdAmount = parseFloat(event.usdAmount);
      if (isNaN(usdAmount)) {
        usdAmount = undefined;
      }
    } catch {
      usdAmount = undefined;
    }

    return {
      blockNumber: event.blockNumber,
      chain: event.chain,
      from: event.from,
      isDeposit: event.isDeposit,
      timestamp: event.timestamp,
      to: event.to,
      token: event.token,
      txHash: event.txHash,
      amount: usdAmount,
      isUSDVolume: true,
    };
  });

  return txData;
};

export async function build(): Promise<BridgeAdapter> {
  const adapter: BridgeAdapter = {};

  const chains = await setUp();

  for (const chain of chains) {
    adapter[chain] = getEvents;
  }

  return adapter;
}

export default { isAsync: true, build };
