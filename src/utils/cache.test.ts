import assert from "node:assert/strict";
import test from "node:test";
import { parseDurableCheckpoint, resolveApiCacheLookup, scanKeys } from "./cache";

const payload = JSON.stringify([{ date: "1784678400", depositUSD: 1 }]);
const metadata = JSON.stringify({ cacheTTL: 4200, storedAt: 1784714605035 });

test("resolves a normal fresh API cache entry", () => {
  assert.deepEqual(resolveApiCacheLookup(payload, payload, metadata), {
    state: "fresh",
    value: [{ date: "1784678400", depositUSD: 1 }],
    metadata: { cacheTTL: 4200, storedAt: 1784714605035 },
  });
});

test("falls back to stale payload when the fresh value is cache metadata", () => {
  assert.deepEqual(resolveApiCacheLookup(metadata, payload, payload), {
    state: "stale",
    value: [{ date: "1784678400", depositUSD: 1 }],
    metadata: undefined,
  });
});

test("treats metadata-only cache entries as a miss", () => {
  assert.deepEqual(resolveApiCacheLookup(metadata, metadata, metadata), { state: "miss" });
});

test("validates durable Redis checkpoint values", () => {
  assert.equal(parseDurableCheckpoint(null, "adapter_progress:test"), null);
  assert.equal(parseDurableCheckpoint("1784761200", "adapter_progress:test"), 1784761200);
  assert.throws(() => parseDurableCheckpoint("not-a-number", "adapter_progress:test"), /invalid value/);
  assert.throws(() => parseDurableCheckpoint("-1", "adapter_progress:test"), /invalid value/);
});

test("scans every Redis cursor page for matching keys", async () => {
  const calls: Array<[string, string, string, string, number]> = [];
  const pages: Record<string, [string, string[]]> = {
    "0": ["17", ["getlogs_count:2026-09-25:aori:ethereum"]],
    "17": ["0", ["getlogs_count:2026-09-25:aori:ethereum", "getlogs_count:2026-09-25:relay:base"]],
  };
  const client = {
    scan: async (...args: [string, string, string, string, number]) => {
      calls.push(args);
      return pages[args[0]];
    },
  };

  const keys = await scanKeys(client, "getlogs_count:2026-09-25:*");

  assert.deepEqual(keys, ["getlogs_count:2026-09-25:aori:ethereum", "getlogs_count:2026-09-25:relay:base"]);
  assert.deepEqual(calls, [
    ["0", "MATCH", "getlogs_count:2026-09-25:*", "COUNT", 1000],
    ["17", "MATCH", "getlogs_count:2026-09-25:*", "COUNT", 1000],
  ]);
});
