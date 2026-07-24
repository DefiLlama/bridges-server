import assert from "node:assert/strict";
import test from "node:test";
import { getLatestBlockFromProvider } from "./blocks";

test("RPC latest block fallback validates and normalizes provider responses", async () => {
  assert.deepEqual(
    await getLatestBlockFromProvider("example", {
      getBlockNumber: async () => 123,
      getBlock: async () => ({ timestamp: "456" }),
    }),
    { number: 123, timestamp: 456 }
  );
});

test("RPC latest block fallback rejects malformed provider responses", async () => {
  await assert.rejects(
    () =>
      getLatestBlockFromProvider("example", {
        getBlockNumber: async () => 123,
        getBlock: async () => null,
      }),
    /invalid latest block/
  );
});
