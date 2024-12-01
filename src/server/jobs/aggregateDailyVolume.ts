import { sql } from "../../utils/db";

async function aggregateDailyVolume() {
  try {
    await sql`
      INSERT INTO bridges.daily_volume (
        bridge_id,
        ts,
        total_deposited_usd,
        total_withdrawn_usd,
        total_deposit_txs,
        total_withdrawal_txs,
        chain
      )
      SELECT 
        ha.bridge_id,
        date_trunc('day', ha.ts) as ts,
        CAST(SUM(ha.total_deposited_usd) AS NUMERIC) as total_deposited_usd,
        CAST(SUM(ha.total_withdrawn_usd) AS NUMERIC) as total_withdrawn_usd,
        CAST(SUM(ha.total_deposit_txs) AS INTEGER) as total_deposit_txs,
        CAST(SUM(ha.total_withdrawal_txs) AS INTEGER) as total_withdrawal_txs,
        c.chain
      FROM bridges.hourly_aggregated ha
      JOIN bridges.config c ON ha.bridge_id = c.id
      WHERE 
        (ha.total_deposited_usd IS NOT NULL AND ha.total_deposited_usd::text ~ '^[0-9]+(\.[0-9]+)?$')
        AND (ha.total_withdrawn_usd IS NOT NULL AND ha.total_withdrawn_usd::text ~ '^[0-9]+(\.[0-9]+)?$')
        AND (ha.total_deposit_txs IS NOT NULL AND ha.total_deposit_txs::text ~ '^[0-9]+$')
        AND (ha.total_withdrawal_txs IS NOT NULL AND ha.total_withdrawal_txs::text ~ '^[0-9]+$')
      GROUP BY 
        ha.bridge_id,
        date_trunc('day', ha.ts),
        c.chain
      ON CONFLICT (bridge_id, ts, chain) DO UPDATE SET
        total_deposited_usd = EXCLUDED.total_deposited_usd,
        total_withdrawn_usd = EXCLUDED.total_withdrawn_usd,
        total_deposit_txs = EXCLUDED.total_deposit_txs,
        total_withdrawal_txs = EXCLUDED.total_withdrawal_txs;
    `;

    console.log("Daily volume migration completed successfully");
  } catch (error) {
    console.error("Error during daily volume migration:", error);
    throw error;
  }
}

export { aggregateDailyVolume };
