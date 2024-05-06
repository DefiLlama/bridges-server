import { GraphQLClient, RequestDocument } from "graphql-request";
import { EventData } from "../../utils/types";
import {
  DefillamaTxsByBlockDocument,
  DefillamaTxsByBlockQueryResult,
  DefillamaTxsLastBlockDocument,
  DefillamaTxsLastBlockQueryResult,
  DefillamaTxsFirstBlockDocument,
  DefillamaTxsFirstBlockQueryResult,
  DefillamaSupportedZonesQueryResult,
  DefillamaSupportedZonesDocument,
  DefillamaLatestBlockForZoneQueryResult,
  DefillamaLatestBlockForZoneDocument,
} from "./IBCTxsPage/__generated__/IBCTxsTable.query.generated";
import retry from "async-retry"

import { convertToUnixTimestamp } from "../../utils/date";
const endpoint = "https://api2.mapofzones.com/v1/graphql";
const graphQLClient = new GraphQLClient(endpoint);

const requestWithTimeout = async <T>(query: RequestDocument, variables = {}, timeout = 40000): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('GraphQL request timed out'));
    }, timeout);
  });

  try {
    const data = await Promise.race([
      graphQLClient.request(query, variables) as T,
      timeoutPromise,
    ]);
    return data;
  } catch (error) {
    console.error('GraphQL request error:', error);
    throw error;
  }
};


export type ChainFromMapOfZones = {
  zone_name: string;
  zone_id: string;
  zone_logo?: string | null;
}

export const getSupportedChains = async (): Promise<
  ChainFromMapOfZones[]
> => {
  const data: DefillamaSupportedZonesQueryResult | undefined = await retry(async () => {
    const variables = {};
    return await requestWithTimeout(DefillamaSupportedZonesDocument, variables);
  }, {
    retries: 5,
    minTimeout: 5000,
    onRetry: (e, attempt) => {
      console.log(`Error fetching supported chains`)
      console.error(e);
      console.log(`Retrying ${attempt} for fetching supported chains`)
    }
  });
  
  if (!data) {
    throw new Error("No zones found");
  }

  if (!data.flat_blockchains) {
    throw new Error("No zones found");
  }

  return data.flat_blockchains.map((zone) => ({
    zone_name: zone.name,
    zone_id: zone.network_id,
    zone_logo: zone.logo_url,
  }));
}

export const getLatestBlockForZone = async (zoneId: string): Promise<{
  block: number;
  timestamp: number;
} | undefined> => {
  const variables = {
    blockchain: zoneId,
  };
  try {
    return await retry(async () => {
      const data = await requestWithTimeout<DefillamaLatestBlockForZoneQueryResult>(DefillamaLatestBlockForZoneDocument, variables)
      const block = {
        block: data.flat_defillama_txs_aggregate.aggregate?.max?.height,
        timestamp: data.flat_defillama_txs_aggregate.aggregate?.max?.timestamp,
      };

      return block ? {
        block: block.block,
        timestamp: block.timestamp,
      } : undefined;
    }, {
      retries: 5,
      minTimeout: 5000,
      onRetry: (e, attempt) => {
        console.log(`Error fetching latest block for ${zoneId}`)
        console.error(e);
        console.log(`Retrying ${attempt} for fetching latest block for ${zoneId}`)
      }
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
    blockchain: chainId,
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

      if(result.flat_defillama_txs.length === 0) {
        return undefined;
      }

      return result.flat_defillama_txs[0].height;
    }, {
      retries: 5,
      minTimeout: 5000,
      onRetry: (e, attempt) => {
        console.log(`Error fetching data for ${chainId} at ${position} block from ${timestamp}`)
        console.error(e);
        console.log(`Retrying ${attempt} for ${chainId} at ${position} block from ${timestamp}`)
      }
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
    blockchain: zoneName,
    from: fromBlock,
    to: toBlock,
  };
  try {
    return await retry(async () => {
      return await requestWithTimeout<DefillamaTxsByBlockQueryResult>(DefillamaTxsByBlockDocument, variables);
    }
    , {
      retries: 5,
      minTimeout: 5000,
      onRetry: (e, attempt) => {
        console.log(`Error fetching data for ${zoneName} from block ${fromBlock} to ${toBlock}`)
        console.error(e);
        console.log(`Retrying ${attempt} for ${zoneName} from block ${fromBlock} to ${toBlock}`)
      }
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

    return zoneData.flat_defillama_txs.map(
      (tx: {
        destination_address: string;
        height: any;
        source_address: string;
        timestamp: any;
        tx_hash: string;
        tx_type: string;
        usd_value?: any | null;
        token?: { denom: string; logo_url?: string | null; symbol?: string | null } | null;
      }) => {
        let from = tx.source_address;
        let to = tx.destination_address;
        const isDeposit = tx.tx_type === "Deposit";

        if (isDeposit) {
          from = tx.destination_address;
          to = tx.source_address;
        }

        const timestamp = convertToUnixTimestamp(new Date(tx.timestamp)) * 1000; 
        
        return {  
          blockNumber: tx.height,
          txHash: tx.tx_hash,
          from,
          to,
          token: tx.token?.symbol || tx.token?.denom,
          amount: tx.usd_value,
          isDeposit,
          isUSDVolume: true,
          txsCountedAs: 1,
          timestamp,
        } as EventData;
      }
    );
  };
};
