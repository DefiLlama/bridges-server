import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import fetch from "node-fetch";
import { EventData } from "../../utils/types";
import { CashmereAPIResponse, CashmereTransaction, domainToChain, chainToDomain, usdcAddresses } from "./types";
import { ethers } from "ethers";
const retry = require("async-retry");

/**
 * Cashmere CCTP Relayer is a cross-chain USDC bridge using Circle's CCTP protocol.
 * All amounts are in USDC (6 decimals), making volume tracking straightforward.
 * API: https://kapi.cashmere.exchange/transactionsmainnet
 */

const requestQueues = new Map<number, Promise<any>>();

enum ApiErrorType {
  NETWORK = "network",
  API_LIMIT = "api_limit", 
  DATA_PARSING = "data_parsing",
  UNKNOWN = "unknown",
}

// Convert USDC amount (6 decimals) to USD BigNumber (Relay-style rounding)
const parseUsdcAmount = (amountUsdc?: number): ethers.BigNumber => {
  if (!amountUsdc || amountUsdc <= 0) return ethers.BigNumber.from(0);
  
  // Convert from 6-decimal USDC to USD and round (like Relay)
  const usdAmount = amountUsdc / 1e6;
  return ethers.BigNumber.from(Math.round(usdAmount));
};

export const convertTransactionToEvent = (
  tx: CashmereTransaction
): { deposit?: EventData; withdraw?: EventData; depositChainId?: number; withdrawChainId?: number } => {
  
  const depositAmount = parseUsdcAmount(tx.deposit_amount);
  const withdrawAmount = parseUsdcAmount(tx.receive_amount);
  
  const timestamp = new Date(tx.created_at).getTime();
  
  // For CCTP, we track both deposit (source) and withdrawal (destination) sides
  const depositChainId = tx.source_domain;
  const withdrawChainId = tx.destination_domain;
  
  // Debug: Check if domains exist
  const depositChain = depositChainId !== undefined ? domainToChain[depositChainId] : undefined;
  const withdrawChain = withdrawChainId !== undefined ? domainToChain[withdrawChainId] : undefined;
  
  return {
    depositChainId,
    deposit: depositChainId && tx.source_tx_hash && depositAmount.gt(0)
      ? {
          blockNumber: tx.block || 0,
          txHash: tx.source_tx_hash,
          timestamp,
          from: tx.sender || "0x",
          to: tx.recipient || "0x", 
          token: usdcAddresses[domainToChain[depositChainId]] || "0xA0b86a33E6441986C3103F5f1b26E86d1e5F0d22", // USDC contract
          amount: depositAmount,
          isDeposit: true,
          isUSDVolume: true, // Key: amounts are already in USD
        }
      : undefined,
    withdrawChainId,
    withdraw: withdrawChainId && tx.destination_tx_hash && withdrawAmount.gt(0)
      ? {
          blockNumber: 0, // Destination block not always available
          txHash: tx.destination_tx_hash,
          timestamp,
          from: tx.sender || "0x",
          to: tx.recipient || "0x",
          token: usdcAddresses[domainToChain[withdrawChainId]] || "0xA0b86a33E6441986C3103F5f1b26E86d1e5F0d22", // USDC contract
          amount: withdrawAmount,
          isDeposit: false,
          isUSDVolume: true, // Key: amounts are already in USD
        }
      : undefined,
  };
};

const fetchTransactionsByTime = async (
  startTimestamp: number,
  endTimestamp: number,
  cursor?: string
): Promise<CashmereAPIResponse> => {
  let url = `https://kapi.cashmere.exchange/transactionsmainnet?start_time=${startTimestamp}&end_time=${endTimestamp}&limit=50`;
  if (cursor) url += `&cursor=${cursor}`;

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
          `[${errorType}] HTTP ${response.status} for ts ${startTimestamp}-${endTimestamp}`
        );
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          (error as any).name = "NoRetryError";
        }
        throw error;
      }
      return response.json();
    },
    {
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 10000,
      randomize: true,
      onRetry: (error: any) => {
        if (error.name === "NoRetryError") throw error;
      },
    }
  );
};

const rateLimitedFetchByTime = async (
  startTimestamp: number,
  endTimestamp: number,
  cursor?: string
): Promise<CashmereAPIResponse> => {
  const delay = cursor ? 500 : 200;
  const queueKey = 0;
  const lastRequest = requestQueues.get(queueKey) || Promise.resolve();
  const currentRequest = lastRequest
    .then(() => new Promise((resolve) => setTimeout(resolve, delay)))
    .then(() => fetchTransactionsByTime(startTimestamp, endTimestamp, cursor));
  requestQueues.set(queueKey, currentRequest);
  return currentRequest;
};

export const forEachTransactionsByTimePage = async (
  startTimestamp: number,
  endTimestamp: number,
  onPage: (transactions: CashmereTransaction[]) => Promise<void> | void
): Promise<void> => {
  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 3;
  console.log(`Streaming Cashmere transactions for ts ${startTimestamp}-${endTimestamp}`);

  try {
    const first = await rateLimitedFetchByTime(startTimestamp, endTimestamp);
    const firstPage = first.transactions ?? [];
    if (firstPage.length) {
      await onPage(firstPage);
    } else {
      console.log(`No transactions in first page for ts ${startTimestamp}-${endTimestamp}`);
    }

    let cursor = first.next_cursor;
    let pageCount = firstPage.length ? 1 : 0;
    let totalTransactions = firstPage.length;
    const maxPages = 1000;

    while (cursor && pageCount < maxPages) {
      try {
        const page = await rateLimitedFetchByTime(startTimestamp, endTimestamp, cursor);
        cursor = page.next_cursor;
        const txs = page.transactions ?? [];
        
        if (txs.length) await onPage(txs);
        pageCount += 1;
        totalTransactions += txs.length;
        consecutiveErrors = 0;
        
        // Stop if API says no more data
        if (!page.has_more) {
          console.log(`Stopping: API indicates no more data (has_more=false)`);
          break;
        }
      } catch (error) {
        consecutiveErrors++;
        console.error(
          `Pagination error ${consecutiveErrors}/${maxConsecutiveErrors} while streaming ts ${startTimestamp}-${endTimestamp}:`,
          error
        );
        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.error(`Circuit breaker activated after ${consecutiveErrors} consecutive errors`);
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, consecutiveErrors) * 1000));
      }
    }

    if (pageCount >= maxPages && cursor) {
      console.warn(`Hit pagination page limit for ts ${startTimestamp}-${endTimestamp}. Some data may be missing.`);
    }
    
    console.log(`Processed ${totalTransactions} transactions across ${pageCount} pages for ts ${startTimestamp}-${endTimestamp}`);
  } catch (error) {
    console.error(`Critical error streaming transactions for ts ${startTimestamp}-${endTimestamp}:`, error);
  }
};

// Create adapter for all supported chains
const adapter = Object.fromEntries(
  Object.values(domainToChain).map(chain => [chain, true])
) as any;

export default adapter;
