import assert from "node:assert/strict";
import test from "node:test";
import { ccipDateRange, ccipDayStart, parseCCIPSnapshot } from "../adapters/ccip";
import { ccipRowsToMove, ccipUSDTotals, diffCCIPSnapshot, groupCCIPEvents } from "./ccipSnapshot";
import { decodeCCIPTransactionHash } from "../utils/ccipTransactionHash";

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

test("the Sep 3 CCIP new-chain transfer resolves to the existing AB Core row", () => {
  // Verified on AB Core, chain ID 36888, with the same CCIP message ID.
  const transfer = {
    messageID: "0x44077caa2573cb40b61be83520cf74113625ecd0d8c643570804194313a35f9d",
    sourceChain: "ethereum",
    destChain: "new",
    sourceTxHash: "0x117bc92502b9c280a64761c196d2faf967d81ccde32caec96af39eb91a3f00a0",
    destTxHash: "0x9dcb773f7fa3a88ef3245f0b03202d5d5351969580694b0fe62483ab450e64d6",
    blockTimestamp: 1788464963,
    tokenTransferFrom: "0xccb42ad7102cb4521cc01ce71e6dd621703683e2",
    tokenTransferTo: "0xad2552b666ac7f1bc983166c18f695ebccf0efb3",
    tokenAddressSource: "0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d",
    tokenAddressDest: "0x111111d2bf19e43c34263401e0cad979ed1cdb61",
    tokenAmountUsd: 1.1995168512335577,
  };
  const events = groupCCIPEvents(parseCCIPSnapshot({ transactions: [transfer] }, "2026-09-03"));
  assert.deepEqual(
    events.map((event) => event.chain),
    ["ethereum", "ab chain"]
  );
  assert.ok(events.every((event) => event.amount === String(transfer.tokenAmountUsd)));
  const stored = parseCCIPSnapshot({ transactions: [{ ...transfer, destChain: "ab chain" }] }, "2026-09-03").map(
    (event, i) => ({ ...event, id: String(i), ts: new Date(event.ts) })
  );
  assert.deepEqual(diffCCIPSnapshot(events, stored), { added: [], updated: [], deleted: [], unchanged: 2 });
  assert.equal(parse({ sourceChain: "new" })[0].chain, "ab chain");
});

test("CCIP keeps different messages that share a destination transaction across UTC days", () => {
  const oldEvents = parse({ messageID: "old-message", destTxHash: "shared-destination" });
  const expected = parse({ messageID: "new-message", destTxHash: "shared-destination" });
  const legacyOutside = {
    ...oldEvents[1],
    id: "legacy",
    tx_hash: decodeCCIPTransactionHash(oldEvents[1].tx_hash),
    ts: new Date(oldEvents[1].ts),
  };
  assert.deepEqual(ccipRowsToMove(expected, [legacyOutside], oldEvents), []);

  const exactOutside = { ...expected[1], id: "exact", ts: new Date(expected[1].ts) };
  assert.throws(() => ccipRowsToMove(expected, [exactOutside], expected), /present in both UTC days/);
  assert.deepEqual(ccipRowsToMove(expected, [exactOutside], oldEvents), [exactOutside]);
});

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
