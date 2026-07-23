import assert from "node:assert/strict";
import test from "node:test";
import { getEstimatedSolanaSlotTimestamp, isSkippedSolanaSlotError } from "./solana";

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
