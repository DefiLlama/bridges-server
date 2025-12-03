import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { EventData } from "../../utils/types";
import { getTimestamp } from "@defillama/sdk/build/util";
import { ethers } from "ethers";
import fetch from "node-fetch";
const retry = require("async-retry");

const API_BASE_URL = "https://5okwm-giaaa-aaaar-qbn6a-cai.raw.icp0.io/api";
const BATCH_SIZE = 100;

// ICP-native tokens - same contract address on all EVM chains
const icpNativeTokens: Record<string, string> = {
  ICP: "0x00f3C42833C3170159af4E92dbb451Fb3F708917",
  BOB: "0xecc5f868AdD75F4ff9FD00bbBDE12C35BA2C9C89",
  CHAT: "0xDb95092C454235E7e666c4E226dBBbCdeb499d25",
  GLDT: "0x86856814e74456893Cfc8946BedcBb472b5fA856",
};

// EVM-native tokens - different contract per chain
const evmNativeTokens: Record<string, Record<string, string>> = {
  USDC: {
    Ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    Arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    Base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
  USDT: {
    Ethereum: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  cbBTC: {
    Ethereum: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    Arbitrum: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    Base: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
  },
};

// Chain name mapping for the adapter
const chainMapping: Record<string, string> = {
  Ethereum: "ethereum",
  Arbitrum: "arbitrum",
  Base: "base",
};

interface OneSecTransaction {
  txHash: string;
  blockNumber: number;
  timestamp: number;
  token: string;
  amount: string;
  fromChain: string;
  toChain: string;
  from: string;
  to: string;
}

interface ApiResponse {
  transactions: OneSecTransaction[];
}

const fetchTransactions = async (
  fromTimestamp: number,
  toTimestamp: number
): Promise<OneSecTransaction[]> => {
  const url = `${API_BASE_URL}/transactions?from=${fromTimestamp}&to=${toTimestamp}`;

  return retry(
    async () => {
      const response = await fetch(url, { timeout: 30000 });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching transactions`);
      }
      const data = (await response.json()) as ApiResponse;
      return data.transactions;
    },
    {
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 10000,
    }
  );
};

const fetchAllTransactions = async (
  fromTimestamp: number,
  toTimestamp: number
): Promise<OneSecTransaction[]> => {
  const allTransactions: OneSecTransaction[] = [];
  let currentFrom = fromTimestamp;

  while (true) {
    const transactions = await fetchTransactions(currentFrom, toTimestamp);

    if (transactions.length === 0) break;

    allTransactions.push(...transactions);

    // If we got less than batch size, we're done
    if (transactions.length < BATCH_SIZE) break;

    // Move from to last item's timestamp for next batch
    const lastTx = transactions[transactions.length - 1];
    currentFrom = lastTx.timestamp;

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return allTransactions;
};

const getTokenAddress = (token: string, evmChain: string): string | null => {
  // Check ICP-native tokens first (same address on all chains)
  if (icpNativeTokens[token]) {
    return icpNativeTokens[token];
  }

  // Check EVM-native tokens (chain-specific)
  if (evmNativeTokens[token] && evmNativeTokens[token][evmChain]) {
    return evmNativeTokens[token][evmChain];
  }

  return null;
};

const isIcpNativeToken = (token: string): boolean => {
  return token in icpNativeTokens;
};

const convertToEventData = (
  tx: OneSecTransaction,
  targetChain: string
): EventData | null => {
  // Determine which chain is EVM (not ICP)
  const evmChain = tx.fromChain === "ICP" ? tx.toChain : tx.fromChain;

  // Only process transactions for the target chain
  if (chainMapping[evmChain] !== targetChain) {
    return null;
  }

  const tokenAddress = getTokenAddress(tx.token, evmChain);
  if (!tokenAddress) {
    console.warn(`Unknown token ${tx.token} for chain ${evmChain}`);
    return null;
  }

  // Determine isDeposit based on token origin:
  // - ICP-native tokens: ICP→EVM = deposit, EVM→ICP = withdrawal
  // - EVM-native tokens: EVM→ICP = deposit, ICP→EVM = withdrawal
  let isDeposit: boolean;
  if (isIcpNativeToken(tx.token)) {
    // ICP-native: deposit when leaving ICP (ICP→EVM)
    isDeposit = tx.fromChain === "ICP";
  } else {
    // EVM-native: deposit when leaving EVM (EVM→ICP)
    isDeposit = tx.fromChain !== "ICP";
  }

  return {
    blockNumber: tx.blockNumber,
    txHash: tx.txHash,
    from: tx.from,
    to: tx.to,
    token: tokenAddress,
    amount: ethers.BigNumber.from(tx.amount),
    isDeposit,
    timestamp: tx.timestamp * 1000, // Convert to milliseconds
  };
};

const constructParams = (chain: string) => {
  return async (fromBlock: number, toBlock: number): Promise<EventData[]> => {
    // Convert blocks to timestamps
    const [fromTimestamp, toTimestamp] = await retry(() =>
      Promise.all([getTimestamp(fromBlock, chain), getTimestamp(toBlock, chain)])
    );

    // Fetch all transactions from API
    const transactions = await fetchAllTransactions(fromTimestamp, toTimestamp);

    // Convert to EventData, filtering for this chain
    const events: EventData[] = [];
    for (const tx of transactions) {
      const event = convertToEventData(tx, chain);
      if (event) {
        events.push(event);
      }
    }

    return events;
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
  base: constructParams("base"),
};

export default adapter;
