import { GraphQLClient, RequestDocument } from "graphql-request";
import { EventData } from "../../utils/types";
import {
  DefillamaTxsByBlockDocument,
  DefillamaTxsByBlockQueryResult,
  DefillamaTxsLastBlockDocument,
  DefillamaTxsLastBlockQueryResult,
  DefillamaTxsFirstBlockDocument,
  DefillamaTxsFirstBlockQueryResult,
  DefillamaLatestBlockForZoneQueryResult,
  DefillamaLatestBlockForZoneDocument,
} from "./IBCTxsPage/__generated__/IBCTxsTable.query.generated";
import retry from "async-retry";
import { formatError, isAbortError, NonRetryableError, throwIfAborted } from "../../utils/errors";
const endpoint = "https://api2.mapofzones.com/v1/graphql";
const graphQLClient = new GraphQLClient(endpoint);
const MAP_OF_ZONES_RETRIES = 2;

const requestWithTimeout = async <T>(
  query: RequestDocument,
  variables = {},
  timeout = 5000,
  signal?: AbortSignal
): Promise<T> => {
  throwIfAborted(signal);
  const controller = new AbortController();
  const abortFromParent = () => controller.abort();
  signal?.addEventListener("abort", abortFromParent, { once: true });
  if (signal?.aborted) controller.abort();
  let timeoutHandle: NodeJS.Timeout | undefined;
  let timedOut = false;
  timeoutHandle = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeout);

  try {
    return await graphQLClient.request<T>({
      document: query,
      variables,
      signal: controller.signal,
    });
  } catch (error) {
    if (timedOut) throw new Error(`GraphQL request timed out after ${timeout}ms`);
    throw error;
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
    signal?.removeEventListener("abort", abortFromParent);
  }
};

export const getLatestBlockForZone = async (
  zoneId: string,
  signal?: AbortSignal
): Promise<
  | {
      block: number;
      timestamp: number;
    }
  | undefined
> => {
  const variables = {
    zone: zoneId,
  };
  try {
    return await retry(
      async (bail) => {
        throwIfAborted(signal);
        try {
          const data = await requestWithTimeout<DefillamaLatestBlockForZoneQueryResult>(
            DefillamaLatestBlockForZoneDocument,
            variables,
            5000,
            signal
          );

          if (!data) {
            return undefined;
          }

          if (!Array.isArray(data.ibc_transfer_txs) || data.ibc_transfer_txs.length === 0) {
            return undefined;
          }

          return {
            block: data.ibc_transfer_txs[0].height,
            timestamp: data.ibc_transfer_txs[0].timestamp,
          };
        } catch (error) {
          if (isAbortError(error) || signal?.aborted) {
            bail(error as Error);
            throw error;
          }
          throw error;
        }
      },
      {
        retries: MAP_OF_ZONES_RETRIES,
        factor: 2,
        minTimeout: 500,
        maxTimeout: 2_000,
      }
    );
  } catch (e) {
    if (isAbortError(e) || signal?.aborted) throw e;
    throw new Error(`Failed to fetch latest MapOfZones block for ${zoneId}: ${formatError(e)}`);
  }
};

export const getBlockFromTimestamp = async (
  timestamp: number,
  chainId: string,
  position: "First" | "Last",
  signal?: AbortSignal
): Promise<
  | {
      block: number;
    }
  | undefined
> => {
  if (!["First", "Last"].includes(position)) {
    throw new Error("Invalid position of block");
  }
  const date = new Date(timestamp * 1000);
  const variables = {
    zone: chainId,
    timestamp: date.toISOString(),
  };

  try {
    const block = await retry(
      async (bail) => {
        throwIfAborted(signal);
        try {
          let result: DefillamaTxsFirstBlockQueryResult | DefillamaTxsLastBlockQueryResult | undefined;
          if (position === "First") {
            result = await requestWithTimeout<DefillamaTxsFirstBlockQueryResult>(
              DefillamaTxsFirstBlockDocument,
              variables,
              5000,
              signal
            );
          } else if (position === "Last") {
            result = await requestWithTimeout<DefillamaTxsLastBlockQueryResult>(
              DefillamaTxsLastBlockDocument,
              variables,
              5000,
              signal
            );
          }

          if (!result) {
            return undefined;
          }

          if (result.ibc_transfer_txs.length === 0) {
            return undefined;
          }

          return result.ibc_transfer_txs[0].height;
        } catch (error) {
          if (isAbortError(error) || signal?.aborted) {
            bail(error as Error);
            throw error;
          }
          throw error;
        }
      },
      {
        retries: MAP_OF_ZONES_RETRIES,
        factor: 2,
        minTimeout: 500,
        maxTimeout: 2_000,
      }
    );

    return block
      ? {
          block,
        }
      : undefined;
  } catch (e) {
    if (isAbortError(e) || signal?.aborted) throw e;
    throw new Error(`Failed to fetch MapOfZones ${position} block for ${chainId} at ${timestamp}: ${formatError(e)}`);
  }
};

export const getZoneDataByBlock = async (
  zoneName: string,
  fromBlock: number,
  toBlock: number,
  signal?: AbortSignal
): Promise<DefillamaTxsByBlockQueryResult | undefined> => {
  const variables = {
    zone: zoneName,
    from: fromBlock,
    to: toBlock,
  };
  try {
    return await retry(
      async (bail) => {
        throwIfAborted(signal);
        try {
          return await requestWithTimeout<DefillamaTxsByBlockQueryResult>(
            DefillamaTxsByBlockDocument,
            variables,
            5000,
            signal
          );
        } catch (error) {
          if (isAbortError(error) || signal?.aborted) {
            bail(error as Error);
            throw error;
          }
          throw error;
        }
      },
      {
        retries: MAP_OF_ZONES_RETRIES,
        factor: 2,
        minTimeout: 500,
        maxTimeout: 2_000,
      }
    );
  } catch (e) {
    if (isAbortError(e) || signal?.aborted) throw e;
    throw new NonRetryableError(
      `Failed to fetch MapOfZones data for ${zoneName} from ${fromBlock} to ${toBlock}: ${formatError(e)}`
    );
  }
};

export const getIbcVolumeByZoneId = (chainId: string) => {
  // @ts-ignore
  return async (fromBlock: number, toBlock: number, context?: { signal?: AbortSignal }) => {
    let zoneData: DefillamaTxsByBlockQueryResult | undefined;

    zoneData = await getZoneDataByBlock(chainId, fromBlock, toBlock, context?.signal);

    if (!zoneData) {
      return [];
    }

    return zoneData.ibc_transfer_txs.map(
      (tx: {
        destination_address: string;
        height: any;
        source_address: string;
        timestamp: any;
        tx_hash: string;
        tx_type: string;
        usd_value?: any | null;
        token?: { base_denom: string; logo_url?: string | null; symbol?: string | null } | null;
      }) => {
        let from = tx.source_address;
        let to = tx.destination_address;
        const isDeposit = tx.tx_type === "Deposit";

        if (isDeposit) {
          from = tx.destination_address;
          to = tx.source_address;
        }
        // handle long addresses
        if (to?.length > 42) {
          to = to.slice(0, 42) + "...";
        }
        if (from?.length > 42) {
          from = from.slice(0, 42) + "...";
        }

        const date = new Date(tx.timestamp.replace(" ", "T") + "Z");
        const unixTimestamp = Math.floor(date.getTime());

        return {
          blockNumber: tx.height,
          txHash: tx.tx_hash,
          from,
          to,
          token: tx.token?.symbol || tx.token?.base_denom,
          amount: tx.usd_value,
          isDeposit,
          isUSDVolume: true,
          txsCountedAs: 1,
          timestamp: unixTimestamp,
        } as EventData;
      }
    );
  };
};
