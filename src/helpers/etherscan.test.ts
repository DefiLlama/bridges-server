import assert from "node:assert/strict";
import test from "node:test";
import {
  collectPaginatedExplorerTransactions,
  EXPLORER_PAGE_SIZE,
  EXPLORER_REQUEST_INTERVAL_MS,
  getExplorerConfig,
  parseExplorerTransactions,
} from "./etherscan";
import { NonRetryableError } from "../utils/errors";

test("Etherscan V2 config uses chainid and the shared key", () => {
  assert.deepEqual(getExplorerConfig("base", { ETHERSCAN_API_KEY: "test", ETHERSCAN_PLAN: "lite" }), {
    endpoint: "https://api.etherscan.io/v2/api",
    apiKey: "test",
    chainId: "8453",
  });
});

test("free-tier policy rejects paid chains before making a request", () => {
  assert.throws(() => getExplorerConfig("base", { ETHERSCAN_API_KEY: "test" }), NonRetryableError);
  assert.deepEqual(getExplorerConfig("op_bnb", { ETHERSCAN_API_KEY: "test" }), {
    endpoint: "https://api.etherscan.io/v2/api",
    apiKey: "test",
    chainId: "204",
  });
});

test("custom explorers use per-chain environment variables", () => {
  assert.deepEqual(
    getExplorerConfig("scroll", {
      EXPLORER_API_URL_SCROLL: "https://example.test",
      EXPLORER_API_KEY_SCROLL: "custom",
    }),
    { endpoint: "https://example.test/api", apiKey: "custom" }
  );
});

test("missing explorer configuration and invalid upstream responses are non-retryable", () => {
  assert.throws(() => getExplorerConfig("unknown", {}), NonRetryableError);
  assert.throws(
    () => parseExplorerTransactions({ status: "0", message: "NOTOK", result: "deprecated endpoint" }, "0x1"),
    NonRetryableError
  );
  assert.deepEqual(parseExplorerTransactions({ status: "0", message: "No transactions found", result: [] }, "0x1"), []);
});

test("free-tier rate limiter stays at or below three requests per second", () => {
  assert.ok(EXPLORER_REQUEST_INTERVAL_MS >= Math.ceil(1000 / 3));
});

test("txlist pagination continues after a full 1000-row page", async () => {
  const firstPage = Array.from({ length: EXPLORER_PAGE_SIZE }, (_, index) => ({ hash: `0x${index}` }));
  const calls: number[] = [];
  const transactions = await collectPaginatedExplorerTransactions(async (page) => {
    calls.push(page);
    return page === 1 ? firstPage : [{ hash: "0xlast" }];
  }, "ethereum:0xtest");

  assert.equal(transactions.length, EXPLORER_PAGE_SIZE + 1);
  assert.deepEqual(calls, [1, 2]);
});

test("duplicate pages fail closed instead of advancing the checkpoint", async () => {
  const page = [{ hash: "0x1" }, { hash: "0x2" }];
  await assert.rejects(
    () => collectPaginatedExplorerTransactions(async () => page, "ethereum:0xtest", page.length),
    NonRetryableError
  );
});
