import { setProvider, getProvider } from "@defillama/sdk";
import { LlamaProvider } from "@defillama/sdk/build/util/LlamaProvider";
import { Chain } from "@defillama/sdk/build/general";
import * as yaml from "js-yaml";

import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";

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

interface KyveEvent {
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

export const getEvents = async (fromTimestamp: number, toTimestamp: number): Promise<any[]> => {
  const apiUrl = `${kyveApiBaseUri}/events?fromTimestamp=${fromTimestamp}&toTimestamp=${toTimestamp}`;
  console.log(apiUrl);
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error(`Error fetching data from Kyve API: ${response.statusText}`);
      return [];
    }
    const events = (await response.json()) as KyveEvent[];

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
  } catch (error) {
    console.error(`Error processing Kyve API response:`, error);
    return [];
  }
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
