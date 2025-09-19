import postgres from "postgres";
import { sql } from "../../db";

const PG_INT_MAX = 2147483647;

const normalizeBlockNumber = (block: number | null): number | null => {
  if (block == null) return block;
  if (block > PG_INT_MAX) {
    console.warn(`tx_block ${block} is out of INTEGER range; setting to 0`);
    return 0;
  }
  return block;
};

const txTypes = {
  bridge_id: "string",
  chain: "string",
  tx_hash: "string",
  ts: "number",
  tx_block: "number",
  tx_from: "string",
  tx_to: "string",
  token: "string",
  amount: "string",
  is_deposit: "boolean",
  is_usd_volume: "boolean",
  txs_counted_as: "number",
  origin_chain: "string",
} as { [key: string]: string };

export const insertTransactionRow = async (
  sql: postgres.TransactionSql<{}>,
  allowNullTxValues: boolean,
  params: {
    bridge_id: string;
    chain: string;
    tx_hash: string | null;
    ts: number;
    tx_block: number | null;
    tx_from: string | null;
    tx_to: string | null;
    token: string;
    amount: string;
    is_deposit: boolean;
    is_usd_volume: boolean;
    txs_counted_as: number | null;
    origin_chain: string | null;
  },
  onConflict: "ignore" | "error" | "upsert" = "error"
) => {
  const safeParams = {
    ...params,
    tx_block: normalizeBlockNumber(params.tx_block),
  } as typeof params;
  let sqlCommand = sql`
  insert into bridges.transactions ${sql(safeParams)}
`;
  if (onConflict === "ignore") {
    sqlCommand = sql`
      insert into bridges.transactions ${sql(safeParams)}
      ON CONFLICT DO NOTHING
    `;
  } else if (onConflict === "upsert") {
    sqlCommand = sql`
      insert into bridges.transactions ${sql(safeParams)}
      ON CONFLICT (bridge_id, chain, tx_hash, token, tx_from, tx_to)
      DO UPDATE SET ${sql(safeParams)}
    `;
  }

  Object.entries(safeParams).map(([key, val]) => {
    if (val == null) {
      if (allowNullTxValues) {
        // console.info(`Transaction for bridgeID ${params.bridge_id} has a null value for ${key}.`);
      } else {
        throw new Error(`Transaction for bridgeID ${safeParams.bridge_id} has a null value for ${key}.`);
      }
    } else {
      if (typeof val !== txTypes[key])
        throw new Error(
          `Transaction for bridgeID ${safeParams.bridge_id} has ${typeof val} for ${key} when it must be ${txTypes[key]}.`
        );
    }
  });
  for (let i = 0; i < 5; i++) {
    try {
      await sqlCommand;
      return;
    } catch (e) {
      if (i >= 4) {
        throw new Error(`Could not insert transaction row for bridge ${safeParams.bridge_id}.`);
      } else {
        console.error(`id: ${safeParams.bridge_id}, txHash: ${safeParams.tx_hash}`, e);
        continue;
      }
    }
  }
};

export const insertConfigRow = async (
  sql: postgres.TransactionSql<{}>,
  params: {
    id?: string;
    bridge_name: string;
    chain: string;
    destination_chain?: string;
  }
) => {
  Object.entries(params).map(([key, val]) => {
    if (key !== "id" && key !== "destination_chain") {
      if (typeof val !== "string") {
        throw new Error(`Config for bridge ${params.bridge_name} has a null value or wrong type for ${key}.`);
      }
    }
  });
  let paramsToAvoidTsError = { bridge_name: params.bridge_name, chain: params.chain } as any;
  if (params.id) {
    paramsToAvoidTsError = {
      ...paramsToAvoidTsError,
      id: params.id,
    };
  }
  if (params.destination_chain) {
    paramsToAvoidTsError = {
      ...paramsToAvoidTsError,
      destination_chain: params.destination_chain,
    };
  }
  for (let i = 0; i < 5; i++) {
    try {
      console.log(`inserting into bridges.config`);
      return sql`
        INSERT INTO bridges.config ${sql(paramsToAvoidTsError)} 
        ON CONFLICT (bridge_name, chain) DO NOTHING;
      `;
    } catch (e) {
      if (i >= 4) {
        throw new Error(`Could not insert config row for ${params.bridge_name} on ${params.chain}`);
      } else {
        console.error(params.bridge_name, e);
        continue;
      }
    }
  }
};

export const insertHourlyAggregatedRow = async (
  sql: postgres.TransactionSql<{}>,
  allowNullTxValues: boolean,
  params: {
    bridge_id: string;
    ts: number;
    total_tokens_deposited: string[] | null;
    total_tokens_withdrawn: string[] | null;
    total_deposited_usd: number | null;
    total_withdrawn_usd: number | null;
    total_deposit_txs: number | null;
    total_withdrawal_txs: number | null;
    total_address_deposited: string[] | null;
    total_address_withdrawn: string[] | null;
  }
) => {
  Object.entries(params).map(([key, val]) => {
    if (val == null) {
      if (allowNullTxValues) {
        console.info(`Transaction for bridgeID ${params.bridge_id} has a null value for ${key}.`);
      } else {
        throw new Error(`Transaction for bridgeID ${params.bridge_id} has a null value for ${key}.`);
      }
    }
  });
  for (let i = 0; i < 5; i++) {
    try {
      await sql`
        insert into bridges.hourly_aggregated ${sql(params)}
        ON CONFLICT (bridge_id, ts)
        DO UPDATE SET ${sql(params)}
      `;
      return;
    } catch (e) {
      if (i >= 4) {
        throw new Error(
          `Could not insert hourly aggregated row for bridge ${params.bridge_id} at timestamp ${params.ts}.`
        );
      } else {
        console.error(params.bridge_id, e);
        continue;
      }
    }
  }
};

// can combine with insertHourly
export const insertDailyAggregatedRow = async (
  sql: postgres.TransactionSql<{}>,
  allowNullTxValues: boolean,
  params: {
    bridge_id: string;
    ts: number;
    total_tokens_deposited: string[] | null;
    total_tokens_withdrawn: string[] | null;
    total_deposited_usd: number | null;
    total_withdrawn_usd: number | null;
    total_deposit_txs: number | null;
    total_withdrawal_txs: number | null;
    total_address_deposited: string[] | null;
    total_address_withdrawn: string[] | null;
  }
) => {
  Object.entries(params).map(([key, val]) => {
    if (val == null) {
      if (allowNullTxValues) {
        console.info(`Transaction for bridgeID ${params.bridge_id} has a null value for ${key}.`);
      } else {
        throw new Error(`Transaction for bridgeID ${params.bridge_id} has a null value for ${key}.`);
      }
    }
  });
  for (let i = 0; i < 5; i++) {
    try {
      await sql`
          insert into bridges.daily_aggregated ${sql(params)}
          ON CONFLICT (bridge_id, ts)
          DO UPDATE SET ${sql(params)}
        `;
      return;
    } catch (e) {
      if (i >= 4) {
        throw new Error(
          `Could not insert daily aggregated row for bridge ${params.bridge_id} at timestamp ${params.ts}.`
        );
      } else {
        console.error(params.bridge_id, e);
        continue;
      }
    }
  }
};

export const insertLargeTransactionRow = async (
  sql: postgres.TransactionSql<{}>,
  params: {
    tx_pk: number;
    ts: number;
    usd_value: number;
  }
) => {
  for (let i = 0; i < 5; i++) {
    try {
      await sql`
          insert into bridges.large_transactions ${sql(params)}
          ON CONFLICT (tx_pk)
          DO UPDATE SET ${sql(params)}
        `;
      return;
    } catch (e) {
      if (i >= 4) {
        throw new Error(
          `Could not insert large transaction row for tx with pk ${params.tx_pk} and timestamp ${params.ts}.`
        );
      } else {
        console.error(params.tx_pk, e);
        continue;
      }
    }
  }
};

export const insertErrorRow = async (params: {
  ts: number | null;
  target_table: string;
  keyword: string | null; // 'data', 'critical', 'missingBlocks'
  error: string | null;
}) => {
  for (let i = 0; i < 5; i++) {
    try {
      await sql`
          insert into bridges.errors ${sql(params)}
          ON CONFLICT (ts,error)
          DO UPDATE SET ${sql(params)}
        `;
      return;
    } catch (e) {
      if (i >= 4) {
        throw new Error(`Could not insert error row at timestamp ${params.ts} with error ${params.error}.`);
      } else {
        console.error(params.error, e);
        continue;
      }
    }
  }
};

export const insertOrUpdateTokenWithoutPrice = async (token: string, symbol: string) => {
  try {
    await sql`
        INSERT INTO bridges.tokens_without_price ${sql({ token, occurrence_count: 1, symbol })}
        ON CONFLICT (token)
        DO UPDATE SET occurrence_count = bridges.tokens_without_price.occurrence_count + 1, symbol = ${symbol};
      `;
  } catch (e) {
    console.error(`Could not insert or update token without price: ${token}`, e);
  }
};

export const insertTransactionRows = async (
  sql: postgres.TransactionSql<{}>,
  allowNullTxValues: boolean,
  transactions: Array<{
    bridge_id: string;
    chain: string;
    tx_hash: string | null;
    ts: number;
    tx_block: number | null;
    tx_from: string | null;
    tx_to: string | null;
    token: string;
    amount: string;
    is_deposit: boolean;
    is_usd_volume: boolean;
    txs_counted_as: number | null;
    origin_chain: string | null;
  }>,
  onConflict: "ignore" | "error" | "upsert" = "error"
) => {
  const validTransactions = transactions.filter((tx) => {
    if (typeof tx.ts !== "number" && typeof tx.ts !== "string") {
      console.error(
        `Invalid timestamp type ${typeof tx.ts} for transaction: bridge_id=${tx.bridge_id}, tx_hash=${tx.tx_hash}`
      );
      return false;
    }
    if (Number.isNaN(tx.ts)) {
      console.error(
        `Invalid timestamp value ${tx.ts} for transaction: bridge_id=${tx.bridge_id}, tx_hash=${tx.tx_hash}`
      );
      return false;
    }
    const isValidTimestamp = tx.ts > 0 && tx.ts < 2147483647000;
    if (!isValidTimestamp) {
      console.error(
        `Invalid timestamp value ${tx.ts} for transaction: bridge_id=${tx.bridge_id}, tx_hash=${tx.tx_hash}`
      );
      return false;
    }
    return true;
  });

  const uniqueTransactions = validTransactions.reduce((acc, tx) => {
    const key = `${tx.bridge_id}-${tx.chain}-${tx.tx_hash}-${tx.token}-${tx.tx_from}-${tx.tx_to}`;
    if (!acc.has(key)) {
      acc.set(key, tx);
    }
    return acc;
  }, new Map());

  const dedupedTransactions = Array.from(uniqueTransactions.values());

  if (dedupedTransactions.length === 0) {
    console.warn("No valid transactions to insert after validation and deduplication");
    return;
  }

  const sanitizedTransactions = dedupedTransactions.map((tx) => ({
    ...tx,
    tx_block: normalizeBlockNumber(tx.tx_block),
  }));

  sanitizedTransactions.forEach((params) => {
    Object.entries(params).forEach(([key, val]) => {
      if (val == null) {
        if (allowNullTxValues) {
        } else {
          throw new Error(`Transaction for bridgeID ${params.bridge_id} has a null value for ${key}.`);
        }
      } else {
        if (typeof val !== txTypes[key])
          throw new Error(
            `Transaction for bridgeID ${params.bridge_id} has ${typeof val} for ${key} when it must be ${txTypes[key]}.`
          );
      }
    });
  });

  let sqlCommand;
  if (onConflict === "ignore") {
    sqlCommand = sql`
      INSERT INTO bridges.transactions ${sql(sanitizedTransactions)}
      ON CONFLICT DO NOTHING
    `;
  } else if (onConflict === "upsert") {
    sqlCommand = sql`
      INSERT INTO bridges.transactions ${sql(sanitizedTransactions)}
      ON CONFLICT (bridge_id, chain, tx_hash, token, tx_from, tx_to)
      DO UPDATE SET
        ts = EXCLUDED.ts,
        tx_block = EXCLUDED.tx_block,
        amount = EXCLUDED.amount,
        is_deposit = EXCLUDED.is_deposit,
        is_usd_volume = EXCLUDED.is_usd_volume,
        txs_counted_as = EXCLUDED.txs_counted_as,
        origin_chain = EXCLUDED.origin_chain
    `;
  } else {
    sqlCommand = sql`
      INSERT INTO bridges.transactions ${sql(sanitizedTransactions)}
    `;
  }

  for (let i = 0; i < 5; i++) {
    try {
      await sqlCommand;
      console.log(`Inserted ${sanitizedTransactions.length} transactions of ${transactions.length}`);
      return;
    } catch (e) {
      if (i >= 4) {
        throw new Error(`Could not insert transaction rows in batch.`);
      } else {
        console.error(`Failed batch insert attempt ${i + 1}:`, e);
        console.error(sanitizedTransactions);
        continue;
      }
    }
  }
};
