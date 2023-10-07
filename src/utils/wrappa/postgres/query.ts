import type { Chain } from "@defillama/sdk/build/general";
import { sql } from "../../db";

interface IConfig {
  id: string;
  bridge_name: string;
  chain: string;
  destination_chain: number;
}

interface IConfigID {
  id: string;
}

interface ITransaction {
  id?: number;
  bridge_id: string;
  chain: string;
  tx_hash?: string;
  ts: Date;
  tx_block?: number;
  tx_from?: string;
  tx_to?: string;
  token: string;
  amount: string;
  is_deposit: boolean;
  usd_value?: number;
  is_usd_volume?: boolean;
  txs_counted_as?: number;
}

interface IAggregatedData {
  bridge_id: string;
  ts: Date;
  total_tokens_deposited: string[];
  total_tokens_withdrawn: string[];
  total_deposited_usd: string;
  total_withdrawn_usd: string;
  total_deposit_txs: number;
  total_withdrawal_txs: number;
  total_address_deposited: string[];
  total_address_withdrawn: string[];
}

const getBridgeID = async (bridgNetworkName: string, chain: string) => {
  return (
    await sql<IConfigID[]>`
  SELECT id FROM 
    bridges.config
  WHERE 
    bridge_name = ${bridgNetworkName} AND 
    chain = ${chain};
  `
  )[0];
};

const getConfigsWithDestChain = async () => {
  return await sql<IConfig[]>`
    SELECT
      *
    FROM
      bridges.config
    WHERE
      destination_chain IS NOT NULL
  `;
};

const queryConfig = async (bridgeNetworkName?: string, chain?: string, destinationChain?: string) => {
  // this isn't written propery; can either query by bridgeNetworkName, or a combination of chain/destChain.
  let bridgeNetworkNameEqual = sql``;
  if (!(chain || destinationChain)) {
    if (bridgeNetworkName) {
      bridgeNetworkNameEqual = sql`WHERE bridge_name = ${bridgeNetworkName}`;
    }
  }
  let chainEqual = sql``;
  let destinationChainEqual = sql``;
  if (chain && destinationChain) {
    chainEqual = sql`
    WHERE chain = ${chain} AND
    destination_chain = ${destinationChain}
    `;
  } else {
    chainEqual = chain ? sql`WHERE chain = ${chain}` : sql``;
    destinationChainEqual = destinationChain ? sql`WHERE destination_chain = ${destinationChain}` : sql``;
  }
  return await sql<IConfig[]>`
  SELECT * FROM 
    bridges.config
    ${chainEqual}
    ${destinationChainEqual}
    ${bridgeNetworkNameEqual}
  `;
};

// need to FIX 'to_timestamp' throughout so I can pass already formatted timestamps**********************
const queryTransactionsTimestampRangeByBridge = async (
  startTimestamp: number,
  endTimestamp: number,
  bridgeID: string
) => {
  return await sql<ITransaction[]>`
  SELECT * FROM 
    bridges.transactions
  WHERE 
    ts >= to_timestamp(${startTimestamp}) AND 
    ts <= to_timestamp(${endTimestamp}) AND
    bridge_id = ${bridgeID}
  `;
};

// This doesn't return data on tokens and addresses, only volume and tx numbers.
const queryAggregatedDailyTimestampRange = async (
  startTimestamp: number,
  endTimestamp: number,
  chain?: string,
  bridgeNetworkName?: string
) => {
  let bridgeNetworkNameEqual = sql``;
  let chainEqual = sql``;
  if (bridgeNetworkName && chain) {
    bridgeNetworkNameEqual = sql`
    WHERE bridge_name = ${bridgeNetworkName} AND
    chain = ${chain}
    `;
  } else {
    bridgeNetworkNameEqual = bridgeNetworkName ? sql`WHERE bridge_name = ${bridgeNetworkName}` : sql``;
    chainEqual = chain ? sql`WHERE chain = ${chain}` : sql``;
  }
  return await sql<IAggregatedData[]>`
  SELECT 
    bridge_id, 
    date_trunc('day', ts) AS ts, 
    CAST(SUM(total_deposited_usd) AS INTEGER) AS total_deposited_usd, 
    CAST(SUM(total_withdrawn_usd) AS INTEGER) AS total_withdrawn_usd, 
    CAST(SUM(total_deposit_txs) AS INTEGER) AS total_deposit_txs, 
    CAST(SUM(total_withdrawal_txs) AS INTEGER) AS total_withdrawal_txs 
  FROM 
    bridges.hourly_aggregated
  WHERE
  ts >= to_timestamp(${startTimestamp}) AND 
  ts <= to_timestamp(${endTimestamp}) AND 
   ts < DATE_TRUNC('day', NOW()) AND
    bridge_id IN (
      SELECT id FROM
        bridges.config
      ${bridgeNetworkNameEqual}
      ${chainEqual}
    )
    AND
    (total_deposited_usd IS NOT NULL AND total_deposited_usd::text ~ '^[0-9]+(\.[0-9]+)?$') AND 
    (total_withdrawn_usd IS NOT NULL AND total_withdrawn_usd::text ~ '^[0-9]+(\.[0-9]+)?$') AND 
    (total_deposit_txs IS NOT NULL AND total_deposit_txs::text ~ '^[0-9]+$') AND 
    (total_withdrawal_txs IS NOT NULL AND total_withdrawal_txs::text ~ '^[0-9]+$')
    GROUP BY 
       bridge_id, 
       date_trunc('day', ts)
    ORDER BY ts;
  `;
};

const queryAggregatedHourlyTimestampRange = async (
  startTimestamp: number,
  endTimestamp: number,
  chain?: string,
  bridgNetworkName?: string
) => {
  let bridgNetworkNameEqual = sql``;
  let chainEqual = sql``;
  if (bridgNetworkName && chain) {
    bridgNetworkNameEqual = sql`
    WHERE bridge_name = ${bridgNetworkName} AND
    chain = ${chain}
    `;
  } else {
    bridgNetworkNameEqual = bridgNetworkName ? sql`WHERE bridge_name = ${bridgNetworkName}` : sql``;
    chainEqual = chain ? sql`WHERE chain = ${chain}` : sql``;
  }
  return await sql<IAggregatedData[]>`
  SELECT bridge_id, ts, total_deposited_usd, total_withdrawn_usd, total_deposit_txs, total_withdrawal_txs FROM 
    bridges.hourly_aggregated
    WHERE
    ts >= to_timestamp(${startTimestamp}) AND 
    ts <= to_timestamp(${endTimestamp}) AND
    bridge_id IN (
      SELECT id FROM
        bridges.config
      ${bridgNetworkNameEqual}
      ${chainEqual}
    )
    ORDER BY ts;
  `;
};

// following 2 are no longer really needed
const queryAggregatedHourlyDataAtTimestamp = async (timestamp: number, chain?: string, bridgNetworkName?: string) => {
  let bridgNetworkNameEqual = sql``;
  let chainEqual = sql``;
  let bridgeIdIn = sql``;
  if (bridgNetworkName && chain) {
    bridgNetworkNameEqual = sql`
    WHERE bridge_name = ${bridgNetworkName} AND
    chain = ${chain}
    `;
  } else {
    bridgNetworkNameEqual = bridgNetworkName ? sql`WHERE bridge_name = ${bridgNetworkName}` : sql``;
    chainEqual = chain ? sql`WHERE chain = ${chain}` : sql``;
  }
  if (bridgNetworkName || chain) {
    bridgeIdIn = sql`AND
    bridge_id IN (
      SELECT id FROM
        bridges.config
      ${bridgNetworkNameEqual}
      ${chainEqual}
    );`;
  }
  return await sql<IAggregatedData[]>`
  SELECT * FROM 
    bridges.hourly_aggregated
  WHERE 
    ts = to_timestamp(${timestamp}) 
    ${bridgeIdIn}
  `;
};

const queryAggregatedDailyDataAtTimestamp = async (timestamp: number, chain?: string, bridgeNetworkName?: string) => {
  let bridgeNetworkCondition = bridgeNetworkName ? sql`AND bc.bridge_name = ${bridgeNetworkName}` : sql``;
  let chainCondition = chain ? sql`AND bc.chain = ${chain}` : sql``;
  let dateStr = new Date(timestamp * 1000).toISOString().split("T")[0];

  return await sql<IAggregatedData[]>`
    SELECT ha.ts::date as ts, ha.* 
    FROM bridges.hourly_aggregated ha
    JOIN (
        SELECT id 
        FROM bridges.config bc
        WHERE 1 = 1 
        ${bridgeNetworkCondition}
        ${chainCondition}
    ) AS subq
    ON ha.bridge_id = subq.id
    WHERE 
        ha.ts::date = ${dateStr}
    `;
};

const queryLargeTransactionsTimestampRange = async (
  chain: string | null,
  startTimestamp: number,
  endTimestamp: number
) => {
  let chainEqual = sql``;
  if (chain) {
    chainEqual = sql`WHERE chain = ${chain} OR destination_chain = ${chain}`;
  }
  return await sql<ITransaction[]>`
  SELECT transactions.id, transactions.bridge_id, transactions.ts, transactions.tx_block, transactions.tx_hash, transactions.tx_from, transactions.tx_to, transactions.token, transactions.amount, transactions.is_deposit, transactions.chain, large_transactions.usd_value
  FROM       bridges.transactions
  INNER JOIN bridges.large_transactions
  ON         transactions.id = large_transactions.tx_pk
  WHERE      transactions.id IN
             (
                    SELECT tx_pk
                    FROM   bridges.large_transactions
                    WHERE  ts >= to_timestamp(${startTimestamp})
                    AND    ts <= to_timestamp(${endTimestamp}))
  AND        bridge_id IN
             (
                    SELECT id
                    FROM   bridges.config ${chainEqual})
  ORDER BY   ts DESC
  `;
};

const queryTransactionsTimestampRangeByBridgeNetwork = async (
  startTimestamp: number,
  endTimestamp?: number,
  bridgeNetworkName?: string,
  chain?: string
) => {
  let timestampLessThan = endTimestamp ? sql`AND transactions.ts <= to_timestamp(${endTimestamp})` : sql``;
  let chainEqual = chain ? sql`WHERE (chain = ${chain} OR destination_chain = ${chain})` : sql``;
  let bridgeNetworkEqual = bridgeNetworkName ? sql`WHERE bridge_name = ${bridgeNetworkName}` : chainEqual;
  if (bridgeNetworkName && chain) {
    bridgeNetworkEqual = sql`${chainEqual} AND bridge_name = ${bridgeNetworkName}`;
  }
  return await sql<ITransaction[]>`
  SELECT transactions.bridge_id,
       transactions.tx_hash,
       transactions.ts,
       transactions.tx_block,
       transactions.tx_from,
       transactions.tx_to,
       transactions.token,
       transactions.amount,
       transactions.is_deposit,
       transactions.chain,
       config.bridge_name,
       config.destination_chain,
       large_transactions.usd_value
FROM   bridges.transactions
       INNER JOIN bridges.config
               ON transactions.bridge_id = config.id
       LEFT JOIN bridges.large_transactions
               ON transactions.id = large_transactions.tx_pk
WHERE  config.id IN (SELECT id
                     FROM   bridges.config
                     ${bridgeNetworkEqual})
       AND transactions.ts >= to_timestamp(${startTimestamp})
       ${timestampLessThan}
ORDER BY transactions.ts DESC
       `;
};

const getLargeTransaction = async (txPK: number, timestamp: number) => {
  return (
    await sql<ITransaction[]>`
  SELECT * FROM 
    bridges.large_transactions
  WHERE 
    ts = ${timestamp} AND 
    tx_pk = ${txPK}
  `
  )[0];
};

export {
  getBridgeID,
  getConfigsWithDestChain,
  getLargeTransaction,
  queryLargeTransactionsTimestampRange,
  queryConfig,
  queryTransactionsTimestampRangeByBridge,
  queryTransactionsTimestampRangeByBridgeNetwork,
  queryAggregatedHourlyDataAtTimestamp,
  queryAggregatedDailyDataAtTimestamp,
  queryAggregatedDailyTimestampRange,
  queryAggregatedHourlyTimestampRange,
};
