import assert from "node:assert/strict";
import test from "node:test";
import { getTransactions } from "./getTransactions";
import { decodeTransactionCursor } from "../utils/transactionCursor";

const rows = [
  {
    transaction_id: "5",
    cursor_ts: "2026-10-01T00:00:05.000000Z",
    tx_hash: "unrelated-1",
    tx_from: "0xother",
    tx_to: "0xother",
    is_deposit: false,
    chain: "arbitrum",
    destination_chain: "arbitrum",
  },
  {
    transaction_id: "4",
    cursor_ts: "2026-10-01T00:00:04.000000Z",
    tx_hash: "unrelated-2",
    tx_from: "0xother",
    tx_to: "0xother",
    is_deposit: true,
    chain: "arbitrum",
    destination_chain: "ethereum",
  },
  {
    transaction_id: "3",
    cursor_ts: "2026-10-01T00:00:03.000000Z",
    tx_hash: "matching-1",
    tx_from: "0xwallet",
    tx_to: "0xrecipient",
    is_deposit: true,
    chain: "ethereum",
    destination_chain: "arbitrum",
  },
  {
    transaction_id: "2",
    cursor_ts: "2026-10-01T00:00:02.000000Z",
    tx_hash: "matching-2",
    tx_from: "0xsender",
    tx_to: "0xwallet",
    is_deposit: false,
    chain: "ethereum",
    destination_chain: "ethereum",
  },
  {
    transaction_id: "1",
    cursor_ts: "2026-10-01T00:00:01.000000Z",
    tx_hash: "matching-3",
    tx_from: "0xwallet",
    tx_to: "0xrecipient",
    is_deposit: true,
    chain: "ethereum",
    destination_chain: "arbitrum",
  },
];

test("applies source chain and address filters before paginating transactions", async () => {
  const queryTransactions = async (...args: any[]) => {
    const limit = args[4];
    const filters = args[6];
    const filtered = rows.filter(
      (row) =>
        (!filters?.sourceChain ||
          (row.is_deposit ? row.chain === filters.sourceChain : row.destination_chain === filters.sourceChain)) &&
        (!filters?.addressHash ||
          (row.chain === filters.addressChain &&
            (row.tx_from === filters.addressHash || row.tx_to === filters.addressHash)))
    );
    return filtered.slice(0, limit);
  };

  const result = await getTransactions(
    "1780272000",
    "1780358400",
    "all",
    undefined,
    "ethereum",
    "ethereum:0xwallet",
    2,
    undefined,
    queryTransactions as any
  );

  assert.deepEqual("statusCode" in result ? result : result.transactions.map((tx) => tx.tx_hash), [
    "matching-1",
    "matching-2",
  ]);
  assert.equal("statusCode" in result ? undefined : result.hasMore, true);
  const nextCursor = "statusCode" in result ? undefined : result.nextCursor;
  assert.deepEqual(nextCursor ? decodeTransactionCursor(nextCursor) : undefined, {
    timestamp: "2026-10-01T00:00:02.000000Z",
    id: "2",
  });
});

test("rejects malformed address filters before querying", async () => {
  for (const address of ["0xwallet", "ethereum:0xwallet:extra", "ethereum: ", " ethereum:0xwallet"]) {
    let queried = false;
    const queryTransactions = async () => {
      queried = true;
      return [];
    };

    const result = await getTransactions(
      undefined,
      undefined,
      "all",
      undefined,
      undefined,
      address,
      undefined,
      undefined,
      queryTransactions as any
    );

    assert.equal("statusCode" in result ? result.statusCode : undefined, 400);
    assert.equal(queried, false);
  }
});

test("keeps chain names unchanged when passing filters to the query", async () => {
  let filters: any;
  const queryTransactions = async (...args: any[]) => {
    filters = args[6];
    return [];
  };

  await getTransactions(
    undefined,
    undefined,
    "all",
    undefined,
    "binance",
    "binance:0xwallet",
    undefined,
    undefined,
    queryTransactions as any
  );

  assert.deepEqual(filters, {
    sourceChain: "binance",
    addressChain: "binance",
    addressHash: "0xwallet",
  });
});
