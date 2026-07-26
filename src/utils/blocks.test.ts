import assert from "node:assert/strict";
import test from "node:test";
import { getLatestBlockFromProvider, getLatestEvmBlock } from "./blocks";

test("RPC latest block lookup validates and normalizes provider responses", async () => {
  assert.deepEqual(
    await getLatestBlockFromProvider("example", {
      getBlockNumber: async () => 123,
      getBlock: async () => ({ timestamp: "456" }),
    }),
    { number: 123, timestamp: 456 }
  );
});

test("RPC latest block lookup rejects malformed provider responses", async () => {
  await assert.rejects(
    () =>
      getLatestBlockFromProvider("example", {
        getBlockNumber: async () => 123,
        getBlock: async () => null,
      }),
    /invalid latest block/
  );
});

test("latest EVM block lookup uses RPC before timestamp lookup", async () => {
  let timestampLookups = 0;
  const block = await getLatestEvmBlock(
    "example",
    () => ({
      getBlockNumber: async () => 123,
      getBlock: async () => ({ timestamp: 456 }),
    }),
    async () => {
      timestampLookups++;
      return { number: 100, timestamp: 400 };
    }
  );

  assert.deepEqual(block, { number: 123, timestamp: 456 });
  assert.equal(timestampLookups, 0);
});

test("latest EVM block lookup falls back after an RPC timeout", async () => {
  const block = await getLatestEvmBlock(
    "example",
    () => ({
      getBlockNumber: async () => new Promise<number>(() => {}),
      getBlock: async () => ({ timestamp: 456 }),
    }),
    async () => ({ number: 100, timestamp: 400 }),
    undefined,
    5
  );

  assert.deepEqual(block, { number: 100, timestamp: 400 });
});

test("latest RPC block lookup aborts without running the fallback", async () => {
  const controller = new AbortController();
  let timestampLookups = 0;
  const lookup = getLatestEvmBlock(
    "example",
    () => ({
      getBlockNumber: async () => new Promise<number>(() => {}),
      getBlock: async () => ({ timestamp: 456 }),
    }),
    async () => {
      timestampLookups++;
      return { number: 100, timestamp: 400 };
    },
    controller.signal
  );
  controller.abort();

  await assert.rejects(lookup, { name: "AbortError" });
  assert.equal(timestampLookups, 0);
});

test("latest timestamp fallback is also bounded and abortable", async () => {
  const controller = new AbortController();
  const lookup = getLatestEvmBlock(
    "example",
    () => null,
    async () => new Promise<{ number: number; timestamp: number }>(() => {}),
    controller.signal,
    5,
    50
  );
  controller.abort();

  await assert.rejects(lookup, { name: "AbortError" });
});
