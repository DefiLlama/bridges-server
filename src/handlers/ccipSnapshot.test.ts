import assert from "node:assert/strict";
import test from "node:test";
import { ccipDateRange, ccipDayStart, parseCCIPSnapshot } from "../adapters/ccip";
import { ccipUSDTotals, diffCCIPSnapshot, groupCCIPEvents } from "./ccipSnapshot";

const date = "2026-08-25";
const transaction = {
  messageID: "message-1",
  sourceChain: "ethereum",
  destChain: "tempo",
  sourceTxHash: "source-hash",
  destTxHash: "dest-hash",
  tokenTransferFrom: "sender",
  tokenTransferTo: "recipient",
  tokenAddressSource: "source-token",
  tokenAddressDest: "dest-token",
  tokenAmountUsd: 9899465.493095761,
  tokenAmount: 8722.444359751078,
  tokenDecimalsSource: 18,
  tokenDecimalsDest: 6,
  blockTimestamp: ccipDayStart(date) / 1000 + 3397,
};
const parse = (changes = {}) => parseCCIPSnapshot({ transactions: [{ ...transaction, ...changes }] }, date);

test("CCIP keeps the provider USD valuation on both sides without rounding or decimal inference", () => {
  const events = parse();
  assert.equal(events[0].amount, "9899465.493095761");
  assert.equal(events[1].amount, events[0].amount);
  assert.deepEqual(
    events.map((e) => e.is_deposit),
    [false, true]
  );
  for (const tokenAmount of [8722.444359751078, 350000000000]) {
    assert.ok(parse({ tokenAmountUsd: 0, tokenAmount }).every((e) => e.amount === "0" && e.is_usd_volume));
  }
});

test("CCIP recognizes added networks and the Etherlink API alias", () => {
  for (const chain of ["adi", "tempo", "neox", "megaeth", "etlk"]) {
    assert.equal(parse({ destChain: chain })[1].chain, chain === "etlk" ? "etherlink" : chain);
  }
});

test("CCIP op_bnb and opbnb snapshots reconcile to the same source and destination rows", () => {
  const existing = groupCCIPEvents(parse({ sourceChain: "opbnb", destChain: "opbnb" })).map((event, index) => ({
    ...event,
    id: String(index),
    ts: new Date(event.ts),
  }));
  const expected = groupCCIPEvents(parse({ sourceChain: "op_bnb", destChain: "op_bnb" }));
  assert.deepEqual(diffCCIPSnapshot(expected, existing), { added: [], updated: [], deleted: [], unchanged: 2 });
});

test("CCIP rejects incomplete responses before reconciliation", () => {
  for (const response of [
    null,
    {},
    { transactions: null },
    { transactions: [], nextCursor: "next" },
    { transactions: [], partial: true },
    { transactions: [null] },
  ]) {
    assert.throws(() => parseCCIPSnapshot(response, date));
  }
  for (const change of [
    { destChain: "unlisted" },
    { destTxHash: "" },
    { tokenAmountUsd: -1 },
    { tokenAmountUsd: NaN },
    { tokenAmountUsd: null },
    { blockTimestamp: ccipDayStart(date) / 1000 - 1 },
  ]) {
    assert.throws(() => parse(change));
  }
  assert.throws(() => ccipDayStart("2026-02-30"));
  assert.throws(() => ccipDateRange("2026-08-25", "2026-08-24"));
});

test("recipient corrections remove the old rows and a repeat snapshot is unchanged", () => {
  const previous = parse().map((event, index) => ({ ...event, id: String(index), ts: new Date(event.ts) }));
  const expected = groupCCIPEvents(parse({ tokenTransferTo: "corrected" }));
  const diff = diffCCIPSnapshot(expected, previous);
  assert.equal(diff.deleted.length, 2);
  assert.equal(diff.added.length, 2);
  const persisted = expected.map((event, index) => ({ ...event, id: String(index), ts: new Date(event.ts) }));
  assert.deepEqual(diffCCIPSnapshot(expected, persisted), { added: [], updated: [], deleted: [], unchanged: 2 });
  assert.throws(() => diffCCIPSnapshot([], previous), /empty API snapshot/);
});

test("destination batches have deterministic totals and hours when input order changes", () => {
  const events = [
    ...parse({ tokenAmountUsd: 0.1 }),
    ...parse({ tokenAmountUsd: 0.2, blockTimestamp: transaction.blockTimestamp + 3600 }),
  ];
  const grouped = groupCCIPEvents(events);
  assert.deepEqual(
    groupCCIPEvents([...events].reverse()).sort((a, b) => a.chain.localeCompare(b.chain)),
    [...grouped].sort((a, b) => a.chain.localeCompare(b.chain))
  );
  assert.equal(grouped[0].amount, "0.3");
  assert.equal(grouped[0].ts, transaction.blockTimestamp * 1000);
  assert.deepEqual(ccipUSDTotals(grouped), { depositUSD: "0.30", withdrawUSD: "0.30" });
});
