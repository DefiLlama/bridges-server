import { getLatestBlock } from "@defillama/sdk/build/util";
import { Chain, getProvider } from "@defillama/sdk/build/general";
import { sql } from "./db";
import { getBridgeID } from "./wrappa/postgres/query";
import { insertTransactionRow, insertConfigRow, insertErrorRow } from "./wrappa/postgres/write";
import bridgeNetworks from "../data/bridgeNetworkData";
import adapters from "../adapters";
import { maxBlocksToQueryByChain } from "./constants";
import { store } from "./s3";
import { BridgeAdapter } from "../helpers/bridgeAdapter.type";
import { getCurrentUnixTimestamp } from "./date";
import type { RecordedBlocks } from "./types";
import { wait } from "../helpers/etherscan";
import { lookupBlock } from "@defillama/sdk/build/util";
const axios = require("axios");
const retry = require("async-retry");

// FIX timeout problems throughout functions here

export const runAllAdaptersToCurrentBlock = async (
  allowNullTxValues: boolean = false,
  onConflict: "ignore" | "error" | "upsert" = "error"
) => {
  const recordedBlocks = (
    await retry(
      async (_bail: any) =>
        await axios.get("https://llama-bridges-data.s3.eu-central-1.amazonaws.com/recordedBlocks.json")
    )
  ).data as RecordedBlocks;
  if (!recordedBlocks) {
    const errString = `Unable to retrieve recordedBlocks from s3.`;
    await insertErrorRow({
      ts: getCurrentUnixTimestamp() * 1000,
      target_table: "transactions",
      keyword: "critical",
      error: errString,
    });
    throw new Error(errString);
  }

  for (const bridgeNetwork of bridgeNetworks) {
    const { id, bridgeDbName } = bridgeNetwork;
    const adapter = adapters[bridgeDbName];
    if (!adapter) {
      const errString = `Adapter for ${bridgeDbName} not found, check it is exported correctly.`;
      await insertErrorRow({
        ts: getCurrentUnixTimestamp() * 1000,
        target_table: "transactions",
        keyword: "critical",
        error: errString,
      });
      throw new Error(errString);
    }
    await insertConfigEntriesForAdapter(adapter, bridgeDbName);
    const adapterPromises = Promise.all(
      Object.keys(adapter).map(async (chain, i) => {
        await wait(100 * i); // attempt to space out API calls
        const chainContractsAreOn = bridgeNetwork.chainMapping?.[chain as Chain]
          ? bridgeNetwork.chainMapping?.[chain as Chain]
          : chain;
        const { number, timestamp } = await getLatestBlock(chainContractsAreOn); // probably need timeout here
        if (!(number && timestamp)) {
          const errString = `Unable to get blocks for ${bridgeDbName} adapter on chain ${chainContractsAreOn}.`;
          await insertErrorRow({
            ts: getCurrentUnixTimestamp() * 1000,
            target_table: "transactions",
            keyword: "data",
            error: errString,
          });
          console.error(errString);
          return;
        }
        const maxBlocksToQuery = maxBlocksToQueryByChain[chainContractsAreOn]
          ? maxBlocksToQueryByChain[chainContractsAreOn]
          : maxBlocksToQueryByChain.default;
        let lastRecordedEndBlock = recordedBlocks[`${bridgeDbName}:${chain}`]?.endBlock;
        if (!lastRecordedEndBlock) {
          const defaultStartBlock = number - maxBlocksToQuery;
          lastRecordedEndBlock = defaultStartBlock;
          console.log(
            `Adapter for ${bridgeDbName} is missing recordedBlocks entry for chain ${chain}. Starting at block ${
              lastRecordedEndBlock + 1
            }.`
          );
        }
        try {
          await runAdapterHistorical(
            lastRecordedEndBlock + 1,
            number,
            id,
            chain as Chain,
            allowNullTxValues,
            true,
            onConflict
          );
          recordedBlocks[`${bridgeDbName}:${chain}`] = recordedBlocks[`${bridgeDbName}:${chain}`] || {};
          recordedBlocks[`${bridgeDbName}:${chain}`].startBlock =
            recordedBlocks[`${bridgeDbName}:${chain}`]?.startBlock ?? lastRecordedEndBlock + 1;
          recordedBlocks[`${bridgeDbName}:${chain}`].endBlock = number;
        } catch (e) {
          const errString = `Adapter txs for ${bridgeDbName} on chain ${chain} failed, skipped.`;
          await insertErrorRow({
            ts: getCurrentUnixTimestamp() * 1000,
            target_table: "transactions",
            keyword: "data",
            error: errString,
          });
          console.error(errString, e);
        }
      })
    );
    await adapterPromises;
  }
  // need better error catching
  await store("recordedBlocks.json", JSON.stringify(recordedBlocks));
  console.log("runAllAdaptersToCurrentBlock successfully ran.");
};

export const runAllAdaptersTimestampRange = async (
  allowNullTxValues: boolean = false,
  onConflict: "ignore" | "error" | "upsert" = "error",
  startTimestamp: number,
  endTimestamp: number
) => {

  for (const bridgeNetwork of bridgeNetworks) {
    const { id, bridgeDbName } = bridgeNetwork;
    const adapter = adapters[bridgeDbName];
    if (!adapter) {
      const errString = `Adapter for ${bridgeDbName} not found, check it is exported correctly.`;
      await insertErrorRow({
        ts: getCurrentUnixTimestamp() * 1000,
        target_table: "transactions",
        keyword: "critical",
        error: errString,
      });
      throw new Error(errString);
    }
    await insertConfigEntriesForAdapter(adapter, bridgeDbName);
    const adapterPromises = Promise.all(
      Object.keys(adapter).map(async (chain, i) => {
        await wait(100 * i); // attempt to space out API calls
        const chainContractsAreOn = bridgeNetwork.chainMapping?.[chain as Chain]
          ? bridgeNetwork.chainMapping?.[chain as Chain]
          : chain;
          const startBlock = (await lookupBlock(startTimestamp, {chain: chainContractsAreOn as Chain})).block
          const endBlock = (await lookupBlock(endTimestamp, {chain: chainContractsAreOn as Chain})).block 
        try {
          await runAdapterHistorical(
            startBlock,
            endBlock,
            id,
            chain as Chain,
            allowNullTxValues,
            true,
            onConflict
          );
        } catch (e) {
          const errString = `Adapter txs for ${bridgeDbName} on chain ${chain} failed, skipped.`;
          await insertErrorRow({
            ts: getCurrentUnixTimestamp() * 1000,
            target_table: "transactions",
            keyword: "data",
            error: errString,
          });
          console.error(errString, e);
        }
      })
    );
    await adapterPromises;
  }
  // need better error catching
  console.log("runAllAdaptersTimestampRange successfully ran.");
};

export const runAdapterHistorical = async (
  startBlock: number,
  endBlock: number,
  bridgeNetworkId: number,
  chain: string, // needed because different chains query over different block ranges
  allowNullTxValues: boolean = false,
  throwOnFailedInsert: boolean = true,
  onConflict: "ignore" | "error" | "upsert" = "error"
) => {
  const bridgeNetwork = bridgeNetworks.filter((bridgeNetwork) => bridgeNetwork.id === bridgeNetworkId)[0];
  const { bridgeDbName } = bridgeNetwork;
  const adapter = adapters[bridgeDbName];
  if (!adapter) {
    const errString = `Adapter for ${bridgeDbName} not found, check it is exported correctly.`;
    await insertErrorRow({
      ts: getCurrentUnixTimestamp() * 1000,
      target_table: "transactions",
      keyword: "critical",
      error: errString,
    });
    throw new Error(errString);
  }
  const adapterChainEventsFn = adapter[chain];
  if (!adapterChainEventsFn) {
    const errString = `Chain ${chain} not found on adapter ${bridgeDbName}.`;
    await insertErrorRow({
      ts: getCurrentUnixTimestamp() * 1000,
      target_table: "transactions",
      keyword: "critical",
      error: errString,
    });
    throw new Error(errString);
  }
  const chainContractsAreOn = bridgeNetwork.chainMapping?.[chain as Chain]
    ? bridgeNetwork.chainMapping?.[chain as Chain]
    : chain;
  const provider = getProvider(chainContractsAreOn as Chain) as any;
  if (!provider) {
    const errString = `Could not get provider for chain ${chainContractsAreOn}.`;
    await insertErrorRow({
      ts: getCurrentUnixTimestamp() * 1000,
      target_table: "transactions",
      keyword: "critical",
      error: errString,
    });
    throw new Error(errString);
  }
  const bridgeID = (await getBridgeID(bridgeDbName, chain))?.id;
  if (!bridgeID) {
    const errString = `${bridgeDbName} on chain ${chain} is missing in config table.`;
    await insertErrorRow({
      ts: getCurrentUnixTimestamp() * 1000,
      target_table: "transactions",
      keyword: "critical",
      error: errString,
    });
    throw new Error(errString);
  }
  const maxBlocksToQuery = maxBlocksToQueryByChain[chainContractsAreOn]
    ? maxBlocksToQueryByChain[chainContractsAreOn]
    : maxBlocksToQueryByChain.default;
  let block = endBlock;
  console.log(`Searching for transactions for ${bridgeID} from ${startBlock} to ${block}.`);
  while (block > startBlock) {
    const startBlockForQuery = Math.max(startBlock, block - maxBlocksToQuery);
    try {
      const eventLogs = await adapterChainEventsFn(startBlockForQuery, block);
      // console.log(eventLogs);
      if (eventLogs.length === 0) {
        console.log(`No transactions found for ${bridgeID} from ${startBlockForQuery} to ${block}.`);
        block = startBlockForQuery - 1;
        continue;
      }
      console.log(
        `${eventLogs.length} transactions were found for ${bridgeID} from ${startBlockForQuery} to ${block}.`
      );
      await sql.begin(async (sql) => {
        let txBlocks = [] as number[];
        eventLogs.map((log) => {
          const { blockNumber } = log;
          txBlocks.push(blockNumber);
        });
        const minBlock = Math.min(...txBlocks) ?? 0;
        const maxBlock = Math.max(...txBlocks) ?? 0;
        const blockRange = maxBlock - minBlock || 1;
        // dividing blocks into 10 buckets and giving all blocks within a bucket the same timestamp,
        // in order to reduce number of getBlock calls
        let blockTimestamps = {} as { [bucket: number]: number };
        let block = {} as { timestamp: number; number: number };
        for (let i = 0; i < 10; i++) {
          const blockNumber = Math.floor(minBlock + i * (blockRange / 10));
          for (let j = 0; j < 4; j++) {
            try {
              // add timeout?
              block = await provider.getBlock(blockNumber);
              if (block.timestamp) {
                blockTimestamps[i] = block.timestamp;
                break;
              }
            } catch (e) {
              console.error(`Failed to get block for block number ${blockNumber} on chain ${chainContractsAreOn}`);
              if (j >= 3) {
                throw new Error(
                  `Failed to get block timestamps at block number ${blockNumber} on chain ${chainContractsAreOn}`
                );
              }
            }
          }
        }

        const eventLogPromises = Promise.all(
          eventLogs.map(async (log) => {
            const { txHash, blockNumber, from, to, token, amount, isDeposit } = log;
            const bucket = Math.floor(((blockNumber - minBlock) * 9) / blockRange);
            const timestamp = blockTimestamps[bucket] * 1000;
            const amountString = amount.toString();
            await insertTransactionRow(
              sql,
              allowNullTxValues,
              {
                bridge_id: bridgeID,
                chain: chainContractsAreOn,
                tx_hash: txHash ?? null,
                ts: timestamp,
                tx_block: blockNumber ?? null,
                tx_from: from ?? null,
                tx_to: to ?? null,
                token: token,
                amount: amountString,
                is_deposit: isDeposit,
              },
              onConflict
            );
          })
        );
        await eventLogPromises;
      });
      console.log("finished inserting transactions");
    } catch (e) {
      const errString = `Adapter for ${bridgeDbName} failed to get and insert logs for chain ${chain} for blocks ${startBlockForQuery}-${block}.`;
      await insertErrorRow({
        ts: getCurrentUnixTimestamp() * 1000,
        target_table: "transactions",
        keyword: "missingBlocks",
        error: errString,
      });
      if (throwOnFailedInsert) {
        throw new Error(errString + e);
      }
      console.error(errString, e);
    }
    block = startBlockForQuery - 1;
  }
  console.log("finished inserting all transactions");
};

export const insertConfigEntriesForAdapter = async (
  adapter: BridgeAdapter,
  bridgeDbName: string,
  destinationChain?: string
) => {
  await Object.keys(adapter).map(async (chain) => {
    const existingEntry = await getBridgeID(bridgeDbName, chain);
    if (existingEntry) {
      console.log(`Config already exists for ${bridgeDbName} on chain ${chain}, skipping.`);
      return;
    }
    await sql.begin(async (sql) => {
      await insertConfigRow(sql, { bridge_name: bridgeDbName, chain: chain, destination_chain: destinationChain });
    });
  });
};
