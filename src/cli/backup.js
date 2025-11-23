const dotenv = require("dotenv");
dotenv.config();

const dayjs = require("dayjs");
const zlib = require("zlib");
const postgres = require("postgres");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const connectionString =
  process.env.DB_URL ||
  `postgresql://${process.env.PSQL_USERNAME}:${process.env.PSQL_PW}@${process.env.PSQL_URL}:5433/postgres`;

const sql = postgres(connectionString, {
  idle_timeout: 120,
  max_lifetime: 60 * 30,
  max: 3,
  connect_timeout: 30,
  keep_alive: true,
});

const backupClient =
  process.env.BB_AWS_S3_ENDPOINT && process.env.BB_AWS_REGION
    ? new S3Client({
      endpoint: process.env.BB_AWS_S3_ENDPOINT,
      region: process.env.BB_AWS_REGION,
      forcePathStyle: true,
    })
    : null;

const BACKUP_BUCKET = process.env.AWS_S3_BACKUP_BUCKET;

async function storeBackup(key, body) {
  const params = {
    Bucket: BACKUP_BUCKET,
    Key: key,
    Body: body,
  };

  const command = new PutObjectCommand(params);
  await backupClient.send(command);
}

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
