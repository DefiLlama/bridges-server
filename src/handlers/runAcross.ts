import dayjs from "dayjs";
import adapter, {
  chainIdMapping,
  fetchDeposits,
  convertToDepositEvent,
  convertToWithdrawalEvent,
  AcrossDeposit,
} from "../adapters/across";
import { insertConfigEntriesForAdapter } from "../utils/adapter";
import { chainMappings } from "../helpers/tokenMappings";
import { getBlockByTimestamp } from "../utils/blocks";
import { sql } from "../utils/db";
import { wrapScheduledLambda } from "../utils/wrap";
import { getBridgeID } from "../utils/wrappa/postgres/query";
import { insertTransactionRows } from "../utils/wrappa/postgres/write";
import { Chain } from "@defillama/sdk/build/general";

const CHAINS_CONCURRENCY = 6;
const API_LIMIT = 1000;
const SPLIT_THRESHOLD = 450;
const INSERT_BATCH_SIZE = 2000;
const BLOCK_BOUNDARY_BUFFER = 2000;
const MAX_ALT_CURSOR_PAGES = 50;

const mapLimit = async <T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let inFlight = 0;
  let i = 0;
  return await new Promise<R[]>((resolve, reject) => {
    const launchNext = () => {
      if (i >= items.length && inFlight === 0) return resolve(results);
      while (inFlight < limit && i < items.length) {
        const idx = i++;
        inFlight++;
        fn(items[idx], idx)
          .then((res) => {
            results[idx] = res;
          })
          .catch(reject)
          .finally(() => {
            inFlight--;
            launchNext();
          });
      }
    };
    launchNext();
  });
};

const toDepositKey = (deposit: AcrossDeposit) =>
  `${deposit.depositTxHash || "0x"}:${deposit.fillTx || "0x"}:${deposit.originChainId}:${deposit.destinationChainId || 0}:${deposit.depositId ?? ""}:${deposit.depositBlockNumber ?? ""}:${deposit.fillBlockNumber ?? ""}`;

const dedupeDeposits = (deposits: AcrossDeposit[]) => {
  const deduped = new Map<string, AcrossDeposit>();
  for (const deposit of deposits) {
    const key = toDepositKey(deposit);
    deduped.set(key, deposit);
  }
  return [...deduped.values()];
};

const filterByBlockRange = (
  deposits: AcrossDeposit[],
  startBlock: number,
  endBlock: number,
  getBlock: (deposit: AcrossDeposit) => number | undefined
) =>
  deposits.filter((deposit) => {
    const block = getBlock(deposit);
    if (block === undefined || block === null) return false;
    return block >= startBlock && block <= endBlock;
  });

const fetchByAlternateCursor = async (
  paramsWithoutSkip: Record<string, string | number>,
  startBlock: number,
  endBlock: number,
  getBlock: (deposit: AcrossDeposit) => number | undefined
): Promise<AcrossDeposit[]> => {
  const all: AcrossDeposit[] = [];
  const seenPageFingerprints = new Set<string>();

  for (let page = 0; page <= MAX_ALT_CURSOR_PAGES; page++) {
    const skip = page * API_LIMIT;
    const pageRows = await fetchDeposits({
      ...paramsWithoutSkip,
      limit: API_LIMIT,
      skip,
    });

    const filtered = filterByBlockRange(pageRows, startBlock, endBlock, getBlock);
    all.push(...filtered);

    const fingerprint = pageRows.slice(0, 25).map(toDepositKey).join("|");
    if (seenPageFingerprints.has(fingerprint)) {
      throw new Error(
        `[across][critical-truncation] Alternate cursor stalled: repeated page fingerprint at skip=${skip}`
      );
    }
    seenPageFingerprints.add(fingerprint);

    if (pageRows.length < API_LIMIT) {
      return dedupeDeposits(all);
    }
  }

  throw new Error(
    `[across][critical-truncation] Alternate cursor exceeded max pages (${MAX_ALT_CURSOR_PAGES}) for params ${JSON.stringify(
      paramsWithoutSkip
    )}`
  );
};

const fetchDeterministicByBlock = async (
  baseParams: Record<string, string | number>,
  startBlock: number,
  endBlock: number,
  getBlock: (deposit: AcrossDeposit) => number | undefined,
  startParamKey: string,
  endParamKey: string
): Promise<AcrossDeposit[]> => {
  const params = {
    ...baseParams,
    [startParamKey]: startBlock,
    [endParamKey]: endBlock,
    limit: API_LIMIT,
    skip: 0,
  };

  const deposits = await fetchDeposits(params);
  const filtered = filterByBlockRange(deposits, startBlock, endBlock, getBlock);

  const shouldSplit = deposits.length >= SPLIT_THRESHOLD || filtered.length >= SPLIT_THRESHOLD;

  if (shouldSplit && endBlock > startBlock) {
    const mid = Math.floor((startBlock + endBlock) / 2);
    const [left, right] = await Promise.all([
      fetchDeterministicByBlock(baseParams, startBlock, mid, getBlock, startParamKey, endParamKey),
      fetchDeterministicByBlock(baseParams, mid + 1, endBlock, getBlock, startParamKey, endParamKey),
    ]);
    return dedupeDeposits([...left, ...right]);
  }

  if (shouldSplit && endBlock === startBlock) {
    if (deposits.length >= API_LIMIT) {
      console.error(
        `[across][metric] unsplittable_full_page_detected block=${startBlock} params=${JSON.stringify(baseParams)}`
      );
      const recovered = await fetchByAlternateCursor(
        {
          ...baseParams,
          [startParamKey]: startBlock,
          [endParamKey]: endBlock,
        },
        startBlock,
        endBlock,
        getBlock
      );
      if (recovered.length >= API_LIMIT) {
        throw new Error(
          `[across][critical-truncation] Unable to prove completeness at block ${startBlock} after alternate cursor recovery`
        );
      }
      return recovered;
    }

    throw new Error(
      `[across][critical-truncation] Unsplittable dense block ${startBlock} with ambiguous completeness for params ${JSON.stringify(
        baseParams
      )}`
    );
  }

  return filtered;
};

const chunk = <T>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
};

const parseTimestampMs = (value?: string): number | undefined => {
  if (!value) return undefined;
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : undefined;
};

const withinTsWindow = (timestamp?: string, startTs?: number, endTs?: number): boolean => {
  if (startTs === undefined || endTs === undefined) return true;
  const ms = parseTimestampMs(timestamp);
  if (ms === undefined) return false;
  return ms >= startTs * 1000 && ms <= endTs * 1000;
};

export const handler = async () => {
  try {
    await insertConfigEntriesForAdapter(adapter, "across");

    const bridgeIds = Object.fromEntries(
      await Promise.all(
        Object.keys(adapter).map(async (chain) => {
          const bridgeId = await getBridgeID("across", chain.toLowerCase());
          return [chain.toLowerCase(), bridgeId?.id];
        })
      )
    );

    const startTs = dayjs().subtract(48, "hour").unix();
    const endTs = dayjs().unix();
    console.log(
      `Running Across adapter for ${startTs} (${dayjs
        .unix(startTs)
        .format("YYYY-MM-DD HH:mm:ss")}) to ${endTs} (${dayjs.unix(endTs).format("YYYY-MM-DD HH:mm:ss")})`
    );

    const processChain = async (chain: string): Promise<{ deposits: number; withdrawals: number }> => {
      const label = `[across ${chain}]`;
      let insertedDeposits = 0;
      let insertedWithdrawals = 0;

      console.log(`${label} start`);

      const chainId = chainIdMapping[chain];
      const bridgeId = bridgeIds[chain.toLowerCase()];
      if (!chainId || !bridgeId) {
        return { deposits: 0, withdrawals: 0 };
      }

      const chainForBlocks = (chainMappings[chain.toLowerCase()] ?? chain.toLowerCase()) as Chain;

      try {
        const [startBlockRes, endBlockRes] = await Promise.all([
          getBlockByTimestamp(startTs, chainForBlocks),
          getBlockByTimestamp(endTs, chainForBlocks),
        ]);
        const startBlock = Math.max(0, startBlockRes.block - BLOCK_BOUNDARY_BUFFER);
        const endBlock = endBlockRes.block + BLOCK_BOUNDARY_BUFFER;

        if (startBlock > endBlock) {
          console.warn(`${label} invalid block range ${startBlock}-${endBlock}, skipping`);
          return { deposits: 0, withdrawals: 0 };
        }

        const sourceTransactions: any[] = [];
        const destinationTransactions: any[] = [];

        const deposits = await fetchDeterministicByBlock(
          { originChainId: chainId },
          startBlock,
          endBlock,
          (deposit) => deposit.depositBlockNumber,
          "startBlock",
          "endBlock"
        );
        for (const deposit of deposits) {
          if (!withinTsWindow(deposit.depositBlockTimestamp, startTs, endTs)) continue;
          const event = convertToDepositEvent(deposit);
          if (!event) continue;
          sourceTransactions.push({
            bridge_id: bridgeId,
            chain: chain.toLowerCase(),
            tx_hash: event.txHash,
            ts: event.timestamp ?? startTs * 1000,
            tx_block: event.blockNumber || null,
            tx_from: event.from ?? "0x",
            tx_to: event.to ?? "0x",
            token: event.token ?? "0x0000000000000000000000000000000000000000",
            amount: event.amount?.toString?.() || "0",
            is_deposit: true,
            is_usd_volume: false,
            txs_counted_as: 0,
            origin_chain: null,
          });
        }

        const withdrawals = await fetchDeterministicByBlock(
          { destinationChainId: chainId, status: "filled" },
          startBlock,
          endBlock,
          (deposit) => deposit.fillBlockNumber,
          "startFillBlock",
          "endFillBlock"
        );
        for (const deposit of withdrawals) {
          if (!withinTsWindow(deposit.fillBlockTimestamp, startTs, endTs)) continue;
          const event = convertToWithdrawalEvent(deposit);
          if (!event) continue;
          destinationTransactions.push({
            bridge_id: bridgeId,
            chain: chain.toLowerCase(),
            tx_hash: event.txHash,
            ts: event.timestamp ?? startTs * 1000,
            tx_block: event.blockNumber || null,
            tx_from: event.from ?? "0x",
            tx_to: event.to ?? "0x",
            token: event.token ?? "0x0000000000000000000000000000000000000000",
            amount: event.amount?.toString?.() || "0",
            is_deposit: false,
            is_usd_volume: false,
            txs_counted_as: 0,
            origin_chain: null,
          });
        }

        if (sourceTransactions.length || destinationTransactions.length) {
          const sourceChunks = chunk(sourceTransactions, INSERT_BATCH_SIZE);
          const destinationChunks = chunk(destinationTransactions, INSERT_BATCH_SIZE);
          await sql.begin(async (sql) => {
            for (const rows of sourceChunks) {
              await insertTransactionRows(sql, true, rows, "upsert");
            }
            for (const rows of destinationChunks) {
              await insertTransactionRows(sql, true, rows, "upsert");
            }
          });
        }

        insertedDeposits += sourceTransactions.length;
        insertedWithdrawals += destinationTransactions.length;
        console.log(`${label} inserted ${sourceTransactions.length} deposits, ${destinationTransactions.length} withdrawals`);
      } catch (error) {
        console.error(`${label} failed:`, error);
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("[across][critical-truncation]")) {
          throw error;
        }
      }

      console.log(`${label} complete`);
      return { deposits: insertedDeposits, withdrawals: insertedWithdrawals };
    };

    const chains = Object.keys(adapter);
    const chainTotals = await mapLimit(chains, CHAINS_CONCURRENCY, (chain) => processChain(chain));
    const totalDeposits = chainTotals.reduce((acc, curr) => acc + (curr?.deposits || 0), 0);
    const totalWithdrawals = chainTotals.reduce((acc, curr) => acc + (curr?.withdrawals || 0), 0);
    console.log(`Across processing complete. Inserted ${totalDeposits} deposits and ${totalWithdrawals} withdrawals.`);
  } catch (error) {
    console.error("Fatal error in Across handler:", error);
    throw error;
  }
};

export default wrapScheduledLambda(handler);
