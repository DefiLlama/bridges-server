export type CCIPEvent = {
  chain: string;
  tx_hash: string;
  ts: number;
  tx_from: string;
  tx_to: string;
  token: string;
  amount: string;
  is_deposit: boolean;
  is_usd_volume: boolean; // Per requirements, always false for CCIP
};

interface CCIPTransaction {
  sourceChain: string;
  destChain: string;
  sourceTxHash: string;
  destTxHash: string;
  blockTimestamp: number; // In seconds from API
  messageID: string;
  tokenTransferFrom: string;
  tokenTransferTo: string;
  tokenAddressSource: string;
  tokenAddressDest: string;
  tokenAmount: number; // Number from API, converted to string for CCIPEvent
}

interface ApiResponse {
  transactions: CCIPTransaction[];
}

// --- Constants ---
const API_BASE_URL = "https://dsa-metrics-api-dev-81875351881.europe-west2.run.app/v1/ccip_transactions";
const API_KEY = ""; // API Key, currently an empty string

// --- Main function ---
export async function fetchCCIPEvents(dateString: string): Promise<CCIPEvent[]> {
  console.log(`[fetchCCIPEvents] Starting for date: ${dateString}`);

  // Basic validation for dateString format (optional but good practice)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const errorMsg = `[fetchCCIPEvents] Invalid date format: "${dateString}". Expected YYYY-MM-DD.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const apiUrlWithDate = `${API_BASE_URL}?date=${dateString}`;
  console.log(`[fetchCCIPEvents] Constructed API URL: ${apiUrlWithDate}`);

  const allEvents: CCIPEvent[] = [];

  try {
    console.log(`[fetchCCIPEvents] Making API request to ${apiUrlWithDate}...`);
    const response = await fetch(apiUrlWithDate, {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY,
        'Accept': 'application/json',
      },
    });

    console.log(`[fetchCCIPEvents] API response status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      const errorMsg = `[fetchCCIPEvents] API Error ${response.status}: ${response.statusText}. URL: ${apiUrlWithDate}. Body: ${errorBody}`;
      console.error(errorMsg);
      throw new Error(`Failed to fetch CCIP events: ${response.status} ${response.statusText}`);
    }

    const apiData: ApiResponse = await response.json();
    console.log("[fetchCCIPEvents] Successfully parsed API response.");

    const rawTransactions = apiData?.transactions;
    if (!Array.isArray(rawTransactions)) {
      const errorMsg = `[fetchCCIPEvents] Invalid data format: 'transactions' array not found or not an array. URL: ${apiUrlWithDate}. Response: ${JSON.stringify(apiData)}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    console.log(`[fetchCCIPEvents] Received ${rawTransactions.length} raw transactions from API.`);

    let processedCount = 0;
    for (const transaction of rawTransactions) {
      console.log(`[fetchCCIPEvents] Processing raw transaction with messageID: ${transaction.messageID}`);
      if (
        !transaction.sourceChain || !transaction.destChain ||
        !transaction.sourceTxHash || !transaction.destTxHash ||
        typeof transaction.blockTimestamp !== 'number' ||
        !transaction.tokenTransferFrom || !transaction.tokenTransferTo ||
        !transaction.tokenAddressSource || !transaction.tokenAddressDest ||
        typeof transaction.tokenAmount !== 'number'
      ) {
        console.warn("[fetchCCIPEvents] Skipping incomplete raw transaction data:", transaction);
        continue;
      }

      const timestampMs = transaction.blockTimestamp * 1000;
      const amountStr = String(transaction.tokenAmount);

      const withdrawalEvent: CCIPEvent = {
        chain: transaction.sourceChain,
        tx_hash: transaction.sourceTxHash,
        ts: timestampMs,
        tx_from: transaction.tokenTransferFrom,
        tx_to: transaction.tokenTransferTo,
        token: transaction.tokenAddressSource,
        amount: amountStr,
        is_deposit: false,
        is_usd_volume: false,
      };
      allEvents.push(withdrawalEvent);

      const depositEvent: CCIPEvent = {
        chain: transaction.destChain,
        tx_hash: transaction.destTxHash,
        ts: timestampMs,
        tx_from: transaction.tokenTransferFrom,
        tx_to: transaction.tokenTransferTo,
        token: transaction.tokenAddressDest,
        amount: amountStr,
        is_deposit: true,
        is_usd_volume: false,
      };
      allEvents.push(depositEvent);
      processedCount++;
    }
    console.log(`[fetchCCIPEvents] Successfully processed ${processedCount} raw transactions, created ${allEvents.length} CCIPEvent objects.`);

  } catch (error) {
    // Ensure error is an instance of Error for consistent message access
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[fetchCCIPEvents] Error during processing for date ${dateString}: ${errorMessage}`, error);
    throw error; // Re-throw the original error or a new error encapsulating it
  }

  console.log(`[fetchCCIPEvents] Finished for date: ${dateString}. Returning ${allEvents.length} events.`);
  return allEvents;
}
