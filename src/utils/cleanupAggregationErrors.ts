import { parseAggregationErrorCleanupArgs } from "./aggregationErrorCleanup";
import { sql } from "./db";

const ZERO_SIDE_ERROR_PATTERN = "Total Value Deposited = % and Total Value Withdrawn = % for % from % to %.";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  const config = parseAggregationErrorCleanupArgs(process.argv.slice(2));
  const cutoff = new Date(Date.now() - config.retentionDays * 24 * 60 * 60 * 1000);
  const maximumRows = config.batchSize * config.maxBatches;

  console.log(
    `[CLEANUP] mode=${config.execute ? "execute" : "dry-run"} cutoff=${cutoff.toISOString()} ` +
      `batchSize=${config.batchSize} maxBatches=${config.maxBatches} maximumRows=${maximumRows}`
  );

  if (!config.execute) {
    const rows = await sql<Array<{ id: number; ts: Date }>>`
      SELECT id, ts
      FROM bridges.errors
      WHERE target_table IN ('hourly_aggregated', 'daily_aggregated')
        AND ts < ${cutoff}
        AND error LIKE ${ZERO_SIDE_ERROR_PATTERN}
      ORDER BY ts
      LIMIT ${config.batchSize}
    `;
    console.log(
      `[CLEANUP] Dry run found ${rows.length}${rows.length === config.batchSize ? "+" : ""} matching rows. ` +
        `Re-run with --execute after the fixed cron is deployed.`
    );
    return;
  }

  let totalDeleted = 0;
  for (let batch = 1; batch <= config.maxBatches; batch++) {
    const [result] = await sql<Array<{ deleted: number }>>`
      WITH doomed AS (
        SELECT ctid
        FROM bridges.errors
        WHERE target_table IN ('hourly_aggregated', 'daily_aggregated')
          AND ts < ${cutoff}
          AND error LIKE ${ZERO_SIDE_ERROR_PATTERN}
        ORDER BY ts
        LIMIT ${config.batchSize}
        FOR UPDATE SKIP LOCKED
      ),
      deleted AS (
        DELETE FROM bridges.errors AS errors
        USING doomed
        WHERE errors.ctid = doomed.ctid
        RETURNING 1
      )
      SELECT COUNT(*)::int AS deleted
      FROM deleted
    `;
    const deleted = result?.deleted ?? 0;
    totalDeleted += deleted;
    console.log(`[CLEANUP] Batch ${batch}/${config.maxBatches}: deleted=${deleted}, total=${totalDeleted}`);
    if (deleted < config.batchSize) break;
    await wait(config.pauseMs);
  }

  console.log(`[CLEANUP] Finished. Deleted ${totalDeleted} rows (bounded maximum ${maximumRows}).`);
};

main()
  .catch((error) => {
    console.error("[CLEANUP] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
