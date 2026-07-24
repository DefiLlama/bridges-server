import assert from "node:assert/strict";
import test from "node:test";
import {
  getEstimatedSolanaSlotTimestamp,
  isSkippedSolanaSlotError,
  normalizeSolanaTimestampMs,
  resolveSolanaEventTimestamps,
} from "./solana";

test("uses the nearest prior Solana slot when the requested slot was skipped", async () => {
  const requested: number[] = [];
  const connection = {
    getBlockTime: async (slot: number) => {
      requested.push(slot);
      if (slot === 100) throw new Error("slot was skipped");
      return slot === 99 ? 1_000 : null;
    },
  };

  assert.equal(await getEstimatedSolanaSlotTimestamp(100, connection as any), 1_000);
  assert.deepEqual(requested, [100, 99]);
});

test("recognizes the skipped-slot RPC variant", () => {
  assert.equal(isSkippedSolanaSlotError(new Error("Slot 100 was skipped, or missing in long-term storage")), true);
});

test("fails immediately on a Solana RPC outage instead of amplifying it", async () => {
  let calls = 0;
  const connection = {
    getBlockTime: async () => {
      calls += 1;
      throw new Error("429 Too Many Requests");
    },
  };

  await assert.rejects(() => getEstimatedSolanaSlotTimestamp(100, connection as any, 64), /429 Too Many Requests/);
  assert.equal(calls, 1);
});

test("reuses adapter-provided Solana timestamps without RPC fan-out", async () => {
  let calls = 0;
  const connection = {
    getBlockTime: async () => {
      calls++;
      return 1_000;
    },
  };
  const timestamps = await resolveSolanaEventTimestamps(
    [
      { blockNumber: 10, timestamp: 1_784_000_000 },
      { blockNumber: 11, timestamp: 1_784_000_001_000 },
      { blockNumber: 10, timestamp: 1_784_000_000 },
    ],
    connection as any
  );

  assert.equal(calls, 0);
  assert.deepEqual(timestamps, {
    10: 1_784_000_000_000,
    11: 1_784_000_001_000,
  });
});

test("deduplicates missing Solana slots and bounds RPC concurrency", async () => {
  let calls = 0;
  let active = 0;
  let maxActive = 0;
  const connection = {
    getBlockTime: async (slot: number) => {
      calls++;
      active++;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active--;
      return 1_784_000_000 + slot;
    },
  };

  const timestamps = await resolveSolanaEventTimestamps(
    [{ blockNumber: 10 }, { blockNumber: 10 }, { blockNumber: 11 }, { blockNumber: 12 }],
    connection as any,
    undefined,
    2
  );

  assert.equal(calls, 3);
  assert.equal(maxActive, 2);
  assert.equal(timestamps[10], normalizeSolanaTimestampMs(1_784_000_010));
});
