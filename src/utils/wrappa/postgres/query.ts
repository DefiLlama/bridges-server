import bridgeNetworkData from "../../../data/bridgeNetworkData";
import { querySql as sql } from "../../db";
import { getCache, setCache } from "../../cache";

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

interface IBridgeTxCounts24H {
  bridge_name: string;
  deposit_txs_24h: number;
  withdraw_txs_24h: number;
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
    LOWER(destination_chain) = LOWER(${destinationChain})
    `;
  } else {
    chainEqual = chain ? sql`WHERE chain = ${chain}` : sql``;
    destinationChainEqual = destinationChain ? sql`WHERE LOWER(destination_chain) = LOWER(${destinationChain})` : sql``;
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
  let conditions = sql`WHERE dv.ts = (date_trunc('day', dv.ts AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
    AND dv.ts >= (date_trunc('day', to_timestamp(${startTimestamp}) AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
    AND dv.ts <= (date_trunc('day', to_timestamp(${endTimestamp}) AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')`;

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
  const cacheKey = `largeTxs:${chain ?? "all"}:${startTimestamp}:${endTimestamp}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;
  let chainEqual = sql``;
  if (chain) {
    chainEqual = sql`WHERE chain = ${chain} OR destination_chain = ${chain}`;
  }
  const result = await sql<ITransaction[]>`
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
  await setCache(cacheKey, result, 3600);
  return result;
};

const queryTransactionsTimestampRangeByBridgeNetwork = async (
  startTimestamp: number,
  endTimestamp?: number,
  bridgeNetworkName?: string,
  chain?: string,
  limit?: number
) => {
  let timestampLessThan = endTimestamp ? sql`AND transactions.ts <= to_timestamp(${endTimestamp})` : sql``;
  let bridgeNameCondition = bridgeNetworkName ? sql`AND config.bridge_name = ${bridgeNetworkName}` : sql``;
  let chainCondition = chain ? sql`AND (config.chain = ${chain} OR config.destination_chain = ${chain})` : sql``;
  const limitClause = limit ? sql`LIMIT ${limit}` : sql``;
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
       transactions.is_usd_volume,
       transactions.chain,
       config.bridge_name,
       config.destination_chain,
       large_transactions.usd_value
FROM   bridges.transactions
       INNER JOIN bridges.config
               ON transactions.bridge_id = config.id
       LEFT JOIN bridges.large_transactions
               ON transactions.id = large_transactions.tx_pk
WHERE  transactions.ts >= to_timestamp(${startTimestamp})
       ${timestampLessThan}
       ${bridgeNameCondition}
       ${chainCondition}
ORDER BY transactions.ts DESC
${limitClause}
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
  const bridgeData = bridgeNetworkData.find((bridge) => bridge.bridgeDbName === bridgeName);
  if (!bridgeData) {
    throw new Error(`Bridge with name ${bridgeName} not found`);
  }
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
  const hours = bridgeName === "wormhole" ? 28 : 24; // wormhole has 3h delay
  const result = await sql<{ volume: string; ts: Date; chain: string }[]>`
    WITH LatestTs AS (
      SELECT MAX(ha.ts) as max_ts
      FROM bridges.hourly_volume ha
      JOIN bridges.config c ON ha.bridge_id = c.id
      WHERE c.bridge_name = ${bridgeName}
    )
    SELECT
      ${volumeColumn} as volume,
      ha.ts,
      c.chain
    FROM bridges.hourly_volume ha
    JOIN bridges.config c ON ha.bridge_id = c.id
    CROSS JOIN LatestTs lt
    WHERE c.bridge_name = ${bridgeName}
    AND ha.ts > lt.max_ts - INTERVAL '${sql.unsafe(String(hours))} hours'
    ORDER BY ha.ts DESC
  `;

  const volumeByChain = result.reduce((acc, { volume, chain }) => {
    if (!acc[chain]) {
      acc[chain] = [];
    }
    acc[chain].push(parseFloat(volume));
    return acc;
  }, {} as Record<string, number[]>);

  const totalVolume = Object.values(volumeByChain).reduce((sum, chainVolumes) => {
    const chainSum = chainVolumes.reduce((a, b) => a + b, 0);
    return sum + chainSum;
  }, 0);

  return totalVolume / 2;
};

const getAllLast24HVolumes = async (): Promise<Record<string, number>> => {
  const WORMHOLE_HOURS = 28;
  const DEFAULT_HOURS = 24;

  const result = await sql<{ bridge_name: string; volume: string }[]>`
    WITH per_bridge_latest AS (
      SELECT
        c.bridge_name,
        MAX(ha.ts) AS max_ts
      FROM bridges.hourly_volume ha
      JOIN bridges.config c ON ha.bridge_id = c.id
      GROUP BY c.bridge_name
    ),
    per_bridge_rows AS (
      SELECT
        c.bridge_name,
        (ha.total_deposited_usd + ha.total_withdrawn_usd) AS volume,
        c.chain
      FROM bridges.hourly_volume ha
      JOIN bridges.config c ON ha.bridge_id = c.id
      JOIN per_bridge_latest pbl ON c.bridge_name = pbl.bridge_name
      WHERE ha.ts > pbl.max_ts - make_interval(
        hours => (CASE WHEN c.bridge_name = 'wormhole' THEN ${WORMHOLE_HOURS} ELSE ${DEFAULT_HOURS} END)::int
      )
    ),
    per_bridge_chain AS (
      SELECT bridge_name, chain, SUM(volume) AS chain_volume
      FROM per_bridge_rows
      GROUP BY bridge_name, chain
    )
    SELECT bridge_name, (SUM(chain_volume) / 2)::text AS volume
    FROM per_bridge_chain
    GROUP BY bridge_name
  `;

  return result.reduce((acc, { bridge_name, volume }) => {
    acc[bridge_name] = parseFloat(volume) || 0;
    return acc;
  }, {} as Record<string, number>);
};

const queryBridgeTxCounts24h = async (chain?: string) => {
  if (!chain) {
    return await sql<IBridgeTxCounts24H[]>`
      SELECT
        c.bridge_name,
        CAST(COALESCE(SUM(ha.total_deposit_txs), 0) AS INTEGER) AS deposit_txs_24h,
        CAST(COALESCE(SUM(ha.total_withdrawal_txs), 0) AS INTEGER) AS withdraw_txs_24h
      FROM bridges.config c
      LEFT JOIN bridges.hourly_aggregated ha
        ON ha.bridge_id = c.id
       AND ha.ts >= NOW() - INTERVAL '24 hours'
      GROUP BY c.bridge_name
      ORDER BY c.bridge_name;
    `;
  }

  return await sql<IBridgeTxCounts24H[]>`
    SELECT
      c.bridge_name,
      CAST(COALESCE(SUM(
        CASE
          WHEN c.chain = ${chain} THEN ha.total_deposit_txs
          WHEN c.destination_chain = ${chain} THEN ha.total_withdrawal_txs
          ELSE 0
        END
      ), 0) AS INTEGER) AS deposit_txs_24h,
      CAST(COALESCE(SUM(
        CASE
          WHEN c.chain = ${chain} THEN ha.total_withdrawal_txs
          WHEN c.destination_chain = ${chain} THEN ha.total_deposit_txs
          ELSE 0
        END
      ), 0) AS INTEGER) AS withdraw_txs_24h
    FROM bridges.config c
    LEFT JOIN bridges.hourly_aggregated ha
      ON ha.bridge_id = c.id
     AND ha.ts >= NOW() - INTERVAL '24 hours'
    WHERE (c.chain = ${chain} OR c.destination_chain = ${chain})
    GROUP BY c.bridge_name
    ORDER BY c.bridge_name;
  `;
};

const getNetflows = async (period: TimePeriod) => {
  let tableAndWhere = sql``;
  switch (period) {
    case "day":
      tableAndWhere = sql`FROM bridges.hourly_volume hv
      JOIN bridges.config c ON hv.bridge_id = c.id
      WHERE hv.ts >= NOW() AT TIME ZONE 'UTC' - interval '24 hours'
      AND hv.ts <= NOW() AT TIME ZONE 'UTC'`;
      break;
    case "week":
      tableAndWhere = sql`FROM bridges.daily_volume hv
      JOIN bridges.config c ON hv.bridge_id = c.id
      WHERE hv.ts >= (date_trunc('day', NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC') - interval '1 week'
      AND hv.ts < (date_trunc('day', NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
      AND hv.ts = (date_trunc('day', hv.ts AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')`;
      break;
    case "month":
      tableAndWhere = sql`FROM bridges.daily_volume hv
      JOIN bridges.config c ON hv.bridge_id = c.id
      WHERE hv.ts >= (date_trunc('day', NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC') - interval '1 month'
      AND hv.ts < (date_trunc('day', NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
      AND hv.ts = (date_trunc('day', hv.ts AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')`;
      break;
  }

  return await sql<{ chain: string; net_flow: string; deposited_usd: string; withdrawn_usd: string }[]>`
    WITH period_flows AS (
      SELECT 
        hv.chain,
        SUM(hv.total_deposited_usd) AS deposited_usd,
        SUM(hv.total_withdrawn_usd) AS withdrawn_usd,
        SUM(CASE 
          WHEN c.destination_chain IS NULL THEN (hv.total_deposited_usd - hv.total_withdrawn_usd)
          ELSE (hv.total_deposited_usd - hv.total_withdrawn_usd)
        END) as net_flow
      ${tableAndWhere}
      AND LOWER(hv.chain) NOT LIKE '%dydx%' AND hv.chain != 'bera'
      GROUP BY hv.chain
    )
    SELECT 
      chain,
      net_flow::text,
      deposited_usd::text,
      withdrawn_usd::text
    FROM period_flows
    WHERE net_flow IS NOT NULL
    ORDER BY ABS(net_flow::numeric) DESC;
  `;
};

const queryAggregatedTokenStatsTop30 = async (
  startTimestamp: number,
  endTimestamp: number,
  chain?: string,
  bridgeNetworkName?: string,
  limit: number = 30
) => {
  let conditions = sql`WHERE ha.ts >= to_timestamp(${startTimestamp})
    AND ha.ts < to_timestamp(${endTimestamp})`;

  if (chain) {
    conditions = sql`${conditions} AND c.chain = ${chain}`;
  }
  if (bridgeNetworkName) {
    conditions = sql`${conditions} AND c.bridge_name = ${bridgeNetworkName}`;
  }

  return await sql<
    {
      kind: "dt" | "wt" | "da" | "wa";
      key: string;
      amount: string | null;
      usd_value: string;
      txs: number | null;
    }[]
  >`
    WITH base AS (
      SELECT ha.total_tokens_deposited, ha.total_tokens_withdrawn,
             ha.total_address_deposited, ha.total_address_withdrawn
      FROM bridges.hourly_aggregated ha
      JOIN bridges.config c ON ha.bridge_id = c.id
      ${conditions}
    ),
    dt AS (
      SELECT replace((tok).token, '''', '') AS key,
             trim_scale(SUM(replace(replace((tok).amount, '''', ''), ' ', '')::numeric))::text AS amount,
             SUM((tok).usd_value)::text AS usd_value
      FROM base CROSS JOIN LATERAL unnest(total_tokens_deposited) tok
      WHERE (tok).token IS NOT NULL
      GROUP BY replace((tok).token, '''', '')
      ORDER BY SUM((tok).usd_value) DESC NULLS LAST
      LIMIT ${limit}
    ),
    wt AS (
      SELECT replace((tok).token, '''', '') AS key,
             trim_scale(SUM(replace(replace((tok).amount, '''', ''), ' ', '')::numeric))::text AS amount,
             SUM((tok).usd_value)::text AS usd_value
      FROM base CROSS JOIN LATERAL unnest(total_tokens_withdrawn) tok
      WHERE (tok).token IS NOT NULL
      GROUP BY replace((tok).token, '''', '')
      ORDER BY SUM((tok).usd_value) DESC NULLS LAST
      LIMIT ${limit}
    ),
    da AS (
      SELECT replace((a).address, '''', '') AS key,
             SUM((a).usd_value)::text AS usd_value,
             COALESCE(SUM((a).txs), 0)::integer AS txs
      FROM base CROSS JOIN LATERAL unnest(total_address_deposited) a
      WHERE (a).address IS NOT NULL
      GROUP BY replace((a).address, '''', '')
      ORDER BY SUM((a).usd_value) DESC NULLS LAST
      LIMIT ${limit}
    ),
    wa AS (
      SELECT replace((a).address, '''', '') AS key,
             SUM((a).usd_value)::text AS usd_value,
             COALESCE(SUM((a).txs), 0)::integer AS txs
      FROM base CROSS JOIN LATERAL unnest(total_address_withdrawn) a
      WHERE (a).address IS NOT NULL
      GROUP BY replace((a).address, '''', '')
      ORDER BY SUM((a).usd_value) DESC NULLS LAST
      LIMIT ${limit}
    )
    SELECT 'dt' AS kind, key, amount, usd_value, NULL::integer AS txs FROM dt
    UNION ALL SELECT 'wt', key, amount, usd_value, NULL::integer FROM wt
    UNION ALL SELECT 'da', key, NULL::text, usd_value, txs FROM da
    UNION ALL SELECT 'wa', key, NULL::text, usd_value, txs FROM wa
  `;
};

const queryAggregatedTokenStatsTop30Rolling = async (
  hours: number,
  chain?: string,
  bridgeNetworkName?: string,
  limit: number = 30
) => {
  let latestConditions = sql`WHERE 1 = 1`;
  let baseConditions = sql``;

  if (bridgeNetworkName) {
    latestConditions = sql`${latestConditions} AND c.bridge_name = ${bridgeNetworkName}`;
    baseConditions = sql`${baseConditions} AND c.bridge_name = ${bridgeNetworkName}`;
  }
  if (chain) {
    baseConditions = sql`${baseConditions} AND c.chain = ${chain}`;
    if (!bridgeNetworkName) {
      latestConditions = sql`${latestConditions} AND c.chain = ${chain}`;
    }
  }

  return await sql<
    {
      kind: "dt" | "wt" | "da" | "wa";
      key: string;
      amount: string | null;
      usd_value: string;
      txs: number | null;
    }[]
  >`
    WITH latest_ts AS (
      SELECT MAX(ha.ts) AS max_ts
      FROM bridges.hourly_aggregated ha
      JOIN bridges.config c ON ha.bridge_id = c.id
      ${latestConditions}
    ),
    base AS (
      SELECT ha.total_tokens_deposited, ha.total_tokens_withdrawn,
             ha.total_address_deposited, ha.total_address_withdrawn
      FROM bridges.hourly_aggregated ha
      JOIN bridges.config c ON ha.bridge_id = c.id
      CROSS JOIN latest_ts lt
      WHERE lt.max_ts IS NOT NULL
        AND ha.ts > lt.max_ts - make_interval(hours => ${hours}::int)
        AND ha.ts <= lt.max_ts
        ${baseConditions}
    ),
    dt AS (
      SELECT replace((tok).token, '''', '') AS key,
             trim_scale(SUM(replace(replace((tok).amount, '''', ''), ' ', '')::numeric))::text AS amount,
             SUM((tok).usd_value)::text AS usd_value
      FROM base CROSS JOIN LATERAL unnest(total_tokens_deposited) tok
      WHERE (tok).token IS NOT NULL
      GROUP BY replace((tok).token, '''', '')
      ORDER BY SUM((tok).usd_value) DESC NULLS LAST
      LIMIT ${limit}
    ),
    wt AS (
      SELECT replace((tok).token, '''', '') AS key,
             trim_scale(SUM(replace(replace((tok).amount, '''', ''), ' ', '')::numeric))::text AS amount,
             SUM((tok).usd_value)::text AS usd_value
      FROM base CROSS JOIN LATERAL unnest(total_tokens_withdrawn) tok
      WHERE (tok).token IS NOT NULL
      GROUP BY replace((tok).token, '''', '')
      ORDER BY SUM((tok).usd_value) DESC NULLS LAST
      LIMIT ${limit}
    ),
    da AS (
      SELECT replace((a).address, '''', '') AS key,
             SUM((a).usd_value)::text AS usd_value,
             COALESCE(SUM((a).txs), 0)::integer AS txs
      FROM base CROSS JOIN LATERAL unnest(total_address_deposited) a
      WHERE (a).address IS NOT NULL
      GROUP BY replace((a).address, '''', '')
      ORDER BY SUM((a).usd_value) DESC NULLS LAST
      LIMIT ${limit}
    ),
    wa AS (
      SELECT replace((a).address, '''', '') AS key,
             SUM((a).usd_value)::text AS usd_value,
             COALESCE(SUM((a).txs), 0)::integer AS txs
      FROM base CROSS JOIN LATERAL unnest(total_address_withdrawn) a
      WHERE (a).address IS NOT NULL
      GROUP BY replace((a).address, '''', '')
      ORDER BY SUM((a).usd_value) DESC NULLS LAST
      LIMIT ${limit}
    )
    SELECT 'dt' AS kind, key, amount, usd_value, NULL::integer AS txs FROM dt
    UNION ALL SELECT 'wt', key, amount, usd_value, NULL::integer FROM wt
    UNION ALL SELECT 'da', key, NULL::text, usd_value, txs FROM da
    UNION ALL SELECT 'wa', key, NULL::text, usd_value, txs FROM wa
  `;
};

const queryAggregatedTotalsTimestampRange = async (
  startTimestamp: number,
  endTimestamp: number,
  chain?: string,
  bridgeNetworkName?: string
) => {
  let conditions = sql`WHERE ha.ts >= to_timestamp(${startTimestamp})
    AND ha.ts < to_timestamp(${endTimestamp})`;

  if (chain) {
    conditions = sql`${conditions} AND c.chain = ${chain}`;
  }
  if (bridgeNetworkName) {
    conditions = sql`${conditions} AND c.bridge_name = ${bridgeNetworkName}`;
  }

  return (
    await sql<
      {
        total_deposited_usd: string;
        total_withdrawn_usd: string;
        total_deposit_txs: number;
        total_withdrawal_txs: number;
      }[]
    >`
      SELECT
        COALESCE(SUM(ha.total_deposited_usd), 0)::text AS total_deposited_usd,
        COALESCE(SUM(ha.total_withdrawn_usd), 0)::text AS total_withdrawn_usd,
        COALESCE(SUM(ha.total_deposit_txs), 0)::integer AS total_deposit_txs,
        COALESCE(SUM(ha.total_withdrawal_txs), 0)::integer AS total_withdrawal_txs
      FROM bridges.hourly_aggregated ha
      JOIN bridges.config c ON ha.bridge_id = c.id
      ${conditions}
    `
  )[0];
};

const queryAggregatedTotalsRolling = async (hours: number, chain?: string, bridgeNetworkName?: string) => {
  let latestConditions = sql`WHERE 1 = 1`;
  let baseConditions = sql``;

  if (bridgeNetworkName) {
    latestConditions = sql`${latestConditions} AND c.bridge_name = ${bridgeNetworkName}`;
    baseConditions = sql`${baseConditions} AND c.bridge_name = ${bridgeNetworkName}`;
  }
  if (chain) {
    baseConditions = sql`${baseConditions} AND c.chain = ${chain}`;
    if (!bridgeNetworkName) {
      latestConditions = sql`${latestConditions} AND c.chain = ${chain}`;
    }
  }

  return (
    await sql<
      {
        total_deposited_usd: string;
        total_withdrawn_usd: string;
        total_deposit_txs: number;
        total_withdrawal_txs: number;
      }[]
    >`
      WITH latest_ts AS (
        SELECT MAX(ha.ts) AS max_ts
        FROM bridges.hourly_aggregated ha
        JOIN bridges.config c ON ha.bridge_id = c.id
        ${latestConditions}
      )
      SELECT
        COALESCE(SUM(ha.total_deposited_usd), 0)::text AS total_deposited_usd,
        COALESCE(SUM(ha.total_withdrawn_usd), 0)::text AS total_withdrawn_usd,
        COALESCE(SUM(ha.total_deposit_txs), 0)::integer AS total_deposit_txs,
        COALESCE(SUM(ha.total_withdrawal_txs), 0)::integer AS total_withdrawal_txs
      FROM bridges.hourly_aggregated ha
      JOIN bridges.config c ON ha.bridge_id = c.id
      CROSS JOIN latest_ts lt
      WHERE lt.max_ts IS NOT NULL
        AND ha.ts > lt.max_ts - make_interval(hours => ${hours}::int)
        AND ha.ts <= lt.max_ts
        ${baseConditions}
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
  getLast24HVolume,
  getAllLast24HVolumes,
  queryBridgeTxCounts24h,
  getNetflows,
  queryAggregatedTokenStatsTop30,
  queryAggregatedTokenStatsTop30Rolling,
  queryAggregatedTotalsTimestampRange,
  queryAggregatedTotalsRolling,
};
