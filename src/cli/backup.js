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
        credentials: {
          accessKeyId: process.env.BB_AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.BB_AWS_SECRET_ACCESS_KEY,
        },
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
const WRITE_CHUNK_ROWS = 5000;
const MIN_INT_ID = -2147483648;

async function backupSingleDay(
  dayStart,
  { sqlClient = sql, uploadBackup = storeBackup, backupPrefix = BACKUP_PREFIX } = {}
) {
  const start = dayStart.startOf("day").toISOString();
  const end = dayStart.add(1, "day").startOf("day").toISOString();
  const dateLabel = dayStart.format("YYYY-MM-DD");

  const [{ count: rowsInDay, max_id: snapshotMaxId }] = await sqlClient`
    SELECT COUNT(*)::int AS count, MAX(id)::int AS max_id
    FROM bridges.transactions
    WHERE ts >= ${start} AND ts < ${end}
  `;

  if (rowsInDay === 0) {
    console.log(`[INFO] ${dateLabel}: no rows to backup, nothing to do`);
    return;
  }

  console.log(`[INFO] ${dateLabel}: backing up ${rowsInDay} rows (batch size ${DAY_BATCH_SIZE})`);

  const key = `${backupPrefix}/${dateLabel}.ndjson.gz`;

  // gzip each batch as it is read, joining a high volume day first can exceed v8's string limit
  const gzip = zlib.createGzip();
  const gzChunks = [];
  let gzError = null;
  gzip.on("data", (chunk) => gzChunks.push(chunk));
  gzip.on("error", (error) => {
    gzError = error;
  });
  const gzipDone = new Promise((resolve, reject) => {
    gzip.on("end", resolve);
    gzip.on("error", reject);
  });
  // the write path can fail first, keep this rejection handled until it gets awaited
  gzipDone.catch(() => {});

  const writeChunk = (str) =>
    new Promise((resolve, reject) => {
      if (gzError) return reject(gzError);
      gzip.write(str, (error) => (error ? reject(error) : resolve()));
    });

  let lastId = MIN_INT_ID;
  let processed = 0;

  while (true) {
    const rows = await sqlClient`
      SELECT *
      FROM bridges.transactions
      WHERE ts >= ${start} AND ts < ${end} AND id > ${lastId} AND id <= ${snapshotMaxId}
      ORDER BY id ASC
      LIMIT ${DAY_BATCH_SIZE}
    `;

    if (rows.length === 0) break;

    lastId = rows[rows.length - 1].id;
    processed += rows.length;

    for (let i = 0; i < rows.length; i += WRITE_CHUNK_ROWS) {
      const slice = rows.slice(i, i + WRITE_CHUNK_ROWS);
      await writeChunk(slice.map((row) => JSON.stringify(row)).join("\n") + "\n");
    }

    if (processed % (DAY_BATCH_SIZE * 2) === 0 || processed === rowsInDay) {
      console.log(`[INFO] ${dateLabel}: streamed ${processed}/${rowsInDay} rows`);
    }
  }

  if (processed !== rowsInDay) {
    gzip.destroy();
    throw new Error(`${dateLabel}: streamed ${processed} of ${rowsInDay} rows, leaving the database unchanged`);
  }

  gzip.end();
  await gzipDone;

  const payload = Buffer.concat(gzChunks);
  console.log(`[INFO] ${dateLabel}: gzipped payload is ${payload.length} bytes`);

  await uploadBackup(key, payload);
  console.log(`[INFO] ${dateLabel}: upload complete to ${key}`);

  // only remove the rows we backed up, anything newer stays in postgres instead of being lost
  const deletedCount = await sqlClient.begin(async (transaction) => {
    const rowsToDelete = await transaction`
      SELECT id
      FROM bridges.transactions
      WHERE ts >= ${start} AND ts < ${end} AND id <= ${snapshotMaxId}
      ORDER BY id
      FOR UPDATE
    `;

    if (rowsToDelete.length !== rowsInDay) {
      throw new Error(`${dateLabel}: found ${rowsToDelete.length} of ${rowsInDay} rows before cleanup`);
    }

    const [{ deleted_count: count }] = await transaction`
      WITH del AS (
        DELETE FROM bridges.transactions
        WHERE ts >= ${start} AND ts < ${end} AND id <= ${snapshotMaxId}
        RETURNING 1
      )
      SELECT COUNT(*)::int AS deleted_count FROM del
    `;

    if (count !== rowsInDay) {
      throw new Error(`${dateLabel}: deleted ${count} rows after backing up ${rowsInDay}`);
    }

    return count;
  });

  console.log(`[INFO] ${dateLabel}: deleted ${deletedCount} rows from DB`);
}

async function main() {
  const targetDay = dayjs().subtract(30, "day").startOf("day");
  console.log(`[INFO] Running 1-day backup for ${targetDay.format("YYYY-MM-DD")} (30 days ago)`);
  await backupSingleDay(targetDay);
}

if (require.main === module) {
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
}

module.exports = { backupSingleDay };
