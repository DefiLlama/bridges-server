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
import retry from "async-retry"
const endpoint = "https://api2.mapofzones.com/v1/graphql";
const graphQLClient = new GraphQLClient(endpoint);

const requestWithTimeout = async <T>(query: RequestDocument, variables = {}, timeout = 5000): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('GraphQL request timed out'));
    }, timeout);
  });

  const data = await Promise.race([
    graphQLClient.request(query, variables) as T,
    timeoutPromise,
  ]);
  return data;
};

export const getLatestBlockForZone = async (zoneId: string): Promise<{
  block: number;
  timestamp: number;
} | undefined> => {
  const variables = {
    zone: zoneId,
  };
  try {
    return await retry(async () => {
      const data = await requestWithTimeout<DefillamaLatestBlockForZoneQueryResult>(DefillamaLatestBlockForZoneDocument, variables)

      if(!data) {
        return undefined;
      }

      if(!Array.isArray(data.ibc_transfer_txs) || data.ibc_transfer_txs.length === 0) {
        return undefined;
      }

      return {
        block: data.ibc_transfer_txs[0].height,
        timestamp: data.ibc_transfer_txs[0].timestamp,
      };
    }, {
      retries: 5,
    });
  } catch(e) {
    console.error(`Max attempts reached for fetching latest block for ${zoneId}`);
  }

}

export const getBlockFromTimestamp = async (timestamp: number, chainId: string, position: "First" | "Last"): Promise<{
  block: number;
} | undefined> => {
  if (![ "First", "Last"].includes(position)) {
    throw new Error("Invalid position of block");
  }
  const date = new Date(timestamp * 1000);
  const variables = {
    zone: chainId,
    timestamp: date.toISOString(),
  };

  try {
    const block = await retry(async () => {
      let result: DefillamaTxsFirstBlockQueryResult | DefillamaTxsLastBlockQueryResult | undefined;
      if (position === "First") {
        result = await requestWithTimeout<DefillamaTxsFirstBlockQueryResult>(DefillamaTxsFirstBlockDocument, variables);
      } else if (position === "Last") {
        result = await requestWithTimeout<DefillamaTxsLastBlockQueryResult>(DefillamaTxsLastBlockDocument, variables);
      }

      if(!result) {
        return undefined;
      }

      if(result.ibc_transfer_txs.length === 0) {
        return undefined;
      }

      return result.ibc_transfer_txs[0].height;
    }, {
      retries: 5,
    });

    return block ? {
      block
    } :  undefined;
  } catch(e) {
    console.error(`Max attempts reached for fetching ${chainId} at ${position} block from ${timestamp}`);
  }

};

export const getZoneDataByBlock = async (
  zoneName: string,
  fromBlock: number,
  toBlock: number
): Promise<DefillamaTxsByBlockQueryResult | undefined> => {
  const variables = {
    zone: zoneName,
    from: fromBlock,
    to: toBlock,
  };
  try {
    return await retry(async () => {
      return await requestWithTimeout<DefillamaTxsByBlockQueryResult>(DefillamaTxsByBlockDocument, variables);
    }
    , {
      retries: 5,
    });
  }
  catch(e) {
    console.error(`Max attempts reached for fetching data for ${zoneName} from block ${fromBlock} to ${toBlock}`);
  }
}

export const getIbcVolumeByZoneId = (chainId: string) => {
  // @ts-ignore
  return async (fromBlock: number, toBlock: number) => {

    let zoneData: DefillamaTxsByBlockQueryResult | undefined;

    zoneData = await getZoneDataByBlock(chainId, fromBlock, toBlock);

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
          to = to.slice(0, 42) + '...';
        }
        if (from?.length > 42) {
          from = from.slice(0, 42) + '...';
        }

        const date = new Date(tx.timestamp.replace(' ', 'T') + 'Z');
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
