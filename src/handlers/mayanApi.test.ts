import assert from "node:assert/strict";
import test from "node:test";
import fetch from "node-fetch";
import {
  buildSwapsUrl,
  servicesForChain,
  servicesToSplit,
  forEachPage,
  createRowAccumulator,
  normalizeSwap,
  partitionLabel,
  resolveIngestWindow,
  sourceChainNames,
  MayanSwap,
  TransactionRow,
} from "../adapters/mayan";

const EXPLORER_URL = "https://explorer-api.mayan.finance/v3/swaps";
const HOUR_MS = 60 * 60 * 1000;

const makeSwap = (overrides: Partial<MayanSwap> = {}): MayanSwap => ({
  orderId: "SWIFT_V2_0xorder",
  service: "SWIFT_V2",
  status: "ORDER_SETTLED",
  initiatedAt: "2026-08-20T12:00:00.000Z",
  trader: "0xtrader",
  destAddress: "SoLdEsTiNaTiOn",
  sourceTxHash: "0xsource",
  fulfillTxHash: "fulfillhash",
  sourceChain: "30",
  destChain: "1",
  fromAmount: "0.5",
  fromTokenAddress: "0x0000000000000000000000000000000000000000",
  fromTokenPrice: 4000,
  toAmount: "20",
  toTokenAddress: "0x0000000000000000000000000000000000000000",
  toTokenPrice: 100,
  ...overrides,
});

/** node-fetch stand-in serving the given pages in order and recording the URLs requested. */
const makeFetchImpl = (pages: MayanSwap[][], requested: string[] = []) => {
  let call = 0;
  const impl = async (url: any) => {
    requested.push(String(url));
    const page = pages[call] ?? [];
    call += 1;
    return { ok: true, json: async () => ({ data: page }) };
  };
  return impl as unknown as typeof fetch;
};

const makePage = (size: number, initiatedAt: string): MayanSwap[] =>
  Array.from({ length: size }, (_, index) => makeSwap({ sourceTxHash: `0x${initiatedAt}${index}`, initiatedAt }));

const makeRow = (overrides: Partial<TransactionRow> = {}): TransactionRow => ({
  bridge_id: "bridge-1",
  chain: "base",
  tx_hash: "0xshared",
  ts: 1_000,
  tx_block: null,
  tx_from: "0xtrader",
  tx_to: "0x",
  token: "0xtoken",
  amount: "100.00",
  is_deposit: true,
  is_usd_volume: true,
  txs_counted_as: 1,
  origin_chain: null,
  ...overrides,
});

test("a settled swap yields a deposit leg on the source chain and a withdrawal leg on the destination", () => {
  const { legs, skipped, pricedFromSource, priceConflict } = normalizeSwap(makeSwap());
  const [deposit, withdrawal] = legs;

  assert.equal(skipped, undefined);
  assert.equal(pricedFromSource, false);
  assert.equal(priceConflict, false);

  assert.deepEqual(deposit, {
    chain: "base",
    originChain: null,
    txHash: "0xsource",
    timestamp: Date.parse("2026-08-20T12:00:00.000Z"),
    from: "0xtrader",
    to: "0x",
    token: "0x0000000000000000000000000000000000000000",
    amountUsd: "2000.00",
    isDeposit: true,
  });
  assert.deepEqual(withdrawal, {
    chain: "solana",
    originChain: "base",
    txHash: "fulfillhash",
    timestamp: Date.parse("2026-08-20T12:00:00.000Z"),
    from: "0x",
    to: "SoLdEsTiNaTiOn",
    token: "0x0000000000000000000000000000000000000000",
    amountUsd: "2000.00",
    isDeposit: false,
  });
});

test("an overstated source price cannot inflate volume", () => {
  // Long-tail inputs carry the price of the stable leg Mayan routed through: 496bn units at ~$1.
  const { legs, priceConflict } = normalizeSwap(
    makeSwap({ fromAmount: "496499999999.99", fromTokenPrice: 0.99927984, toAmount: "39.1", toTokenPrice: 0.99927984 })
  );

  assert.equal(priceConflict, true);
  assert.deepEqual(
    legs.map((leg) => leg.amountUsd),
    ["39.07", "39.07"]
  );
});

test("an overstated destination price cannot inflate volume", () => {
  const { legs, priceConflict } = normalizeSwap(
    makeSwap({ fromAmount: "0.002078", fromTokenPrice: 2308.24, toAmount: "1e35", toTokenPrice: 1.141 })
  );

  assert.equal(priceConflict, true);
  assert.equal(legs[0].amountUsd, "4.80");
});

test("corroborated prices are kept whatever their size", () => {
  const { legs, priceConflict } = normalizeSwap(
    makeSwap({ fromAmount: "20000000", fromTokenPrice: 1, toAmount: "19990000", toTokenPrice: 1 })
  );

  assert.equal(priceConflict, false);
  assert.equal(legs[0].amountUsd, "19990000.00");
});

test("the source side prices a swap only when the destination side cannot", () => {
  const { legs, pricedFromSource } = normalizeSwap(makeSwap({ toTokenPrice: null }));

  assert.equal(pricedFromSource, true);
  assert.equal(legs[0].amountUsd, "2000.00");
});

test("a source-only price may not assert an implausible value", () => {
  const capped = normalizeSwap(makeSwap({ toTokenPrice: null, fromAmount: "2000000", fromTokenPrice: 1 }));
  assert.equal(capped.skipped, "uncorroborated");
  assert.deepEqual(capped.legs, []);

  // Under the ceiling the swap still counts: source-only pricing is normal for HyperCore legs.
  const kept = normalizeSwap(makeSwap({ toTokenPrice: null, fromAmount: "100000", fromTokenPrice: 1 }));
  assert.equal(kept.skipped, undefined);
  assert.equal(kept.legs[0].amountUsd, "100000.00");
});

test("a destination-only price is not capped, since large swaps are legitimate", () => {
  const { skipped, legs } = normalizeSwap(makeSwap({ fromTokenPrice: null, toAmount: "2000000", toTokenPrice: 1 }));

  assert.equal(skipped, undefined);
  assert.equal(legs[0].amountUsd, "2000000.00");
});

test("a swap with no usable price on either side is skipped", () => {
  const { legs, skipped } = normalizeSwap(makeSwap({ fromTokenPrice: null, toTokenPrice: 0 }));

  assert.equal(skipped, "unpriced");
  assert.deepEqual(legs, []);
});

test("swaps that never settled are skipped", () => {
  for (const status of ["ORDER_REFUNDED", "ORDER_CREATED", "ORDER_EXPIRED", "REFUNDED_ON_EVM_MCTP"]) {
    const { legs, skipped } = normalizeSwap(makeSwap({ status }));

    assert.equal(skipped, "unsettled", status);
    assert.deepEqual(legs, [], status);
  }
});

test("a Wormhole bridge redeem still in flight is not settled, but the same status settles elsewhere", () => {
  assert.equal(normalizeSwap(makeSwap({ status: "REDEEM_VAA_SIGNED", service: "WH_BRIDGE" })).skipped, "unsettled");
  assert.equal(normalizeSwap(makeSwap({ status: "REDEEM_VAA_SIGNED", service: "MCTP_SWAP" })).skipped, undefined);
});

test("a Swift order awaiting its HyperCore deposit is not settled until the deposit lands", () => {
  const pending = makeSwap({ status: "ORDER_SETTLED", service: "SWIFT_V2", meta: { hypercoreData: {} } });
  assert.equal(normalizeSwap(pending).skipped, "unsettled");

  const landed = makeSwap({
    status: "ORDER_SETTLED",
    service: "SWIFT_V2",
    meta: { hypercoreData: { redeemTxHash: "0xdeposit" } },
  });
  assert.equal(normalizeSwap(landed).skipped, undefined);
});

test("same-chain swaps are out of scope for a cross-chain series", () => {
  const { legs, skipped } = normalizeSwap(makeSwap({ sourceChain: "2", destChain: "2" }));

  assert.equal(skipped, "same_chain");
  assert.deepEqual(legs, []);
});

test("HyperEVM and HyperCore are one chain, so value moving between them is not bridged", () => {
  const { legs, skipped } = normalizeSwap(makeSwap({ sourceChain: "47", destChain: "65000" }));

  assert.equal(skipped, "same_chain");
  assert.deepEqual(legs, []);
});

test("legs worth less than a cent are skipped rather than stored as zero", () => {
  const { legs, skipped } = normalizeSwap(makeSwap({ toAmount: "0.000001", toTokenPrice: 1, fromTokenPrice: null }));

  assert.equal(skipped, "unpriced");
  assert.deepEqual(legs, []);
});

test("only canonical EVM addresses are case-folded", () => {
  const evm = normalizeSwap(
    makeSwap({ fromTokenAddress: "0xAbCdEf0123456789000000000000000000000001", toTokenAddress: "SoLtOkEnAddr" })
  );
  assert.equal(evm.legs[0].token, "0xabcdef0123456789000000000000000000000001");
  assert.equal(evm.legs[1].token, "SoLtOkEnAddr");

  // Sui coin types are 0x-prefixed but their module and struct names are case-sensitive.
  const sui = normalizeSwap(
    makeSwap({
      fromTokenAddress: "0x2::sui::SUI",
      toTokenAddress: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
    })
  );
  assert.equal(sui.legs[0].token, "0x2::sui::SUI");
  assert.equal(sui.legs[1].token, "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC");
});

test("HyperEVM and HyperCore both report as the Hyperliquid chain", () => {
  const { legs } = normalizeSwap(makeSwap({ sourceChain: "47", destChain: "2" }));

  assert.equal(legs[0].chain, "hyperliquid");
  assert.ok(sourceChainNames.includes("hyperevm"));
  assert.ok(sourceChainNames.includes("hypercore"));
});

test("an unmapped chain id is reported and its counterpart leg still counts", () => {
  const { legs, unmappedChainIds } = normalizeSwap(makeSwap({ destChain: "9999" }));

  assert.deepEqual(unmappedChainIds, ["9999"]);
  assert.deepEqual(
    legs.map((leg) => leg.isDeposit),
    [true]
  );
});

test("a leg without a transaction hash is omitted", () => {
  const { legs } = normalizeSwap(makeSwap({ sourceTxHash: null }));

  assert.deepEqual(
    legs.map((leg) => leg.isDeposit),
    [false]
  );
});

test("a chain is only split by services it actually runs", () => {
  // The API answers an empty (chain, service) filter with a full table traversal, so combinations
  // that have never existed must not be queried. BSC settles no MCTP at all.
  assert.deepEqual(
    servicesForChain("bsc").filter((service) => service.startsWith("MCTP")),
    []
  );
  assert.deepEqual(servicesForChain("hypercore"), ["HC_WITHDRAW"]);
  assert.deepEqual(servicesForChain("aptos"), []);
  assert.deepEqual(servicesForChain("nonexistent"), []);
  assert.ok(servicesForChain("solana").includes("SWIFT_V2"));
});

test("a split covers services the walk observed beyond the static table", () => {
  assert.deepEqual(servicesToSplit("bsc", ["WH_BRIDGE", "SWIFT_V2"]).sort(), ["SWIFT_V2", "WH_BRIDGE"]);
  assert.ok(servicesToSplit("solana").includes("SWIFT_V2"));
  assert.ok(!servicesToSplit("base", ["MONO_CHAIN"]).includes("MONO_CHAIN"));
  assert.deepEqual(servicesToSplit("aptos", ["WH_BRIDGE"]), ["WH_BRIDGE"]);
});

test("buildSwapsUrl partitions by source chain within the API page limit", () => {
  const url = new URL(buildSwapsUrl({ fromChain: "solana" }, 200, EXPLORER_URL));

  // Raw rows only: the presentation shape mis-prices forwarded source legs.
  assert.equal(url.searchParams.get("format"), "raw");
  assert.equal(url.searchParams.get("fromChain"), "solana");
  assert.equal(url.searchParams.get("offset"), "200");
  assert.equal(url.searchParams.get("service"), null);
  assert.ok(Number(url.searchParams.get("limit")) <= 100);
});

test("buildSwapsUrl narrows a partition to one service", () => {
  const partition = { fromChain: "ethereum", service: "SWIFT_V2" };
  const url = new URL(buildSwapsUrl(partition, 0, EXPLORER_URL));

  assert.equal(url.searchParams.get("service"), "SWIFT_V2");
  assert.equal(partitionLabel(partition), "ethereum/SWIFT_V2");
  assert.equal(partitionLabel({ fromChain: "ethereum" }), "ethereum");
});

test("paging stops on the page that reaches back past the window start", async () => {
  const requested: string[] = [];
  const fetchImpl = makeFetchImpl(
    [
      makePage(100, "2026-08-20T12:00:00.000Z"),
      makePage(100, "2026-08-19T23:00:00.000Z"),
      makePage(100, "2026-08-18T00:00:00.000Z"),
    ],
    requested
  );
  const seen: MayanSwap[] = [];

  const result = await forEachPage(
    { fromChain: "base" },
    Date.parse("2026-08-20T00:00:00.000Z"),
    async (swaps: MayanSwap[]) => {
      seen.push(...swaps);
    },
    undefined,
    fetchImpl
  );

  assert.equal(result.pages, 2);
  assert.equal(result.swaps, 200);
  assert.equal(result.truncated, false);
  assert.equal(seen.length, 200);
  assert.deepEqual(
    requested.map((url) => new URL(url).searchParams.get("offset")),
    ["0", "100"]
  );
});

test("paging stops on a partial page", async () => {
  const result = await forEachPage(
    { fromChain: "linea" },
    Date.parse("2026-08-01T00:00:00.000Z"),
    async () => {},
    undefined,
    makeFetchImpl([makePage(10, "2026-08-20T12:00:00.000Z")])
  );

  assert.equal(result.pages, 1);
  assert.equal(result.truncated, false);
});

test("a partition that outlives the run's budget stops and reports it", async () => {
  const pages = Array.from({ length: 10 }, () => makePage(100, "2026-08-20T12:00:00.000Z"));
  let calls = 0;

  const result = await forEachPage(
    { fromChain: "solana" },
    Date.parse("2026-08-01T00:00:00.000Z"),
    async () => {},
    undefined,
    makeFetchImpl(pages),
    () => ++calls > 3
  );

  assert.equal(result.expired, true);
  assert.equal(result.truncated, false);
  assert.equal(result.pages, 3);
});

test("exhausting the offset cap is reported as truncation rather than full coverage", async () => {
  const pages = Array.from({ length: 64 }, () => makePage(100, "2026-08-20T12:00:00.000Z"));

  const result = await forEachPage(
    { fromChain: "solana" },
    Date.parse("2026-08-01T00:00:00.000Z"),
    async () => {},
    undefined,
    makeFetchImpl(pages)
  );

  assert.equal(result.truncated, true);
  // Offsets 0 through the 3000 cap, after which the next request would be rejected.
  assert.equal(result.pages, 31);
});

test("distinct swaps sharing a transaction are summed, not dropped", () => {
  const accumulator = createRowAccumulator();
  accumulator.add(makeRow(), "swap-a");
  accumulator.add(makeRow({ amount: "50.25", ts: 2_000 }), "swap-b");
  const [row] = accumulator.drain();

  assert.equal(row.amount, "150.25");
  assert.equal(row.txs_counted_as, 2);
  assert.equal(row.ts, 2_000);
});

test("re-reading one swap in a later pass replaces it rather than doubling it", () => {
  const accumulator = createRowAccumulator();
  accumulator.add(makeRow(), "swap-a");
  accumulator.add(makeRow(), "swap-a");
  const [row] = accumulator.drain();

  assert.equal(row.amount, "100.00");
  assert.equal(row.txs_counted_as, 1);
});

test("rows differing in any key column stay separate", () => {
  const accumulator = createRowAccumulator();
  accumulator.add(makeRow(), "swap-a");
  accumulator.add(makeRow({ chain: "solana" }), "swap-b");
  accumulator.add(makeRow({ tx_hash: "0xother" }), "swap-c");

  assert.equal(accumulator.drain().length, 3);
});

test("legs in opposite directions are never summed together", () => {
  const accumulator = createRowAccumulator();
  accumulator.add(makeRow(), "swap-a");
  accumulator.add(makeRow({ is_deposit: false }), "swap-b");
  const drained = accumulator.drain();

  assert.equal(drained.length, 2);
  assert.deepEqual(
    drained.map((row) => row.amount),
    ["100.00", "100.00"]
  );
});

test("draining empties the accumulator", () => {
  const accumulator = createRowAccumulator();
  accumulator.add(makeRow(), "swap-a");

  assert.equal(accumulator.drain().length, 1);
  assert.equal(accumulator.drain().length, 0);
});

test("the ingest window resumes an overlap behind the checkpoint", () => {
  const now = Date.parse("2026-08-20T12:00:00.000Z");
  const checkpoint = now - 3 * HOUR_MS;

  // The overlap has to exceed how long a swap can take to settle, since the feed orders by initiation.
  assert.deepEqual(resolveIngestWindow(checkpoint, now), {
    fromMs: checkpoint - 2 * HOUR_MS,
    unreachableGap: false,
  });
});

test("a first run takes the whole reachable window and reports no gap", () => {
  const now = Date.parse("2026-08-20T12:00:00.000Z");

  assert.deepEqual(resolveIngestWindow(null, now), { fromMs: now - 12 * HOUR_MS, unreachableGap: false });
});

test("a checkpoint ahead of the clock cannot push the window into the future", () => {
  const now = Date.parse("2026-08-20T12:00:00.000Z");

  assert.deepEqual(resolveIngestWindow(now + 5 * HOUR_MS, now), {
    fromMs: now - 2 * HOUR_MS,
    unreachableGap: false,
  });
});

test("a checkpoint beyond reachable depth is clamped and flagged", () => {
  const now = Date.parse("2026-08-20T12:00:00.000Z");

  assert.deepEqual(resolveIngestWindow(now - 30 * 24 * HOUR_MS, now), {
    fromMs: now - 12 * HOUR_MS,
    unreachableGap: true,
  });
});
