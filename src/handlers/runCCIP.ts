/**
 * @file runCCIP.ts
 * @description
 * This script fetches Chainlink CCIP (Cross-Chain Interoperability Protocol)
 * transaction events using the ccip adapter, and ingests them into the database. 
 * It can operate in two modes:
 *
 * 1. Default Mode (Recent Data):
 * - Fetches data for the last 'N' days (default defined by `DEFAULT_DAYS_TO_PROCESS`),
 * excluding the current day. Used for regular, scheduled updates.
 * - CLI: `ts-node src/handlers/runCCIP.ts`
 * - Programmatic: `await runCCIPDefaultMode();`
 *
 * 2. Backfill Mode (Specific Date Range):
 * - Fetches data for a specified historical date range (YYYY-MM-DD format, inclusive).
 * Useful for initial population or filling data gaps.
 * - CLI: `ts-node src/handlers/runCCIP.ts --startDate YYYY-MM-DD --endDate YYYY-MM-DD`
 * - Programmatic: `await runCCIPBackfillMode("YYYY-MM-DD", "YYYY-MM-DD");`
**/

import dayjs from 'dayjs';
import _ from 'lodash';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { fetchEventsForDate, CCIPEvent } from '../adapters/ccip';
import { sql } from '../utils/db';
import { insertTransactionRows } from '../utils/wrappa/postgres/write';
import { getBridgeID } from '../utils/wrappa/postgres/query';

interface TransactionRow {
    bridge_id: string;
    chain: string;
    tx_hash: string | null;
    ts: number;
    tx_from: string | null;
    tx_to: string | null;
    token: string;
    amount: string;
    is_deposit: boolean;
    is_usd_volume: boolean;
    tx_block: number | null;
    txs_counted_as: number | null;
    origin_chain: string | null;
}

const ADAPTER_NAME = "ccip";
const DEFAULT_CHAIN_FOR_BRIDGE_ID = "Ethereum"; // Chain used to identify the bridge in the DB.
const DEFAULT_DAYS_TO_PROCESS = 3; // Number of past days to process in default mode.
const DB_BATCH_SIZE = 200; // Number of rows to insert into the DB in a single batch.

// --- Utility Functions ---
const formatDateToYYYYMMDD = (date: dayjs.Dayjs): string => date.format('YYYY-MM-DD');
const isValidDateFormat = (dateString: string): boolean => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateString) && dayjs(dateString, 'YYYY-MM-DD', true).isValid();
};

interface HandlerOptions {
    startDate?: string;
    endDate?: string;
}

// Core handler function to process CCIP events.
const _handler = async (options: HandlerOptions = {}): Promise<void> => {
    const { startDate, endDate } = options;
    let datesToProcess: string[] = [];

    // Determine dates to process: either a specified range or default recent days.
    if (startDate && endDate) {
        // Backfill mode: Generate date strings for the specified range.
        console.log(`[_handler] Backfill mode: Processing date range from ${startDate} to ${endDate}.`);
        let current = dayjs(startDate);
        const end = dayjs(endDate);
        while (!current.isAfter(end)) {
            datesToProcess.push(formatDateToYYYYMMDD(current));
            current = current.add(1, 'day');
        }
    } else if (startDate || endDate) {
        // Handle invalid range input if only one date is provided.
        console.error("[_handler] Error: For date range, both startDate and endDate must be provided. Defaulting to recent days if applicable, or stopping.");
        // If we are in a programmatic call that intended a range, this could be an issue.
        // For CLI, yargs handles this. For programmatic, we'll rely on specific functions.
    }

    if (datesToProcess.length === 0 && !(startDate && endDate)) { // Ensures default only if no range was ATTEMPTED
        // Default mode: Generate date strings for the last DEFAULT_DAYS_TO_PROCESS.
        console.log(`[_handler] Default mode: Processing the last ${DEFAULT_DAYS_TO_PROCESS} days (not including today).`);
        for (let i = 1; i <= DEFAULT_DAYS_TO_PROCESS; i++) {
            datesToProcess.push(formatDateToYYYYMMDD(dayjs().subtract(i, 'day')));
        }
    }

    if (datesToProcess.length === 0) {
        console.log("[_handler] No dates to process. Exiting handler logic.");
        return;
    }

    console.log(`[_handler] Will process the following dates: ${datesToProcess.join(', ')}`);
    console.log(`[_handler] Starting CCIP event processing task.`);

    let globalBridgeId: string | null = null;
    try {
        // Fetch the unique bridge identifier from the database.
        console.log(`[_handler] Fetching global bridge_id for adapter "${ADAPTER_NAME}" using chain "${DEFAULT_CHAIN_FOR_BRIDGE_ID}"...`);
        const bridgeEntry = await getBridgeID(ADAPTER_NAME, DEFAULT_CHAIN_FOR_BRIDGE_ID);
        globalBridgeId = bridgeEntry ? bridgeEntry.id : null;

        if (!globalBridgeId) {
            console.error(`[_handler] CRITICAL: Failed to fetch global bridge_id using chain "${DEFAULT_CHAIN_FOR_BRIDGE_ID}". Terminating task.`);
            throw new Error(`Failed to fetch global bridge_id for ${ADAPTER_NAME}`);
        }
        console.log(`[_handler] Using global bridge_id: "${globalBridgeId}" for all CCIP events.`);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`[_handler] CRITICAL: Error fetching global bridge_id: ${errorMessage}`, err);
        throw err; // Re-throw for programmatic callers to handle
    }

    // Process events for each determined date.
    for (const dateString of datesToProcess) {
        console.log(`[_handler] Starting processing for date: ${dateString}`);
        try {
            // Fetch raw CCIP events from the adapter for the current date.
            const ccipEvents: CCIPEvent[] = await fetchEventsForDate(dateString);

            if (!ccipEvents || ccipEvents.length === 0) {
                console.log(`[_handler] No CCIP events found for ${dateString}.`);
                continue; // Skip to the next date.
            }
            console.log(`[_handler] Fetched ${ccipEvents.length} CCIP events for ${dateString}.`);

            // Transform fetched CCIP events into the database row format.
            const transactionsToInsert: TransactionRow[] = ccipEvents.map(event => ({
                bridge_id: globalBridgeId!, // Assert globalBridgeId is non-null.
                chain: event.chain,
                tx_hash: event.tx_hash || null,
                ts: event.ts,
                tx_from: event.tx_from || null,
                tx_to: event.tx_to || null,
                token: event.token,
                amount: event.amount,
                is_deposit: event.is_deposit,
                is_usd_volume: event.is_usd_volume,
                tx_block: null,
                txs_counted_as: null,
                origin_chain: null,
            }));

            if (transactionsToInsert.length > 0) {
                console.log(`[_handler] Prepared ${transactionsToInsert.length} transaction rows for insertion for date ${dateString}.`);
                // Insert transformed data into the database in batches.
                await sql.begin(async (sqlClient) => {
                    const transactionChunks = _.chunk(transactionsToInsert, DB_BATCH_SIZE);
                    for (let j = 0; j < transactionChunks.length; j++) {
                        const batch = transactionChunks[j];
                        console.log(`[_handler] Inserting batch ${j + 1}/${transactionChunks.length} (${batch.length} rows) for ${dateString}...`);
                        await insertTransactionRows(sqlClient, true, batch, "upsert");
                    }
                });
                console.log(`[_handler] Successfully inserted/upserted ${transactionsToInsert.length} transaction rows for ${dateString}.`);
            } else {
                console.log(`[_handler] No transactions to insert for ${dateString} after processing.`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[_handler] Error processing data for ${dateString}: ${errorMessage}`, error);
        }
        console.log(`[_handler] Finished processing for date: ${dateString}.`);
    }
    console.log(`[_handler] CCIP event processing task completed for all requested day(s).`);
};


export async function runCCIPDefaultMode(): Promise<void> {
    console.log("[runCCIPDefaultMode] Initiating default mode processing.");
    try {
        await _handler({}); // Call the core handler with no specific date options
        console.log("[runCCIPDefaultMode] Default mode processing completed.");
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[runCCIPDefaultMode] Failed: ${errorMessage}`, error);
        throw error; // Re-throw for the caller to handle
    }
}

/**
 * Runs the CCIP handler in backfill mode for a specified date range.
 * @param startDate The start date of the range (YYYY-MM-DD, inclusive).
 * @param endDate The end date of the range (YYYY-MM-DD, inclusive).
 */
export async function runCCIPBackfillMode(startDate: string, endDate: string): Promise<void> {
    console.log(`[runCCIPBackfillMode] Initiating backfill mode for ${startDate} to ${endDate}.`);

    // Validate inputs for programmatic use
    if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
        const errorMsg = "Invalid date format. Both startDate and endDate must be YYYY-MM-DD.";
        console.error(`[runCCIPBackfillMode] ${errorMsg}`);
        throw new Error(errorMsg);
    }
    if (dayjs(startDate).isAfter(dayjs(endDate))) {
        const errorMsg = "startDate cannot be after endDate.";
        console.error(`[runCCIPBackfillMode] ${errorMsg}`);
        throw new Error(errorMsg);
    }

    try {
        await _handler({ startDate, endDate }); // Call the core handler with date options
        console.log(`[runCCIPBackfillMode] Backfill mode processing for ${startDate} to ${endDate} completed.`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[runCCIPBackfillMode] Failed for range ${startDate}-${endDate}: ${errorMessage}`, error);
        throw error; // Re-throw for the caller to handle
    }
}


// --- CLI Execution Wrapper ---
async function executeHandlerForCli(options: HandlerOptions = {}) {
    console.log("[executeHandlerForCli] Starting CLI execution...");
    let success = false;
    try {
        await _handler(options);
        console.log("[executeHandlerForCli] CLI execution finished successfully.");
        success = true;
    } catch (error) {
        // Errors from _handler (like globalBridgeId failure) will be caught here.
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[executeHandlerForCli] CLI execution FAILED: ${errorMessage}`, error);
    } finally {
        // Ensure database connections are closed after execution for CLI.
        console.log("[executeHandlerForCli] Entering finally block for cleanup.");
        if (sql && typeof (sql as any).end === 'function') {
            try {
                console.log("[executeHandlerForCli] Attempting to close database connections...");
                await (sql as any).end();
                console.log("[executeHandlerForCli] Database connections closed.");
            } catch (closeError) {
                console.error("[executeHandlerForCli] Error closing database connections:", closeError);
            }
        } else {
            console.warn("[executeHandlerForCli] Database connection object 'sql' or its 'end' method not available for cleanup.");
        }
        console.log("[executeHandlerForCli] Cleanup finished.");
        // Exit with status code reflecting success or failure if run directly.
        if (require.main === module) {
            process.exit(success ? 0 : 1);
        }
    }
}

if (require.main === module) {
    // Parse command-line arguments using yargs.
    const argv = yargs(hideBin(process.argv))
        .option('startDate', {
            alias: 's',
            type: 'string',
            description: 'Start date for backfill (YYYY-MM-DD)',
            coerce: (arg) => { // Validate date format.
                if (arg && !isValidDateFormat(arg)) {
                    throw new Error(`Invalid startDate format: ${arg}. Please use YYYY-MM-DD.`);
                }
                return arg;
            }
        })
        .option('endDate', {
            alias: 'e',
            type: 'string',
            description: 'End date for backfill (YYYY-MM-DD)',
            coerce: (arg) => { // Validate date format.
                if (arg && !isValidDateFormat(arg)) {
                    throw new Error(`Invalid endDate format: ${arg}. Please use YYYY-MM-DD.`);
                }
                return arg;
            }
        })
        .check((argv) => { // Additional validation for date range.
            if ((argv.startDate && !argv.endDate) || (!argv.startDate && argv.endDate)) {
                throw new Error("Both --startDate and --endDate must be provided for a date range.");
            }
            if (argv.startDate && argv.endDate && dayjs(argv.startDate).isAfter(dayjs(argv.endDate))) {
                throw new Error("Error: --startDate cannot be after --endDate.");
            }
            return true;
        })
        .help()
        .alias('help', 'h')
        .argv;

    // Execute the CLI wrapper with parsed arguments.
    Promise.resolve(argv).then(resolvedArgv => {
        const options: HandlerOptions = {};
        if (resolvedArgv.startDate && resolvedArgv.endDate) {
            options.startDate = resolvedArgv.startDate;
            options.endDate = resolvedArgv.endDate;
        }
        executeHandlerForCli(options).catch(cliError => {
            console.error("[runCCIP - CLI Global Error] Unhandled error during CLI execution:", cliError);
            process.exit(1);
        });
    }).catch(err => {
        console.error("[runCCIP - CLI Setup Error] Error parsing command line arguments:", err.message);
        process.exit(1);
    });
}