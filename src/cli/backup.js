const dotenv = require("dotenv");
const dayjs = require("dayjs");
const zlib = require("zlib");
const { sql } = require("../utils/db");
const { storeBackup } = require("../utils/s3");

dotenv.config();

const BACKUP_PREFIX = process.env.BACKUP_PREFIX || "transactions/daily-backup";
const DAY_BATCH_SIZE = Number(process.env.DAY_BATCH_SIZE || "100000");

async function backupSingleDay(dayStart) {
  const start = dayStart.startOf("day").toISOString();
  const end = dayStart.add(1, "day").startOf("day").toISOString();
  const dateLabel = dayStart.format("YYYY-MM-DD");
  const MIN_INT_ID = -2147483648;

  const [{ count: rowsInDay }] = await sql`
    SELECT COUNT(*)::int AS count
    FROM bridges.transactions
    WHERE ts >= ${start} AND ts < ${end}
  `;

  if (rowsInDay === 0) {
    console.log(`[INFO] ${dateLabel}: no rows to backup, nothing to do`);
    return;
  }

  console.log(`[INFO] ${dateLabel}: backing up ${rowsInDay} rows (batch size ${DAY_BATCH_SIZE})`);

  const key = `${BACKUP_PREFIX}/${dateLabel}.ndjson.gz`;
  const chunks = [];

  let lastId = MIN_INT_ID;
  let processed = 0;

  while (true) {
    const rows = await sql`
      SELECT *
      FROM bridges.transactions
      WHERE ts >= ${start} AND ts < ${end} AND id > ${lastId}
      ORDER BY id ASC
      LIMIT ${DAY_BATCH_SIZE}
    `;

    if (rows.length === 0) break;

    lastId = rows[rows.length - 1].id;
    processed += rows.length;

    chunks.push(rows.map((row) => JSON.stringify(row)).join("\n") + "\n");

    if (processed % (DAY_BATCH_SIZE * 2) === 0 || processed === rowsInDay) {
      console.log(`[INFO] ${dateLabel}: streamed ${processed}/${rowsInDay} rows`);
    }
  }

  const bodyBuffer = Buffer.from(chunks.join(""));
  const payload = zlib.gzipSync(bodyBuffer);

  await storeBackup(key, payload);
  console.log(`[INFO] ${dateLabel}: upload complete to ${key}`);

  const [{ deleted_count: deletedCount }] = await sql`
    WITH del AS (
      DELETE FROM bridges.transactions
      WHERE ts >= ${start} AND ts < ${end}
      RETURNING 1
    )
    SELECT COUNT(*)::int AS deleted_count FROM del
  `;

  if (deletedCount !== rowsInDay) {
    console.warn(
      `[WARN] ${dateLabel}: deleted ${deletedCount} rows, expected ${rowsInDay} (new rows may have arrived during backup)`
    );
  } else {
    console.log(`[INFO] ${dateLabel}: deleted ${deletedCount} rows from DB`);
  }
}

async function main() {
  const targetDay = dayjs().subtract(30, "day").startOf("day");
  console.log(`[INFO] Running 1-day backup for ${targetDay.format("YYYY-MM-DD")} (30 days ago)`);
  await backupSingleDay(targetDay);
}

main()
  .catch((error) => {
    console.error("[ERROR] backupSingleDay failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await sql.end();
    } catch (e) {
      console.error("[WARN] Failed to close SQL connection pool:", e);
    }
    process.exit();
  });
