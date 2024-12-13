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
        SUM(CAST(ha.total_deposited_usd AS NUMERIC)) as total_deposited_usd,
        SUM(CAST(ha.total_withdrawn_usd AS NUMERIC)) as total_withdrawn_usd,
        SUM(CAST(ha.total_deposit_txs AS INTEGER)) as total_deposit_txs,
        SUM(CAST(ha.total_withdrawal_txs AS INTEGER)) as total_withdrawal_txs,
        c.chain
      FROM bridges.hourly_aggregated ha
      JOIN bridges.config c ON ha.bridge_id = c.id
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

    console.log("Daily volume aggregation completed successfully");
  } catch (error) {
    console.error("Error during daily volume aggregation:", error);
    throw error;
  }
}

export { aggregateDailyVolume };
