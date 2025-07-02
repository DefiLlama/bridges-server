import dayjs from 'dayjs';
import { BridgeAdapter } from '../../helpers/bridgeAdapter.type';

export type CCIPEvent = {
  chain: string;
  tx_hash: string;
  ts: number; // In milliseconds
  tx_from: string;
  tx_to: string;
  token: string;
  amount: string;
  is_deposit: boolean;
  is_usd_volume: boolean;
};

interface CCIPTransaction {
  sourceChain: string;
  destChain: string;
  sourceTxHash: string;
  destTxHash: string;
  blockTimestamp: number; 
  messageID: string;
  tokenTransferFrom: string;
  tokenTransferTo: string;
  tokenAddressSource: string;
  tokenDecimalsSource: number;
  tokenAddressDest: string;
  tokenDecimalsDest: number;
  tokenAmount: number;
  tokenAmountUsd: number;
}

interface ApiResponse {
  transactions: CCIPTransaction[];
}

// --- Constants ---
const API_BASE_URL = "https://dsa-metrics-api-dev-81875351881.europe-west2.run.app/v1/ccip_transactions" // Base URL for the CCIP API
const API_KEY = ""; // API Key, currently an empty string during testing

function formatAmount(tokenAmount: number, decimals: number): string {
  // If decimals is zero, it means the token amount is already in the smallest unit (like wei for ETH)
  if (decimals === 0) {
    return String(Math.floor(tokenAmount));
  }

  // Calculate the divisor based on the number of decimals
  const divisor = Math.pow(10, decimals);
  
  // Divide the raw tokenAmount by the divisor
  const humanReadableAmount = tokenAmount / divisor;

  return String(humanReadableAmount);
}


export async function fetchEventsForDate(dateString: string): Promise<CCIPEvent[]> {
  console.log(`[fetchEventsForDate] Starting for date: ${dateString}`);
  const apiUrlWithDate = `${API_BASE_URL}?date=${dateString}`;

  try {
    console.log(`[fetchEventsForDate] Making API request to ${apiUrlWithDate}...`);
    const response = await fetch(apiUrlWithDate, {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY,
        'Accept': 'application/json',
      },
    });

    console.log(`[fetchEventsForDate] API response status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      const errorMsg = `[fetchEventsForDate] API Error ${response.status}: ${response.statusText}. URL: ${apiUrlWithDate}. Body: ${errorBody}`;
      console.error(errorMsg);
      throw new Error(`Failed to fetch CCIP events for date ${dateString}: ${response.status} ${response.statusText}`);
    }

    const apiData: ApiResponse = await response.json() as ApiResponse;
    console.log("[fetchEventsForDate] Successfully parsed API response.");

    const rawTransactions = (apiData && Array.isArray(apiData.transactions)) ? apiData.transactions : [];
    console.log(`[fetchEventsForDate] Received ${rawTransactions.length} raw transactions from API for ${dateString}.`);

    const dailyEvents: CCIPEvent[] = [];
    for (const transaction of rawTransactions) {
      const timestampMs = transaction.blockTimestamp * 1000; // API returns timestamp in seconds
    
      let sourceAmount: string;
      let destAmount: string;
      let isUsdVolume: boolean;
    
      // If USD volume is provided, use it.
      if (transaction.tokenAmountUsd && transaction.tokenAmountUsd > 0) {
        sourceAmount = transaction.tokenAmountUsd.toFixed(2);
        destAmount = transaction.tokenAmountUsd.toFixed(2);
        isUsdVolume = true;
      }
      // If no USD volume, use token amount as 'wei' or whatever the smallest unit is.  
      else {
        sourceAmount = formatAmount(transaction.tokenAmount, transaction.tokenDecimalsSource);
        destAmount = formatAmount(transaction.tokenAmount, transaction.tokenDecimalsDest);
        isUsdVolume = false;
      }
    
      // Push source event
      dailyEvents.push({
        chain: transaction.sourceChain,
        tx_hash: transaction.sourceTxHash,
        ts: timestampMs,
        tx_from: transaction.tokenTransferFrom,
        tx_to: transaction.tokenTransferTo,
        token: transaction.tokenAddressSource,
        amount: sourceAmount,
        is_deposit: false,
        is_usd_volume: isUsdVolume,
      });
    
      // Push destination event
      dailyEvents.push({
        chain: transaction.destChain,
        tx_hash: transaction.destTxHash,
        ts: timestampMs,
        tx_from: transaction.tokenTransferFrom,
        tx_to: transaction.tokenTransferTo,
        token: transaction.tokenAddressDest,
        amount: destAmount,
        is_deposit: true,
        is_usd_volume: isUsdVolume,
      });
    }    
    console.log(`[fetchEventsForDate] Processed ${rawTransactions.length} raw transactions, created ${dailyEvents.length} CCIPEvent objects for ${dateString}.`);
    return dailyEvents;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[fetchEventsForDate] Error during processing for date ${dateString}: ${errorMessage}`);
    throw error;
  }
}


// --- Main function modified as per requirements ---
export async function fetchCCIPEvents(
  fromTimestamp: number, // Unix timestamp in seconds
  toTimestamp: number // Unix timestamp in seconds
): Promise<CCIPEvent[]> {
  console.log(`[fetchCCIPEvents] Starting for timestamp range: ${fromTimestamp} to ${toTimestamp}`);

  // Validate input timestamps
  if (typeof fromTimestamp !== 'number' || typeof toTimestamp !== 'number' || fromTimestamp <= 0 || toTimestamp <= 0) {
    const errorMsg = `[fetchCCIPEvents] Invalid timestamps: Both fromTimestamp and toTimestamp must be positive numbers. Received: from=${fromTimestamp}, to=${toTimestamp}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const fromDate = dayjs.unix(fromTimestamp).startOf('day');
  const toDate = dayjs.unix(toTimestamp).startOf('day');

  if (!fromDate.isValid() || !toDate.isValid()) {
    const errorMsg = `[fetchCCIPEvents] Invalid date objects created from timestamps: fromTimestamp=${fromTimestamp}, toTimestamp=${toTimestamp}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (toTimestamp < fromTimestamp) {
    const errorMsg = `[fetchCCIPEvents] 'toTimestamp' (${toTimestamp}) cannot be before 'fromTimestamp' (${fromTimestamp}).`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const datesToFetch: string[] = [];
  let currentDateIteration = fromDate;
  // Iterate from the start of the 'fromTimestamp' day to the start of the 'toTimestamp' day
  while (!currentDateIteration.isAfter(toDate)) {
    datesToFetch.push(currentDateIteration.format('YYYY-MM-DD'));
    currentDateIteration = currentDateIteration.add(1, 'day');
  }

  if (datesToFetch.length === 0) {
      // This could happen if fromTimestamp and toTimestamp are on the same day,
      // but the above logic should still add one date.
      // Or if fromDate somehow became after toDate due to extreme timestamp values.
      // As a fallback, if from/to timestamps are valid, ensure at least the fromDate is fetched.
      const singleDate = dayjs.unix(fromTimestamp).format('YYYY-MM-DD');
      console.warn(`[fetchCCIPEvents] Date range resulted in no dates. Defaulting to fetch for: ${singleDate}`);
      datesToFetch.push(singleDate);
  }


  console.log(`[fetchCCIPEvents] Dates to fetch: ${datesToFetch.join(', ')}`);

  const allEventsPromises: Promise<CCIPEvent[]>[] = datesToFetch.map(dateString =>
    fetchEventsForDate(dateString)
  );

  let allRawEvents: CCIPEvent[] = [];
  try {
    const results = await Promise.all(allEventsPromises);
    allRawEvents = results.flat();
    console.log(`[fetchCCIPEvents] Fetched a total of ${allRawEvents.length} events before filtering.`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[fetchCCIPEvents] Error fetching events for one or more dates: ${errorMessage}`);
    throw new Error(`Failed to fetch all CCIP events for the range: ${errorMessage}`);
  }

  // Filter events to be within the precise fromTimestamp and toTimestamp
  // Timestamps from user are in seconds, event.ts is in milliseconds
  const fromTimestampMs = fromTimestamp * 1000;
  const toTimestampMs = toTimestamp * 1000;

  const filteredEvents = allRawEvents.filter(event => {
    return event.ts >= fromTimestampMs && event.ts <= toTimestampMs;
  });

  console.log(`[fetchCCIPEvents] Finished. Returning ${filteredEvents.length} events after filtering for the timestamp range.`);
  return filteredEvents;
}

// The CCIP adapter returns data for all chains at once, so we effectively ignore the 
// chain parameter by mapping everything to 'Ethereum'
const adapter: BridgeAdapter = {
  "Ethereum": fetchCCIPEvents as any
};

export default adapter;