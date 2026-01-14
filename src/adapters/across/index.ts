import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { EventData } from "../../utils/types";
import { ethers } from "ethers";
import fetch from "node-fetch";
const retry = require("async-retry");

/**
 * Across Protocol Bridge Adapter
 * 
 * Uses the Across Indexer API at https://app.across.to/api/
 * 
 * For each chain, we query:
 * 1. Deposits: where originChainId = current chain (isDeposit: true)
 * 2. Withdrawals: where destinationChainId = current chain (isDeposit: false)
 *
 */

const BASE_URL = "https://app.across.to/api";
const MAX_LIMIT = 1000;
const PAGINATION_SAFETY_LIMIT = 100000;

// Chain slug to chain ID mapping
const chainIdMapping: Record<string, number> = {
  ethereum: 1,
  optimism: 10,
  bsc: 56,
  unichain: 130,
  polygon: 137,
  lens: 232,
  "zksync era": 324,
  "world chain": 480,
  redstone: 690,
  lisk: 1135,
  soneium: 1868,
  base: 8453,
  mode: 34443,
  aleph_zero: 41455,
  arbitrum: 42161,
  boba: 288,
  ink: 57073,
  linea: 59144,
  blast: 81457,
  plasma: 9745,
  scroll: 534352,
  solana: 34268394551451,
  zora: 7777777,
  monad: 143,
};

// Response type from the Across Indexer API
interface AcrossDeposit {
  depositor: string;
  recipient: string;
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  outputAmount: string;
  originChainId: number;
  destinationChainId: number | null;
  depositTxHash: string;
  depositTxnRef: string;
  fillTx: string | null;
  fillTxnRef: string | null;
  status: string;
  depositBlockNumber?: number;
  fillBlockNumber?: number;
  depositBlockTimestamp?: string;
  fillBlockTimestamp?: string;
}

enum ApiErrorType {
  NETWORK = "network",
  API_LIMIT = "api_limit",
  DATA_PARSING = "data_parsing",
  UNKNOWN = "unknown",
}

/**
 * Fetch deposits from the Across Indexer API with retry logic
 */
const fetchDeposits = async (params: Record<string, string | number>): Promise<AcrossDeposit[]> => {
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    queryParams.append(key, String(value));
  }
  
  const url = `${BASE_URL}/deposits?${queryParams.toString()}`;
  
  return retry(
    async () => {
      const response = await fetch(url, { timeout: 30000 });
      if (!response.ok) {
        const errorType =
          response.status === 429
            ? ApiErrorType.API_LIMIT
            : response.status >= 500
              ? ApiErrorType.NETWORK
              : ApiErrorType.UNKNOWN;
        const error = new Error(
          `[${errorType}] HTTP ${response.status} fetching deposits`
        );
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          (error as any).name = "NoRetryError";
        }
        throw error;
      }
      return response.json() as Promise<AcrossDeposit[]>;
    },
    {
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 10000,
      randomize: true,
      onRetry: (error: any) => {
        if (error.name === "NoRetryError") throw error;
        console.log(`[across] Retrying after error: ${error.message}`);
      },
    }
  );
};

/**
 * Fetch all deposits with pagination
 */
const fetchAllDeposits = async (params: Record<string, string | number>): Promise<AcrossDeposit[]> => {
  const allDeposits: AcrossDeposit[] = [];
  let skip = 0;
  
  while (true) {
    const deposits = await fetchDeposits({
      ...params,
      limit: MAX_LIMIT,
      skip,
    });
    
    allDeposits.push(...deposits);
    
    // If we got less than the limit, we've fetched all pages
    if (deposits.length < MAX_LIMIT) {
      break;
    }
    
    skip += MAX_LIMIT;
    
    // Safety limit to prevent infinite loops
    if (skip > PAGINATION_SAFETY_LIMIT) {
      console.warn(`[across] Hit pagination safety limit at ${skip} records`);
      break;
    }
  }
  
  return allDeposits;
};

/**
 * Convert a deposit from the API to the EventData format for a DEPOSIT event
 * (funds leaving the origin chain)
 */
const convertToDepositEvent = (deposit: AcrossDeposit): EventData | null => {
  if (!deposit.depositTxHash || !deposit.inputToken || !deposit.inputAmount) {
    return null;
  }

  // Parse the timestamp if available
  let timestamp: number | undefined;
  if (deposit.depositBlockTimestamp) {
    timestamp = new Date(deposit.depositBlockTimestamp).getTime();
  }

  return {
    blockNumber: deposit.depositBlockNumber || 0,
    txHash: deposit.depositTxHash,
    from: deposit.depositor,
    to: deposit.recipient,
    token: deposit.inputToken,
    amount: ethers.BigNumber.from(deposit.inputAmount),
    isDeposit: true,
    timestamp,
  };
};

/**
 * Convert a deposit from the API to the EventData format for a WITHDRAWAL event
 * (funds arriving on the destination chain)
 */
const convertToWithdrawalEvent = (deposit: AcrossDeposit): EventData | null => {
  // Only include filled deposits for withdrawals
  if (!deposit.fillTx || !deposit.outputToken || !deposit.outputAmount) {
    return null;
  }

  // Parse the timestamp if available
  let timestamp: number | undefined;
  if (deposit.fillBlockTimestamp) {
    timestamp = new Date(deposit.fillBlockTimestamp).getTime();
  }

  return {
    blockNumber: deposit.fillBlockNumber || 0,
    txHash: deposit.fillTx,
    from: deposit.depositor,
    to: deposit.recipient,
    token: deposit.outputToken,
    amount: ethers.BigNumber.from(deposit.outputAmount),
    isDeposit: false,
    timestamp,
  };
};

/**
 * Construct the adapter function for a given chain
 */
const constructParams = (chain: string) => {
  const chainId = chainIdMapping[chain];
  
  if (!chainId) {
    throw new Error(`[across] Unknown chain: ${chain}`);
  }

  return async (fromBlock: number, toBlock: number): Promise<EventData[]> => {
    const events: EventData[] = [];

    // Fetch deposits (origin chain = this chain)
    // These are funds leaving this chain
    const depositsParams: Record<string, string | number> = {
      originChainId: chainId,
      startBlock: fromBlock,
      endBlock: toBlock,
    };

    try {
      const deposits = await fetchAllDeposits(depositsParams);
      
      // Filter by block range client-side until API supports it
      const filteredDeposits = deposits.filter(d => {
        const blockNum = d.depositBlockNumber || 0;
        return blockNum >= fromBlock && blockNum <= toBlock;
      });
      
      for (const deposit of filteredDeposits) {
        const event = convertToDepositEvent(deposit);
        if (event) {
          events.push(event);
        }
      }
      
      console.log(`[across] Fetched ${deposits.length} deposits from ${chain} (chainId: ${chainId}), ${filteredDeposits.length} in block range ${fromBlock}-${toBlock}`);
    } catch (error) {
      console.error(`[across] Error fetching deposits for ${chain}:`, error);
    }

    // Fetch withdrawals (destination chain = this chain)
    // These are funds arriving on this chain
    const withdrawalsParams: Record<string, string | number> = {
      destinationChainId: chainId,
      status: "filled", // Only filled deposits have withdrawals
      startFillBlock: fromBlock,
      endFillBlock: toBlock,
    };

    try {
      const withdrawals = await fetchAllDeposits(withdrawalsParams);
      
      for (const deposit of withdrawals) {
        const event = convertToWithdrawalEvent(deposit);
        if (event) {
          events.push(event);
        }
      }
      
      console.log(`[across] Fetched ${withdrawals.length} withdrawals to ${chain} (chainId: ${chainId}) in block range ${fromBlock}-${toBlock}`);
    } catch (error) {
      console.error(`[across] Error fetching withdrawals for ${chain}:`, error);
    }

    return events;
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  optimism: constructParams("optimism"),
  polygon: constructParams("polygon"),
  "zksync era": constructParams("zksync era"),
  lisk: constructParams("lisk"),
  unichain: constructParams("unichain"),
  base: constructParams("base"),
  mode: constructParams("mode"),
  arbitrum: constructParams("arbitrum"),
  linea: constructParams("linea"),
  blast: constructParams("blast"),
  scroll: constructParams("scroll"),
  soneium: constructParams("soneium"),
  "world chain": constructParams("world chain"),
  ink: constructParams("ink"),
  zora: constructParams("zora"),
  redstone: constructParams("redstone"),
  monad: constructParams("monad"),
  boba: constructParams("boba"),
  plasma: constructParams("plasma"),
  solana: constructParams("solana"),
};

export default adapter;
