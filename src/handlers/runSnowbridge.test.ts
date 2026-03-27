/**
 * Tests the handler with real Snowbridge API, DefiLlama price, and real DB.
 * Loads .env so DB connection uses your local config (no env vars needed in the shell).
 *
 * Run: npx tsx src/handlers/runSnowbridge.test.ts
 */
import "dotenv/config";

import { handler } from "./runSnowbridge";
import { sql } from "../utils/db";

async function runTests() {
  await handler();

  const rows = await sql`
    SELECT COUNT(*)::int as n FROM bridges.transactions t
    JOIN bridges.config c ON t.bridge_id = c.id
    WHERE c.bridge_name = 'snowbridge'
  `;
  const count = rows[0]?.n ?? 0;
  if (count === 0) {
    throw new Error("Expected at least one snowbridge transaction to be inserted; got 0. Check that DB_NAME or DB_URL points to the database where you ran the schema (e.g. defilama).");
  }
  console.log(`Handler test passed. Snowbridge transactions in DB: ${count}`);
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
