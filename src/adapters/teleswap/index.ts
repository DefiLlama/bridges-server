import { ethers } from "ethers";
import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { EventData } from "../../utils/types";

const API_BASE_URL = "https://api.teleportdao.xyz/api/v2/teleswap/requests";

export interface TeleswapRequest {
  id: string;
  sourceTransactionId: number;
  targetEventId: string;
  fromNetworkId: string;
  fromAddress: string;
  inputTokenContractId: string;
  inputTokenAmount: string;
  inputTokenAmountUSD: string;
  toNetworkId: string;
  outputTokenContractId: string;
  outputTokenAmount: string;
  outputTokenAmountUSD: string;
  toAddress: string;
  lockerId: string;
  networkFee: string;
  lockerFee: string;
  protocolFee: string;
  thirdPartyFee: string;
  bridgeFee: string;
  totalFee: string;
  thirdPartyId: number;
  crossChainId?: string;
  type: "Wrap" | "Unwrap" | "WrapAndSwap" | "SwapAndUnwrap";
  tokenType: "BTC" | "Rune" | "BRC20";
  status: string;
  createdAt: string;
  updatedAt: string;
  fromNetwork: FromNetwork;
  toNetwork: ToNetwork;
  sourceTransaction: SourceTransaction;
  targetEvent: TargetEvent;
  inputToken: InputToken;
  outputToken: OutputToken;
  state: string;
}

export interface FromNetwork {
  id: string;
  name: string;
  title: string;
  lastBlock: string;
  chainId: number;
  status: string;
}

export interface ToNetwork {
  id: string;
  name: string;
  title: string;
  lastBlock: string;
  chainId: number;
  status: string;
}

export interface SourceTransaction {
  txId: string;
  blockNumber: string;
}

export interface TargetEvent {
  targetTransaction: TargetTransaction;
  networkId: string;
  name: string;
}

export interface TargetTransaction {
  txId: string;
  from: string;
  blockNumber: string;
}

export interface InputToken {
  id: string;
  contractAddress: string;
  name: string;
  symbol: string;
  type: string;
  coinId: string;
  networkId: string;
  decimal: number;
  status: string;
}

export interface OutputToken {
  id: string;
  contractAddress: string;
  name: string;
  symbol: string;
  type: string;
  coinId: string;
  networkId: string;
  decimal: number;
  status: string;
}

interface ApiResponse {
  data: TeleswapRequest[];
  total: number;
}

export const getEvents = async (fromTimestamp: number, toTimestamp: number): Promise<EventData[]> => {
  console.log(`Fetching Teleswap data`);
  const fromDate = new Date(fromTimestamp * 1000).toISOString();
  const toDate = new Date(toTimestamp * 1000).toISOString();

  console.log(`Fetching Teleswap data from ${fromDate} to ${toDate}`);

  const allEvents: TeleswapRequest[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  try {
    // Fetch all events using pagination
    while (hasMore) {
      const apiUrl = `${API_BASE_URL}?createdAtAfter=${fromDate}&createdAtBefore=${toDate}&filter=done&limit=${limit}&offset=${offset}&order=desc`;

      console.log(`Fetching page ${Math.floor(offset / limit) + 1} with offset ${offset}`);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        console.error(`Error fetching data from Teleswap API: ${response.statusText}`);
        break;
      }

      const apiResponse: ApiResponse = await response.json();
      const events = apiResponse.data;

      if (events.length === 0) {
        hasMore = false;
        break;
      }

      allEvents.push(...events);
      console.log(`Fetched ${events.length} events, total so far: ${allEvents.length}`);

      // If we got less than the limit, we've reached the end
      if (events.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`Total events found: ${allEvents.length}`);

    const txData: EventData[] = allEvents
      .filter((event) => event?.targetEvent?.targetTransaction)
      .map((event) => {
        const isWrap = event.type === "Wrap" || event.type === "WrapAndSwap";

        // Parse amount
        let amount: number | undefined = undefined;
        try {
          amount = parseFloat(isWrap ? event.outputTokenAmount : event.inputTokenAmount);
          if (isNaN(amount)) {
            amount = undefined;
          }
        } catch {
          amount = undefined;
        }

        let amountUSD: number | undefined = undefined;
        try {
          amountUSD = parseFloat(event.inputTokenAmountUSD);
          if (isNaN(amountUSD)) {
            amountUSD = undefined;
          }
        } catch {
          amountUSD = undefined;
        }

        const chain = isWrap ? event.toNetwork.name.toLowerCase() : event.fromNetwork.name.toLowerCase();

        const req: EventData = {
          blockNumber: parseInt(event.targetEvent.targetTransaction.blockNumber),
          chain: chain,
          from: event.fromAddress,
          to: event.toAddress,
          token: isWrap ? event.outputToken.contractAddress : event.inputToken.contractAddress,
          // amount: amount as unknown as ethers.BigNumber,
          // isUSDVolume: false,
          amount: amountUSD as unknown as ethers.BigNumber,
          isUSDVolume: true,
          isDeposit: isWrap ? true : false,
          txHash: event.targetEvent.targetTransaction.txId,
          timestamp: new Date(event.createdAt).getTime() / 1000,
        };

        return req;
      });

    return txData;
  } catch (error) {
    console.error(`Error processing Teleswap API response:`, error);
    return [] as EventData[];
  }
};

export async function build(): Promise<BridgeAdapter> {
  const adapter: BridgeAdapter = {};
  const chains = ["polygon", "bsc", "ethereum", "arbitrum", "base", "optimism", "bob", "bsquared"];

  for (const chain of chains) {
    adapter[chain] = getEvents;
  }

  return adapter;
}

export default { isAsync: true, build };
