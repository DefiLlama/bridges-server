import postgres from "postgres";
import { sql } from "../../db";

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
  },
  onConflict: "ignore" | "error" | "upsert" = "error"
) => {
  // FIX should use dynamicly built strings here, I just didn't finish it
  let sqlCommand = sql`
  insert into bridges.transactions ${sql(params)}
`;
  if (onConflict === "ignore") {
    sqlCommand = sql`
      insert into bridges.transactions ${sql(params)}
      ON CONFLICT DO NOTHING
    `;
  } else if (onConflict === "upsert") {
    sqlCommand = sql`
      insert into bridges.transactions ${sql(params)}
      ON CONFLICT (bridge_id, chain, tx_hash, token, tx_from, tx_to)
      DO UPDATE SET ${sql(params)}
    `;
  }

  Object.entries(params).map(([key, val]) => {
    if (val == null) {
      if (allowNullTxValues) {
        // console.info(`Transaction for bridgeID ${params.bridge_id} has a null value for ${key}.`);
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
  for (let i = 0; i < 5; i++) {
    try {
      await sqlCommand;
      return;
    } catch (e) {
      if (i >= 4) {
        throw new Error(`Could not insert transaction row for bridge ${params.bridge_id}.`);
      } else {
        console.error(`id: ${params.bridge_id}, txHash: ${params.tx_hash}`, e);
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
