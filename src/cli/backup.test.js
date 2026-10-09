const assert = require("node:assert/strict");
const test = require("node:test");
const zlib = require("node:zlib");
const dayjs = require("dayjs");

const { backupSingleDay } = require("./backup");

const backupDay = dayjs("2026-08-01T00:00:00.000Z");

function createSql(rows, snapshotCount = rows.length, { removeDuringCleanup = false } = {}) {
  const snapshotMaxId = rows.reduce((max, row) => Math.max(max, row.id), 0);
  let cleanupRaceTriggered = false;

  const makeClient = (currentRows) => {
    const client = async (strings, ...values) => {
      const query = strings.join("?");

      if (query.includes("FOR UPDATE")) {
        assert.equal(values.length, 3);
        if (removeDuringCleanup && !cleanupRaceTriggered) {
          cleanupRaceTriggered = true;
          const [removed] = rows.splice(0, 1);
          const removedIndex = currentRows.findIndex((row) => row.id === removed.id);
          currentRows.splice(removedIndex, 1);
        }
        return currentRows.filter((row) => row.id <= snapshotMaxId).map(({ id }) => ({ id }));
      }

      if (query.includes("DELETE FROM")) {
        assert.equal(values.length, 3);
        const maxId = values[2];
        const matching = currentRows.filter((row) => row.id <= maxId);
        const deletedIds = new Set(matching.map((row) => row.id));
        currentRows.splice(0, currentRows.length, ...currentRows.filter((row) => !deletedIds.has(row.id)));
        return [{ deleted_count: matching.length }];
      }

      if (query.includes("SELECT COUNT")) {
        assert.equal(values.length, 2);
        return [{ count: snapshotCount, max_id: snapshotMaxId }];
      }

      if (query.includes("SELECT *")) {
        assert.equal(values.length, 5);
        const lastId = values[2];
        const maxId = values[3];
        return currentRows.filter((row) => row.id > lastId && row.id <= maxId);
      }

      throw new Error(`unexpected query: ${query}`);
    };

    client.begin = async (callback) => {
      const transactionRows = rows.map((row) => ({ ...row }));
      const result = await callback(makeClient(transactionRows));
      rows.splice(0, rows.length, ...transactionRows);
      return result;
    };

    return client;
  };

  return makeClient(rows);
}

function readIds(payload) {
  return zlib
    .gunzipSync(payload)
    .toString()
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line).id);
}

test("keeps transactions inserted after the backup snapshot", async () => {
  const rows = [
    { id: 1, ts: "2026-08-01T01:00:00.000Z" },
    { id: 2, ts: "2026-08-01T02:00:00.000Z" },
  ];
  let archivedIds;

  await backupSingleDay(backupDay, {
    sqlClient: createSql(rows),
    backupPrefix: "transactions/daily-backup",
    uploadBackup: async (_key, payload) => {
      archivedIds = readIds(payload);
      rows.push({ id: 3, ts: "2026-08-01T03:00:00.000Z" });
    },
  });

  assert.deepEqual(archivedIds, [1, 2]);
  assert.deepEqual(
    rows.map((row) => row.id),
    [3]
  );
});

test("does not upload or delete an incomplete snapshot", async () => {
  const rows = [{ id: 1, ts: "2026-08-01T01:00:00.000Z" }];
  let uploaded = false;

  await assert.rejects(
    backupSingleDay(backupDay, {
      sqlClient: createSql(rows, 2),
      backupPrefix: "transactions/daily-backup",
      uploadBackup: async () => {
        uploaded = true;
      },
    }),
    /streamed 1 of 2 rows/
  );

  assert.equal(uploaded, false);
  assert.deepEqual(
    rows.map((row) => row.id),
    [1]
  );
});

test("does not delete the rest of a snapshot when rows disappear before cleanup", async () => {
  const rows = [
    { id: 1, ts: "2026-08-01T01:00:00.000Z" },
    { id: 2, ts: "2026-08-01T02:00:00.000Z" },
  ];

  await assert.rejects(
    backupSingleDay(backupDay, {
      sqlClient: createSql(rows),
      backupPrefix: "transactions/daily-backup",
      uploadBackup: async () => {
        rows.shift();
      },
    }),
    /found 1 of 2 rows before cleanup/
  );

  assert.deepEqual(
    rows.map((row) => row.id),
    [2]
  );
});

test("rolls back cleanup if a transaction disappears while rows are being locked", async () => {
  const rows = [
    { id: 1, ts: "2026-08-01T01:00:00.000Z" },
    { id: 2, ts: "2026-08-01T02:00:00.000Z" },
  ];

  await assert.rejects(
    backupSingleDay(backupDay, {
      sqlClient: createSql(rows, rows.length, { removeDuringCleanup: true }),
      backupPrefix: "transactions/daily-backup",
      uploadBackup: async () => {},
    }),
    /found 1 of 2 rows before cleanup/
  );

  assert.deepEqual(
    rows.map((row) => row.id),
    [2]
  );
});
