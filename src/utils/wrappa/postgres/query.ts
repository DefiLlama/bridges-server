import { querySql as sql } from "../../db";

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
  origin_chain?: string;
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

type TimePeriod = "day" | "week" | "month";

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
  let conditions = sql`WHERE date_trunc('day', dv.ts) >= to_timestamp(${startTimestamp})::date 
    AND date_trunc('day', dv.ts) <= to_timestamp(${endTimestamp})::date`;

  if (chain) {
    conditions = sql`${conditions} AND dv.chain = ${chain}`;
  }

  if (bridgeNetworkName) {
    conditions = sql`${conditions} AND c.bridge_name = ${bridgeNetworkName}`;
  }

  const result = await sql<IAggregatedData[]>`
    SELECT 
      dv.bridge_id,
      dv.ts,
      CAST(SUM(dv.total_deposited_usd) AS TEXT) as total_deposited_usd,
      CAST(SUM(dv.total_withdrawn_usd) AS TEXT) as total_withdrawn_usd,
      CAST(COALESCE(SUM(dv.total_deposit_txs), 0) AS INTEGER) as total_deposit_txs,
      CAST(COALESCE(SUM(dv.total_withdrawal_txs), 0) AS INTEGER) as total_withdrawal_txs,
      dv.chain
    FROM 
      bridges.daily_volume dv
    JOIN
      bridges.config c ON dv.bridge_id = c.id
    ${conditions}
    GROUP BY 
      dv.bridge_id,
      dv.ts,
      dv.chain
    ORDER BY ts;
  `;
  return result;
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

type VolumeType = "deposit" | "withdrawal" | "both";

const getLast24HVolume = async (bridgeName: string, volumeType: VolumeType = "both"): Promise<number> => {
  const twentyFourHoursAgo = Math.floor(Date.now() / 1000) - 26 * 60 * 60;

  let volumeColumn = sql``;
  switch (volumeType) {
    case "deposit":
      volumeColumn = sql`total_deposited_usd`;
      break;
    case "withdrawal":
      volumeColumn = sql`total_withdrawn_usd`;
      break;
    case "both":
    default:
      volumeColumn = sql`(total_deposited_usd + total_withdrawn_usd)`;
      break;
  }

  const result = await sql<{ total_volume: string }[]>`
    SELECT COALESCE(SUM(${volumeColumn}), 0) as total_volume
    FROM bridges.hourly_volume ha
    JOIN bridges.config c ON ha.bridge_id = c.id
    WHERE c.bridge_name = ${bridgeName}
      AND ha.ts >= to_timestamp(${twentyFourHoursAgo})
  `;

  return parseFloat((+result[0].total_volume / 2).toString());
};

const getNetflows = async (period: TimePeriod) => {
  let intervalPeriod = sql``;
  switch (period) {
    case "day":
      intervalPeriod = sql`interval '1 day'`;
      break;
    case "week":
      intervalPeriod = sql`interval '1 week'`;
      break;
    case "month":
      intervalPeriod = sql`interval '1 month'`;
      break;
  }

  return await sql<{ chain: string; net_flow: string }[]>`
    WITH period_flows AS (
      SELECT 
        hv.chain,
        SUM(CASE 
          WHEN c.destination_chain IS NULL THEN (hv.total_withdrawn_usd - hv.total_deposited_usd)
          ELSE (hv.total_deposited_usd - hv.total_withdrawn_usd)
        END) as net_flow
      FROM bridges.daily_volume hv
      JOIN bridges.config c ON hv.bridge_id = c.id
      WHERE hv.ts >= date_trunc('day', NOW() AT TIME ZONE 'UTC') - ${intervalPeriod}
      AND hv.ts < date_trunc('day', NOW() AT TIME ZONE 'UTC')
      AND LOWER(hv.chain) NOT LIKE '%dydx%'
      GROUP BY hv.chain
    )
    SELECT 
      chain,
      net_flow::text
    FROM period_flows
    WHERE net_flow IS NOT NULL
    ORDER BY ABS(net_flow::numeric) DESC;
  `;
};

const queryAggregatedTokensInRange = async (
  startTimestamp: number,
  endTimestamp: number,
  chain?: string,
  bridgeNetworkName?: string
) => {
  let conditions = sql`WHERE ha.ts >= to_timestamp(${startTimestamp})::date 
    AND ha.ts <= to_timestamp(${endTimestamp})::date`;

  if (chain) {
    conditions = sql`${conditions} AND c.chain = ${chain}`;
  }

  if (bridgeNetworkName) {
    conditions = sql`${conditions} AND c.bridge_name = ${bridgeNetworkName}`;
  }

  return await sql<
    {
      bridge_id: string;
      ts: Date;
      total_tokens_deposited: string[];
      total_tokens_withdrawn: string[];
      total_address_deposited: string[];
      total_address_withdrawn: string[];
    }[]
  >`
    SELECT 
      ha.bridge_id,
      ha.ts,
      ha.total_tokens_deposited,
      ha.total_tokens_withdrawn,
      ha.total_address_deposited,
      ha.total_address_withdrawn
    FROM 
      bridges.hourly_aggregated ha
    JOIN
      bridges.config c ON ha.bridge_id = c.id
    ${conditions}
    ORDER BY ts;
  `;
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
  getLast24HVolume,
  getNetflows,
  queryAggregatedTokensInRange,
};
