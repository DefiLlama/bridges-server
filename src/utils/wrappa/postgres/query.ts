import bridgeNetworkData from "../../../data/bridgeNetworkData";
import { querySql as sql } from "../../db";
import { MAX_TRANSACTIONS_LIMIT, TransactionCursor } from "../../transactionCursor";

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
  transaction_id?: string;
  cursor_ts?: string;
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

export interface ILargeTransactionRow {
  id: number;
  bridge_id: string;
  ts: number;
  tx_block?: number;
  tx_hash?: string;
  tx_from?: string;
  tx_to?: string;
  token: string;
  amount: string;
  is_deposit: boolean;
  chain: string;
  usd_value?: number;
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

interface IDailyBridgeVolumeTotal {
  ts: Date;
  total_deposited_usd: string;
  total_withdrawn_usd: string;
  total_deposit_txs: number;
  total_withdrawal_txs: number;
}

interface IDailyBridgeVolumeByBridge extends IDailyBridgeVolumeTotal {
  bridge_name: string;
}

interface IDailyBridgeVolumeByChain extends IDailyBridgeVolumeTotal {
  chain: string;
}

interface IAggregatedStatsRow {
  kind: "dt" | "wt" | "da" | "wa";
  key: string;
  amount: string | null;
  usd_value: string;
  txs: number | null;
}

interface IAggregatedStatsTotals {
  total_deposited_usd: string;
  total_withdrawn_usd: string;
  total_deposit_txs: number;
  total_withdrawal_txs: number;
}

interface IAggregatedStatsQueryRow extends IAggregatedStatsTotals {
  kind: IAggregatedStatsRow["kind"] | null;
  key: string | null;
  amount: string | null;
  usd_value: string | null;
  txs: number | null;
}

const unpackAggregatedStats = (result: IAggregatedStatsQueryRow[]) => {
  const first = result[0];
  const totals: IAggregatedStatsTotals = {
    total_deposited_usd: first?.total_deposited_usd ?? "0",
    total_withdrawn_usd: first?.total_withdrawn_usd ?? "0",
    total_deposit_txs: first?.total_deposit_txs ?? 0,
    total_withdrawal_txs: first?.total_withdrawal_txs ?? 0,
  };
  const rows = result
    .filter(
      (row): row is IAggregatedStatsQueryRow & { kind: IAggregatedStatsRow["kind"]; key: string; usd_value: string } =>
        row.kind !== null && row.key !== null && row.usd_value !== null
    )
    .map(({ kind, key, amount, usd_value, txs }) => ({ kind, key, amount, usd_value, txs }));
  return { rows, totals };
};

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

const queryDailyBridgeVolumeTotals = async (
  startTimestamp: number,
  endTimestamp: number,
  chain?: string,
  bridgeNetworkName?: string
) => {
  let conditions = sql`WHERE dv.ts = (date_trunc('day', dv.ts AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
    AND dv.ts >= (date_trunc('day', to_timestamp(${startTimestamp}) AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
    AND dv.ts <= (date_trunc('day', to_timestamp(${endTimestamp}) AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')`;

  if (bridgeNetworkName) {
    conditions = sql`${conditions} AND c.bridge_name = ${bridgeNetworkName}`;
  }
  if (chain) {
    conditions = sql`${conditions}
      AND (dv.chain = ${chain} OR LOWER(c.destination_chain) = LOWER(${chain}))`;
  }

  const depositedUsd = chain
    ? sql`(
        CASE WHEN dv.chain = ${chain} THEN dv.total_deposited_usd ELSE 0 END
        + CASE WHEN LOWER(c.destination_chain) = LOWER(${chain}) THEN dv.total_withdrawn_usd ELSE 0 END
      )`
    : sql`dv.total_deposited_usd`;
  const withdrawnUsd = chain
    ? sql`(
        CASE WHEN dv.chain = ${chain} THEN dv.total_withdrawn_usd ELSE 0 END
        + CASE WHEN LOWER(c.destination_chain) = LOWER(${chain}) THEN dv.total_deposited_usd ELSE 0 END
      )`
    : sql`dv.total_withdrawn_usd`;
  const depositTxs = chain
    ? sql`(
        CASE WHEN dv.chain = ${chain} THEN dv.total_deposit_txs ELSE 0 END
        + CASE WHEN LOWER(c.destination_chain) = LOWER(${chain}) THEN dv.total_withdrawal_txs ELSE 0 END
      )`
    : sql`dv.total_deposit_txs`;
  const withdrawalTxs = chain
    ? sql`(
        CASE WHEN dv.chain = ${chain} THEN dv.total_withdrawal_txs ELSE 0 END
        + CASE WHEN LOWER(c.destination_chain) = LOWER(${chain}) THEN dv.total_deposit_txs ELSE 0 END
      )`
    : sql`dv.total_withdrawal_txs`;

  return await sql<IDailyBridgeVolumeTotal[]>`
    SELECT
      dv.ts,
      COALESCE(SUM(${depositedUsd}), 0)::text AS total_deposited_usd,
      COALESCE(SUM(${withdrawnUsd}), 0)::text AS total_withdrawn_usd,
      COALESCE(SUM(${depositTxs}), 0)::integer AS total_deposit_txs,
      COALESCE(SUM(${withdrawalTxs}), 0)::integer AS total_withdrawal_txs
    FROM bridges.daily_volume dv
    JOIN bridges.config c ON dv.bridge_id = c.id
    ${conditions}
    GROUP BY dv.ts
    ORDER BY dv.ts;
  `;
};

const queryDailyBridgeVolumesByBridge = async (startTimestamp: number, endTimestamp: number) => {
  return await sql<IDailyBridgeVolumeByBridge[]>`
    SELECT
      c.bridge_name,
      dv.ts,
      COALESCE(SUM(dv.total_deposited_usd), 0)::text AS total_deposited_usd,
      COALESCE(SUM(dv.total_withdrawn_usd), 0)::text AS total_withdrawn_usd,
      COALESCE(SUM(dv.total_deposit_txs), 0)::integer AS total_deposit_txs,
      COALESCE(SUM(dv.total_withdrawal_txs), 0)::integer AS total_withdrawal_txs
    FROM bridges.daily_volume dv
    JOIN bridges.config c ON dv.bridge_id = c.id
    WHERE dv.ts = (date_trunc('day', dv.ts AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
      AND dv.ts >= (date_trunc('day', to_timestamp(${startTimestamp}) AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
      AND dv.ts <= (date_trunc('day', to_timestamp(${endTimestamp}) AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
    GROUP BY c.bridge_name, dv.ts
    ORDER BY c.bridge_name, dv.ts;
  `;
};

const queryDailyBridgeVolumesByChain = async (startTimestamp: number, endTimestamp: number) => {
  return await sql<IDailyBridgeVolumeByChain[]>`
    WITH contributions AS (
      SELECT
        LOWER(dv.chain) AS chain,
        dv.ts,
        dv.total_deposited_usd,
        dv.total_withdrawn_usd,
        dv.total_deposit_txs,
        dv.total_withdrawal_txs
      FROM bridges.daily_volume dv
      JOIN bridges.config c ON dv.bridge_id = c.id
      WHERE dv.ts = (date_trunc('day', dv.ts AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
        AND dv.ts >= (date_trunc('day', to_timestamp(${startTimestamp}) AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
        AND dv.ts <= (date_trunc('day', to_timestamp(${endTimestamp}) AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')

      UNION ALL

      SELECT
        LOWER(c.destination_chain) AS chain,
        dv.ts,
        dv.total_withdrawn_usd AS total_deposited_usd,
        dv.total_deposited_usd AS total_withdrawn_usd,
        dv.total_withdrawal_txs AS total_deposit_txs,
        dv.total_deposit_txs AS total_withdrawal_txs
      FROM bridges.daily_volume dv
      JOIN bridges.config c ON dv.bridge_id = c.id
      WHERE c.destination_chain IS NOT NULL
        AND dv.ts = (date_trunc('day', dv.ts AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
        AND dv.ts >= (date_trunc('day', to_timestamp(${startTimestamp}) AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
        AND dv.ts <= (date_trunc('day', to_timestamp(${endTimestamp}) AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
    )
    SELECT
      chain,
      ts,
      COALESCE(SUM(total_deposited_usd), 0)::text AS total_deposited_usd,
      COALESCE(SUM(total_withdrawn_usd), 0)::text AS total_withdrawn_usd,
      COALESCE(SUM(total_deposit_txs), 0)::integer AS total_deposit_txs,
      COALESCE(SUM(total_withdrawal_txs), 0)::integer AS total_withdrawal_txs
    FROM contributions
    GROUP BY chain, ts
    ORDER BY chain, ts;
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
  endTimestamp: number,
  limit: number = 2000,
  offset: number = 0
) => {
  let chainCondition = sql``;
  if (chain) {
    chainCondition = sql`AND (config.chain = ${chain} OR config.destination_chain = ${chain})`;
  }

  return await sql<ILargeTransactionRow[]>`
    SELECT
      transactions.id,
      transactions.bridge_id,
      EXTRACT(EPOCH FROM transactions.ts)::double precision AS ts,
      transactions.tx_block,
      transactions.tx_hash,
      transactions.tx_from,
      transactions.tx_to,
      transactions.token,
      transactions.amount,
      transactions.is_deposit,
      transactions.chain,
      large_transactions.usd_value
    FROM bridges.large_transactions
    JOIN bridges.transactions
      ON transactions.id = large_transactions.tx_pk
    JOIN bridges.config config
      ON config.id = transactions.bridge_id
    WHERE large_transactions.ts >= to_timestamp(${startTimestamp})
      AND large_transactions.ts <= to_timestamp(${endTimestamp})
      ${chainCondition}
    ORDER BY transactions.ts DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
};

const countLargeTransactionsTimestampRange = async (
  chain: string | null,
  startTimestamp: number,
  endTimestamp: number
) => {
  let chainCondition = sql``;
  if (chain) {
    chainCondition = sql`AND (config.chain = ${chain} OR config.destination_chain = ${chain})`;
  }

  const [result] = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count
    FROM bridges.large_transactions
    JOIN bridges.transactions
      ON transactions.id = large_transactions.tx_pk
    JOIN bridges.config config
      ON config.id = transactions.bridge_id
    WHERE large_transactions.ts >= to_timestamp(${startTimestamp})
      AND large_transactions.ts <= to_timestamp(${endTimestamp})
      ${chainCondition}
  `;
  return Number(result?.count ?? 0);
};

const queryTransactionsTimestampRangeByBridgeNetwork = async (
  startTimestamp: number,
  endTimestamp?: number,
  bridgeNetworkName?: string,
  chain?: string,
  limit?: number,
  cursor?: TransactionCursor
) => {
  let timestampLessThan = endTimestamp ? sql`AND transactions.ts <= to_timestamp(${endTimestamp})` : sql``;
  let bridgeNameCondition = bridgeNetworkName ? sql`AND config.bridge_name = ${bridgeNetworkName}` : sql``;
  let chainCondition = chain ? sql`AND (config.chain = ${chain} OR config.destination_chain = ${chain})` : sql``;
  const cursorCondition = cursor
    ? sql`AND (
        transactions.ts < ${cursor.timestamp}::timestamptz
        OR (transactions.ts = ${cursor.timestamp}::timestamptz AND transactions.id < ${cursor.id}::bigint)
      )`
    : sql``;
  const queryLimit = Math.min(Math.max(Math.floor(limit ?? MAX_TRANSACTIONS_LIMIT + 1), 1), MAX_TRANSACTIONS_LIMIT + 1);
  return await sql<ITransaction[]>`
  SELECT transactions.id::text AS transaction_id,
       to_char(transactions.ts AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_ts,
       transactions.bridge_id,
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
       ${cursorCondition}
ORDER BY transactions.ts DESC, transactions.id DESC
LIMIT ${queryLimit}
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

const getAllLast24HVolumes = async (): Promise<{
  last24hVolumes: Record<string, number>;
  lastHourlyVolumes: Record<string, number>;
  dataUpdatedAt: string | null;
}> => {
  const WORMHOLE_HOURS = 28;
  const DEFAULT_HOURS = 24;

  const result = await sql<
    {
      bridge_name: string;
      volume: string;
      last_hourly_volume: string;
      max_ts: Date | string;
    }[]
  >`
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
        pbl.max_ts,
        ha.ts,
        (ha.total_deposited_usd + ha.total_withdrawn_usd) AS volume
      FROM bridges.hourly_volume ha
      JOIN bridges.config c ON ha.bridge_id = c.id
      JOIN per_bridge_latest pbl ON c.bridge_name = pbl.bridge_name
      WHERE ha.ts > pbl.max_ts - make_interval(
        hours => (CASE WHEN c.bridge_name = 'wormhole' THEN ${WORMHOLE_HOURS} ELSE ${DEFAULT_HOURS} END)::int
      )
        AND ha.ts <= pbl.max_ts
    )
    SELECT
      rows.bridge_name,
      (SUM(rows.volume) / 2)::text AS volume,
      (COALESCE(SUM(rows.volume) FILTER (WHERE rows.ts = rows.max_ts), 0) / 2)::text AS last_hourly_volume,
      rows.max_ts
    FROM per_bridge_rows rows
    GROUP BY rows.bridge_name, rows.max_ts
  `;

  const last24hVolumes: Record<string, number> = {};
  const lastHourlyVolumes: Record<string, number> = {};
  let latestTimestamp = 0;
  for (const { bridge_name, volume, last_hourly_volume, max_ts } of result) {
    last24hVolumes[bridge_name] = parseFloat(volume) || 0;
    lastHourlyVolumes[bridge_name] = parseFloat(last_hourly_volume) || 0;
    latestTimestamp = Math.max(latestTimestamp, new Date(max_ts).getTime());
  }

  return {
    last24hVolumes,
    lastHourlyVolumes,
    dataUpdatedAt: latestTimestamp > 0 ? new Date(latestTimestamp).toISOString() : null,
  };
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

const queryAggregatedStatsTop30 = async (
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

  const result = await sql<IAggregatedStatsQueryRow[]>`
    WITH base AS (
      SELECT ha.total_tokens_deposited, ha.total_tokens_withdrawn,
             ha.total_address_deposited, ha.total_address_withdrawn,
             ha.total_deposited_usd, ha.total_withdrawn_usd,
             ha.total_deposit_txs, ha.total_withdrawal_txs
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
    ),
    stats AS (
      SELECT 1 AS kind_order, 'dt' AS kind, key, amount, usd_value, NULL::integer AS txs FROM dt
      UNION ALL SELECT 2, 'wt', key, amount, usd_value, NULL::integer FROM wt
      UNION ALL SELECT 3, 'da', key, NULL::text, usd_value, txs FROM da
      UNION ALL SELECT 4, 'wa', key, NULL::text, usd_value, txs FROM wa
    ),
    totals AS (
      SELECT
        COALESCE(SUM(total_deposited_usd), 0)::text AS total_deposited_usd,
        COALESCE(SUM(total_withdrawn_usd), 0)::text AS total_withdrawn_usd,
        COALESCE(SUM(total_deposit_txs), 0)::integer AS total_deposit_txs,
        COALESCE(SUM(total_withdrawal_txs), 0)::integer AS total_withdrawal_txs
      FROM base
    )
    SELECT
      stats.kind, stats.key, stats.amount, stats.usd_value, stats.txs,
      totals.total_deposited_usd, totals.total_withdrawn_usd,
      totals.total_deposit_txs, totals.total_withdrawal_txs
    FROM totals
    LEFT JOIN stats ON TRUE
    ORDER BY stats.kind_order, stats.usd_value::numeric DESC NULLS LAST
  `;
  return unpackAggregatedStats(result);
};

const queryAggregatedStatsTop30Rolling = async (
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

  const result = await sql<IAggregatedStatsQueryRow[]>`
    WITH latest_ts AS (
      SELECT MAX(ha.ts) AS max_ts
      FROM bridges.hourly_aggregated ha
      JOIN bridges.config c ON ha.bridge_id = c.id
      ${latestConditions}
    ),
    base AS (
      SELECT ha.total_tokens_deposited, ha.total_tokens_withdrawn,
             ha.total_address_deposited, ha.total_address_withdrawn,
             ha.total_deposited_usd, ha.total_withdrawn_usd,
             ha.total_deposit_txs, ha.total_withdrawal_txs
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
    ),
    stats AS (
      SELECT 1 AS kind_order, 'dt' AS kind, key, amount, usd_value, NULL::integer AS txs FROM dt
      UNION ALL SELECT 2, 'wt', key, amount, usd_value, NULL::integer FROM wt
      UNION ALL SELECT 3, 'da', key, NULL::text, usd_value, txs FROM da
      UNION ALL SELECT 4, 'wa', key, NULL::text, usd_value, txs FROM wa
    ),
    totals AS (
      SELECT
        COALESCE(SUM(total_deposited_usd), 0)::text AS total_deposited_usd,
        COALESCE(SUM(total_withdrawn_usd), 0)::text AS total_withdrawn_usd,
        COALESCE(SUM(total_deposit_txs), 0)::integer AS total_deposit_txs,
        COALESCE(SUM(total_withdrawal_txs), 0)::integer AS total_withdrawal_txs
      FROM base
    )
    SELECT
      stats.kind, stats.key, stats.amount, stats.usd_value, stats.txs,
      totals.total_deposited_usd, totals.total_withdrawn_usd,
      totals.total_deposit_txs, totals.total_withdrawal_txs
    FROM totals
    LEFT JOIN stats ON TRUE
    ORDER BY stats.kind_order, stats.usd_value::numeric DESC NULLS LAST
  `;
  return unpackAggregatedStats(result);
};

export {
  getBridgeID,
  getConfigsWithDestChain,
  getLargeTransaction,
  queryLargeTransactionsTimestampRange,
  countLargeTransactionsTimestampRange,
  queryConfig,
  queryTransactionsTimestampRangeByBridge,
  queryTransactionsTimestampRangeByBridgeNetwork,
  queryAggregatedHourlyDataAtTimestamp,
  queryAggregatedDailyDataAtTimestamp,
  queryAggregatedDailyTimestampRange,
  queryDailyBridgeVolumeTotals,
  queryDailyBridgeVolumesByBridge,
  queryDailyBridgeVolumesByChain,
  queryAggregatedHourlyTimestampRange,
  getLast24HVolume,
  getAllLast24HVolumes,
  queryBridgeTxCounts24h,
  getNetflows,
  queryAggregatedStatsTop30,
  queryAggregatedStatsTop30Rolling,
};
