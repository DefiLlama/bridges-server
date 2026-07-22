import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeTransactionCursor,
  DEFAULT_TRANSACTIONS_LIMIT,
  encodeTransactionCursor,
  parseTransactionsLimit,
} from "./transactionCursor";

test("uses 10000 as the default and maximum transaction limit", () => {
  assert.equal(parseTransactionsLimit(), DEFAULT_TRANSACTIONS_LIMIT);
  assert.equal(parseTransactionsLimit("1"), 1);
  assert.equal(parseTransactionsLimit("9999"), 9999);
  assert.equal(parseTransactionsLimit("10000"), 10000);
  assert.equal(parseTransactionsLimit("0"), undefined);
  assert.equal(parseTransactionsLimit("10001"), undefined);
  assert.equal(parseTransactionsLimit("1.5"), undefined);
  assert.equal(parseTransactionsLimit("01"), undefined);
});

test("round-trips an opaque transaction cursor", () => {
  const cursor = {
    timestamp: "2026-07-22T15:32:36.123456Z",
    id: "9223372036854775807",
  };

  assert.deepEqual(decodeTransactionCursor(encodeTransactionCursor(cursor)), cursor);
});

test("rejects malformed and unsupported transaction cursors", () => {
  assert.equal(decodeTransactionCursor("not-json"), undefined);
  assert.equal(
    decodeTransactionCursor(
      Buffer.from(JSON.stringify({ v: 2, t: "2026-07-22T15:32:36.123456Z", i: "1" })).toString("base64url")
    ),
    undefined
  );
  assert.equal(
    decodeTransactionCursor(Buffer.from(JSON.stringify({ v: 1, t: "not-a-date", i: "1" })).toString("base64url")),
    undefined
  );
  assert.equal(
    decodeTransactionCursor(
      Buffer.from(JSON.stringify({ v: 1, t: "2026-02-30T15:32:36.123456Z", i: "1" })).toString("base64url")
    ),
    undefined
  );
  assert.equal(
    decodeTransactionCursor(
      Buffer.from(JSON.stringify({ v: 1, t: "2026-07-22T15:32:36.123456Z", i: "1 OR 1=1" })).toString("base64url")
    ),
    undefined
  );
  assert.equal(
    decodeTransactionCursor(
      Buffer.from(JSON.stringify({ v: 1, t: "2026-07-22T15:32:36.123456Z", i: "9223372036854775808" })).toString(
        "base64url"
      )
    ),
    undefined
  );
});
