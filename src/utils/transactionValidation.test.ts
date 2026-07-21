import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeTransactionParams, TransactionInsertParams } from "./wrappa/postgres/write";
import { NonRetryableError } from "./errors";

const validTransaction: TransactionInsertParams = {
  bridge_id: "1",
  chain: "ethereum",
  tx_hash: null,
  ts: 1,
  tx_block: null,
  tx_from: null,
  tx_to: null,
  token: "0xtoken",
  amount: "1",
  is_deposit: true,
  is_usd_volume: false,
  txs_counted_as: null,
  origin_chain: null,
};

test("optional undefined transaction fields are normalized to null when allowed", () => {
  const transaction = { ...validTransaction, tx_hash: undefined } as unknown as TransactionInsertParams;
  assert.equal(sanitizeTransactionParams(transaction, true).tx_hash, null);
});

test("missing or empty required transaction fields are non-retryable", () => {
  assert.throws(
    () => sanitizeTransactionParams({ ...validTransaction, token: undefined } as any, true),
    NonRetryableError
  );
  assert.throws(() => sanitizeTransactionParams({ ...validTransaction, token: "" }, true), NonRetryableError);
});
