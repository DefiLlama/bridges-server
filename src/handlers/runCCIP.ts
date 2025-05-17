// runCCIP.ts

import dayjs from 'dayjs';
import _ from 'lodash'; // For batching transactions
import { fetchCCIPEvents, CCIPEvent } from '../adapters/ccip'; 
import { sql } from '../utils/db'; 
import { insertTransactionRows } from '../utils/wrappa/postgres/write'; 
import { getBridgeID } from '../utils/wrappa/postgres/query'; 
// import { wrapScheduledLambda } from "../utils/wrap"; 

// --- Define TransactionRow interface locally ---
interface TransactionRow {
  bridge_id: string;
  chain: string;
  tx_hash: string;
  ts: number; // Timestamp in milliseconds
  tx_from: string;
  tx_to: string;
  token: string; // Token address
  amount: string; // Amount as a string
  is_deposit: boolean;
  is_usd_volume: boolean;
}

// --- Configuration ---
const ADAPTER_NAME = "ccip"; 
const DEFAULT_CHAIN_FOR_BRIDGE_ID = "Ethereum"; // Chain to use for fetching the global bridge_id
const DAYS_TO_PROCESS = 3;   
const DB_BATCH_SIZE = 200;   

/**
 * Formats a dayjs.Dayjs object into 'YYYY-MM-DD' string.
 */
const formatDateToYYYYMMDD = (date: dayjs.Dayjs): string => date.format('YYYY-MM-DD');

/**
 * Main handler function to fetch CCIP events for recent days and store them.
 */
export const handler = async (): Promise<void> => {
  console.log(`[runCCIP] Starting CCIP event processing task.`);

  let globalBridgeId: string | null = null;

  try {
    console.log(`[runCCIP] Fetching global bridge_id for adapter "${ADAPTER_NAME}" using chain "${DEFAULT_CHAIN_FOR_BRIDGE_ID}"...`);
    const bridgeEntry = await getBridgeID(ADAPTER_NAME, DEFAULT_CHAIN_FOR_BRIDGE_ID);
    globalBridgeId = bridgeEntry ? bridgeEntry.id : null;

    if (!globalBridgeId) {
      console.error(`[runCCIP] CRITICAL: Failed to fetch global bridge_id using chain "${DEFAULT_CHAIN_FOR_BRIDGE_ID}". Terminating task.`);
      return; // Stop processing if the global bridge_id cannot be determined
    }
    console.log(`[runCCIP] Using global bridge_id: "${globalBridgeId}" for all CCIP events.`);
  } catch (err) {
    console.error(`[runCCIP] CRITICAL: Error fetching global bridge_id:`, err);
    return; // Stop processing on error
  }

  for (let i = 0; i < DAYS_TO_PROCESS; i++) {
    const targetDate = dayjs().subtract(i + 1, 'day');
    const dateString = formatDateToYYYYMMDD(targetDate);

    console.log(`[runCCIP] Starting processing for date: ${dateString}`);

    try {
      const ccipEvents: CCIPEvent[] = await fetchCCIPEvents(dateString);

      if (ccipEvents.length === 0) {
        console.log(`[runCCIP] No CCIP events found for ${dateString}.`);
        continue; 
      }
      console.log(`[runCCIP] Fetched ${ccipEvents.length} CCIP events for ${dateString}.`);

      // Step 2: Transform CCIPEvents to TransactionRows using the global bridge_id
      const transactionsToInsert: TransactionRow[] = ccipEvents.map(event => {
        return {
          ...event, // Spreads all properties from CCIPEvent
          bridge_id: globalBridgeId, // Use the fetched global bridge_id
        };
      });
      
      if (transactionsToInsert.length > 0) {
        console.log(`[runCCIP] Prepared ${transactionsToInsert.length} transaction rows for insertion for date ${dateString}.`);
        
        await sql.begin(async (sqlClient) => {
          const transactionChunks = _.chunk(transactionsToInsert, DB_BATCH_SIZE);
          let chunkCount = 0;
          for (const batch of transactionChunks) {
            chunkCount++;
            console.log(`[runCCIP] Inserting batch ${chunkCount}/${transactionChunks.length} (${batch.length} rows) for ${dateString}...`);
            await insertTransactionRows(sqlClient, true, batch, "upsert");
          }
        });
        console.log(`[runCCIP] Successfully inserted/upserted ${transactionsToInsert.length} transaction rows for ${dateString}.`);
      } else {
        // This should ideally not be reached if ccipEvents.length > 0
        console.log(`[runCCIP] No transactions to insert for ${dateString} after processing.`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[runCCIP] Critical error processing data for ${dateString}: ${errorMessage}`, error);
    }
    console.log(`[runCCIP] Finished processing for date: ${dateString}.`);
  }
  console.log(`[runCCIP] CCIP event processing task completed for all ${DAYS_TO_PROCESS} day(s).`);
};

// --- Example of how to run the handler (for local testing) ---
// async function runLocalTest() {
//   console.log("[runCCIP - LocalTest] Starting local test run...");
//   try {
//     await handler();
//     console.log("[runCCIP - LocalTest] Local test run finished successfully.");
//   } catch (error) {
//     console.error("[runCCIP - LocalTest] Local test run failed:", error);
//   }
// }

// If you want to run this script directly (e.g., `ts-node runCCIP.ts`):
// runLocalTest();

// If this is a scheduled AWS Lambda, you might wrap it:
// export default wrapScheduledLambda(handler);
