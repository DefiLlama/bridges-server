import type { Chain } from "@defillama/sdk/build/general";
import { sql } from "../../db";

interface IUserStatsResponse {
  adaptor: string;
  day: Date;
  chain: Chain;
  sticky_users?: number;
  unique_users: number;
  total_txs: number;
  new_users?: number;
}

interface IUserStats {
  total_txs: number;
  unique_users: number;
}

interface IProtocolStats {
  adaptor: string;
  "24hourTxs": number;
  "24hourUsers": number;
  change_1d: number; // signed float
}

interface IChainStatsResponse {
  day: Date;
  sticky_users?: number;
  unique_users: number;
  total_txs: number;
  new_users: number;
}

interface IConfig {
  id: string;
  bridge_name: string;
  chain: string;
  txs?: number;
}

interface IConfigID {
  id: string;
}

interface ITransaction {
  id?: number;
  bridge_id: string;
  chain: string;
  tx_hash?: string;
  ts: number;
  tx_block?: number;
  tx_from?: string;
  tx_to?: string;
  token: string;
  amount: string;
  is_deposit: boolean;
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

// need to FIX 'to_timestamp' throughout so I can pass already formatted timestamps**********************
const queryAllTxsWithinTimestampRange = async (
  startTimestamp: number,
  endTimestamp: number,
  bridgeID: string
) => {
  return await sql<ITransaction[]>`
  SELECT * FROM 
    bridges.transactions
  WHERE 
    ts >= to_timestamp(${startTimestamp}) AND 
    ts < to_timestamp(${endTimestamp}) AND
    bridge_id = ${bridgeID}
  `;
};

// This doesn't return data on tokens and addresses, only volume and tx numbers.
const queryAggregatedDailyTimestampRange = async (
  startTimestamp: number,
  endTimestamp: number,
  chain?: string,
  bridgNetworkName?: string,
) => {
  let bridgNetworkNameEqual = sql``;
  let chainEqual = sql``;
  if (bridgNetworkName && chain) {
    bridgNetworkNameEqual = sql`
    WHERE bridge_name = ${bridgNetworkName} AND
    chain = ${chain}
    `;
  } else {
    bridgNetworkNameEqual = bridgNetworkName
      ? sql`WHERE bridge_name = ${bridgNetworkName}`
      : sql``;
    chainEqual = chain ? sql`WHERE chain = ${chain}` : sql``;
  }
  return await sql<IAggregatedData[]>`
  SELECT bridge_id, ts, total_deposited_usd, total_withdrawn_usd, total_deposit_txs, total_withdrawal_txs FROM 
    bridges.daily_aggregated
  WHERE
  ts >= to_timestamp(${startTimestamp}) AND 
  ts < to_timestamp(${endTimestamp}) AND 
    bridge_id IN (
      SELECT id FROM
        bridges.config
      ${bridgNetworkNameEqual}
      ${chainEqual}
    )
    ORDER BY ts;
  `;
};

const queryAggregatedHourlyTimestampRange = async (
  startTimestamp: number,
  endTimestamp: number,
  chain?: string,
  bridgNetworkName?: string,
) => {
  let bridgNetworkNameEqual = sql``;
  let chainEqual = sql``;
  if (bridgNetworkName && chain) {
    bridgNetworkNameEqual = sql`
    WHERE bridge_name = ${bridgNetworkName} AND
    chain = ${chain}
    `;
  } else {
    bridgNetworkNameEqual = bridgNetworkName
      ? sql`WHERE bridge_name = ${bridgNetworkName}`
      : sql``;
    chainEqual = chain ? sql`WHERE chain = ${chain}` : sql``;
  }
  return await sql<IAggregatedData[]>`
  SELECT bridge_id, ts, total_deposited_usd, total_withdrawn_usd, total_deposit_txs, total_withdrawal_txs FROM 
    bridges.hourly_aggregated
    WHERE
    ts >= to_timestamp(${startTimestamp}) AND 
    ts < to_timestamp(${endTimestamp}) AND
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
const queryAggregatedHourlyDataAtTimestamp = async (
  timestamp: number,
  chain?: string,
  bridgNetworkName?: string,
) => {
  let bridgNetworkNameEqual = sql``;
  let chainEqual = sql``;
  let bridgeIdIn = sql``;
  if (bridgNetworkName && chain) {
    bridgNetworkNameEqual = sql`
    WHERE bridge_name = ${bridgNetworkName} AND
    chain = ${chain}
    `;
  } else {
    bridgNetworkNameEqual = bridgNetworkName
      ? sql`WHERE bridge_name = ${bridgNetworkName}`
      : sql``;
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

const queryAggregatedDailyDataAtTimestamp = async (
  timestamp: number,
  chain?: string,
  bridgNetworkName?: string,
) => {
  let bridgNetworkNameEqual = sql``;
  let chainEqual = sql``;
  let bridgeIdIn = sql``;
  if (bridgNetworkName && chain) {
    bridgNetworkNameEqual = sql`
    WHERE bridge_name = ${bridgNetworkName} AND
    chain = ${chain}
    `;
  } else {
    bridgNetworkNameEqual = bridgNetworkName
      ? sql`WHERE bridge_name = ${bridgNetworkName}`
      : sql``;
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
    bridges.daily_aggregated
  WHERE 
    ts = to_timestamp(${timestamp}) 
    ${bridgeIdIn}
  `;
};

export const queryLargeTransaction = async (
  txPK: number,
  timestamp: number
) => {
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

const queryStoredUserStats = async (
  adaptor: string,
  { day, chain }: { day?: Date; chain?: Chain }
) => {
  return sql<IUserStatsResponse[]>`
    SELECT * FROM
      users.aggregate_data
    WHERE
      adaptor = ${adaptor}
    ${day ? sql`AND day=${day}` : sql``}
    ${chain ? sql`AND chain=${chain}` : sql``}
  `;
};

const queryBlocksOnDay = async (chain: Chain, date: Date) => {
  const nextDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1)
  );
  const day = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

  const toTimestamp = Math.floor(nextDay.getTime() / 1000);
  const fromTimestamp = Math.floor(day.getTime() / 1000);

  return (
    await sql<{ number: number }[]>`
      SELECT
        number::integer
      FROM
        ${sql(chain)}.blocks
      WHERE
        timestamp < to_timestamp(${toTimestamp})
        AND timestamp >= to_timestamp(${fromTimestamp})
  `
  ).map((x) => x.number);
};

const queryFunctionCalls = async (
  chain: Chain,
  address: Buffer,
  functionNames: string[],
  blocks: number[]
) => {
  // No functionNames means we cannot match anything, hence 0 users.
  if (functionNames.length == 0)
    return {
      total_txs: 0,
      unique_users: 0,
    } as IUserStats;

  return (
    await sql<IUserStats[]>`
    SELECT
      count("user") AS "total_txs",
      count(DISTINCT "user") AS "unique_users"
    FROM (
      SELECT
        from_address as "user"
      FROM unnest(${sql.array(blocks)}::bigint[]) blocks
      INNER JOIN ${sql(chain)}.transactions ON block_number = blocks
      WHERE
        input_function_name IN ${sql(functionNames)}
        AND to_address = ${address}
        AND success
    ) AS _
  `
  )[0];
};

const queryUserStats = async (
  chain: Chain,
  addresses: Buffer[],
  blocks: number[]
) => {
  return (
    await sql<IUserStats[]>`
    SELECT
      count("user") AS "total_txs",
      count(DISTINCT "user") AS "unique_users"
    FROM (
      SELECT
          from_address AS "user"
      FROM
        unnest(${sql.array(blocks)}::bigint[]) blocks
      INNER JOIN ${sql(chain)}.transactions ON block_number = blocks
      WHERE
        to_address IN ${sql(addresses)}
        AND success
    ) AS _ 
    `
  )[0];
};

const queryMissingFunctionNames = async (
  chain: Chain,
  addresses: Buffer[],
  blocks: number[]
) => {
  return +(
    await sql<{ count: number }[]>`
    SELECT
      count(*)
    FROM
      unnest(${sql.array(blocks)}::bigint[]) blocks
      INNER JOIN ${sql(chain)}.transactions ON block_number = blocks
    WHERE
      to_address IN ${sql(addresses)}
      AND input_function_name IS NULL
      AND success
  `
  )[0].count;
};

const queryStoredChainStats = async (chain: Chain, { day }: { day?: Date }) => {
  return sql<IChainStatsResponse[]>`
    SELECT * FROM
      ${sql(chain)}.aggregate_data
    ${day ? sql`WHERE day=${day}` : sql``}
  `;
};

const queryAllProtocolsStats = ({
  chain,
  day,
}: {
  chain?: Chain;
  day?: Date;
}) => {
  day = day ? day : new Date();

  // TODO: Optimization of the query may be needed.
  return sql<IProtocolStats[]>`
    WITH today AS (
      SELECT
        adaptor,
        sum(total_txs) AS total_txs,
        sum(unique_users) AS unique_users
      FROM
        users.aggregate_data
      WHERE
        column_type = 'all'
        ${chain ? sql`AND chain=${chain}` : sql``}
        AND day = ${day}::date
      GROUP BY
        adaptor
    ),
    yesterday AS (
      SELECT
        adaptor,
        sum(total_txs) AS total_txs
      FROM
        users.aggregate_data
      WHERE
        column_type = 'all'
        ${chain ? sql`AND chain=${chain}` : sql``}
        AND day = ${day}::date - interval '1 day'
      GROUP BY
        adaptor
    )

    SELECT
      t.adaptor,
      t.total_txs AS "24hourTxs",
      t.unique_users AS "24hoursUsers",
      (((t.total_txs - y.total_txs)::float / y.total_txs)) * 100 AS change_1d
    FROM
      today t
      LEFT JOIN yesterday y ON t.adaptor = y.adaptor
  `;
};

export {
  getBridgeID,
  queryAllTxsWithinTimestampRange,
  queryAggregatedHourlyDataAtTimestamp,
  queryAggregatedDailyDataAtTimestamp,
  queryAggregatedDailyTimestampRange,
  queryAggregatedHourlyTimestampRange,
};
