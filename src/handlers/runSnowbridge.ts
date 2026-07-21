import { insertConfigEntriesForAdapter } from "../utils/adapter";
import { BridgeAdapter } from "../helpers/bridgeAdapter.type";
import { EventData } from "../utils/types";
import dayjs from "dayjs";
import _ from "lodash";
import { insertTransactionRows } from "../utils/wrappa/postgres/write";
import { getBridgeID } from "../utils/wrappa/postgres/query";
import { sql } from "../utils/db";
import { BigNumber, ethers } from "ethers";
import { getLlamaPrices } from "../utils/prices";
import { createAbortError, NonRetryableError, throwIfAborted } from "../utils/errors";

const bridgeName = "snowbridge";

/** DefiLlama token id for native ETH (used for price). */
const ETH_PRICE_TOKEN_ID = "ethereum:0x0000000000000000000000000000000000000000";

const SNOWBRIDGE_ETHER_API =
  "https://dashboard.snowbridge.network/api/transfers-by-token?token=0x0000000000000000000000000000000000000000";

/** API transfer item from Snowbridge dashboard (toEthereum / toPolkadot) */
interface SnowbridgeTransfer {
  messageId: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  tokenAddress: string;
  amount: string;
  status: number;
  direction: "toEthereum" | "toPolkadot";
}

interface SnowbridgeApiResponse {
  toEthereum: SnowbridgeTransfer[];
  toPolkadot: SnowbridgeTransfer[];
}

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 4;

export const parseRetryAfterMs = (value: string | null, now: number = Date.now()): number | null => {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  const retryAt = Date.parse(value);
  if (Number.isNaN(retryAt)) return null;
  return Math.max(0, retryAt - now);
};

const waitFor = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    throwIfAborted(signal);
    const timeout = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timeout);
      reject(createAbortError());
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });

function toEventData(t: SnowbridgeTransfer, isDeposit: boolean): EventData {
  const ts = new Date(t.timestamp).getTime() / 1000;
  return {
    blockNumber: t.blockNumber,
    txHash: t.txHash,
    from: "0x",
    to: "0x",
    token: t.tokenAddress,
    amount: BigNumber.from(t.amount),
    isDeposit,
    chain: "ethereum",
    timestamp: ts,
  };
}

/**
 * Load ether (native token) transfer events from Snowbridge dashboard API.
 * In DefiLlama context we track this handler on ethereum only.
 * Both directions are merged into ethereum with direction preserved by isDeposit.
 */
export const filterSnowbridgeTransfers = (
  data: SnowbridgeApiResponse,
  fromTimestamp: number,
  toTimestamp: number
): EventData[] => {
  const inRange = (transfer: SnowbridgeTransfer) => {
    const ts = new Date(transfer.timestamp).getTime() / 1000;
    return Number.isFinite(ts) && ts >= fromTimestamp && ts < toTimestamp;
  };

  const toPolkadot = (data.toPolkadot ?? []).filter(inRange).map((transfer) => toEventData(transfer, true));
  const toEthereum = (data.toEthereum ?? []).filter(inRange).map((transfer) => toEventData(transfer, false));
  return [...toPolkadot, ...toEthereum];
};

export const fetchSnowbridgeTransfers = async (
  signal?: AbortSignal,
  fetchImpl: typeof fetch = fetch
): Promise<SnowbridgeApiResponse> => {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    throwIfAborted(signal);
    const requestController = new AbortController();
    let requestTimedOut = false;
    const onParentAbort = () => requestController.abort();
    signal?.addEventListener("abort", onParentAbort, { once: true });
    const timeout = setTimeout(() => {
      requestTimedOut = true;
      requestController.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      const response = await fetchImpl(SNOWBRIDGE_ETHER_API, { signal: requestController.signal });
      if (response.ok) return (await response.json()) as SnowbridgeApiResponse;

      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable) {
        throw new NonRetryableError(`Snowbridge API error: ${response.status} ${response.statusText}`);
      }
      if (attempt === MAX_ATTEMPTS) {
        throw new Error(
          `Snowbridge API error after ${MAX_ATTEMPTS} attempts: ${response.status} ${response.statusText}`
        );
      }
      const retryAfter = parseRetryAfterMs(response.headers.get("retry-after"));
      const delayMs = retryAfter ?? Math.min(1000 * 2 ** (attempt - 1), 10_000);
      console.warn(`[SNOWBRIDGE] Attempt ${attempt} returned ${response.status}; retrying in ${delayMs}ms`);
      await waitFor(delayMs, signal);
    } catch (error) {
      if (signal?.aborted) throw createAbortError();
      if (error instanceof NonRetryableError) throw error;
      if (attempt === MAX_ATTEMPTS) throw error;
      const delayMs = Math.min(1000 * 2 ** (attempt - 1), 10_000);
      console.warn(
        `[SNOWBRIDGE] Attempt ${attempt} failed${requestTimedOut ? " by timeout" : ""}; retrying in ${delayMs}ms`
      );
      await waitFor(delayMs, signal);
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", onParentAbort);
    }
  }
  throw new Error("Snowbridge API retry loop ended unexpectedly");
};

/** Adapter shape for config/bridge IDs only; event fetching is via getEvents. */
const snowbridgeEtherAdapter: BridgeAdapter = {
  ethereum: async () => [],
};

export const handler = async (signal?: AbortSignal) => {
  try {
    throwIfAborted(signal);
    await insertConfigEntriesForAdapter(snowbridgeEtherAdapter, bridgeName);
    const bridgeIds = Object.fromEntries(
      await Promise.all(
        Object.keys(snowbridgeEtherAdapter).map(async (chain) => {
          return [chain, (await getBridgeID(bridgeName, chain)).id];
        })
      )
    );
    console.log(bridgeIds);

    const prices = await getLlamaPrices([ETH_PRICE_TOKEN_ID]);
    const ethPrice = prices[ETH_PRICE_TOKEN_ID]?.price;
    if (typeof ethPrice !== "number" || ethPrice <= 0) {
      throw new Error(`Failed to get ETH price from DefiLlama (got: ${ethPrice})`);
    }

    const startTs = dayjs().subtract(24, "hours").unix();
    const endTs = dayjs().unix();
    const response = await fetchSnowbridgeTransfers(signal);
    const events = filterSnowbridgeTransfers(response, startTs, endTs);
    const transactions = events
      .map((event) => {
        const amountEth = parseFloat(ethers.utils.formatEther(event.amount));
        const amountUsd = amountEth * ethPrice;
        return {
          bridge_id: bridgeIds[event.chain!],
          chain: event.chain!,
          tx_hash: event.txHash,
          ts: (event.timestamp ?? 0) * 1000,
          tx_block: event.blockNumber,
          tx_from: event.from,
          tx_to: event.to,
          token: event.token,
          amount: amountUsd.toString(),
          is_deposit: event.isDeposit,
          is_usd_volume: true,
          txs_counted_as: 1,
          origin_chain: null,
        };
      })
      .filter((tx) => !!tx.bridge_id);

    throwIfAborted(signal);
    await sql.begin(async (sql) => {
      const transactionChunks = _.chunk(transactions, 200);
      for (const batch of transactionChunks) {
        throwIfAborted(signal);
        await insertTransactionRows(sql, true, batch, "upsert");
      }
    });
    console.log(`[SNOWBRIDGE] Inserted ${transactions.length} transactions for ${startTs} to ${endTs}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default handler;
