import assert from "node:assert/strict";
import test from "node:test";
import fetch from "node-fetch";
import { buildExplorerUrl, convertSwapToEvent, forEachSwapPage, networkNameToSlug } from "../adapters/layerswap";

const EXPLORER = "https://api.layerswap.io/api/v2/explorer";

type SwapOptions = {
  id?: string;
  closeDate?: string;
  sourceNetwork?: string;
  destinationNetwork?: string;
  inputUsd?: number | null;
  outputUsd?: number | null;
  inputAmount?: number;
  inputTimestamp?: string;
  outputTimestamp?: string;
};

const makeSwap = (options: SwapOptions = {}) => ({
  swap: {
    id: options.id ?? "swap-1",
    created_date: "2026-07-24T12:00:00.000000+00:00",
    close_date: options.closeDate ?? "2026-07-24T12:00:30.000000+00:00",
    source_network: { name: options.sourceNetwork ?? "BASE_MAINNET" },
    source_token: { contract: "0xsource", price_in_usd: 2000 },
    destination_network: { name: options.destinationNetwork ?? "ARBITRUM_MAINNET" },
    destination_token: { contract: null, price_in_usd: 2000 },
    metadata: { sequence_number: 1 },
    transactions: [
      {
        type: "input",
        transaction_hash: "0xdeposit",
        timestamp: options.inputTimestamp ?? "2026-07-24T12:00:05+00:00",
        amount: options.inputAmount ?? 1,
        amount_in_usd: options.inputUsd === undefined ? 100 : options.inputUsd,
        from: "0xuser",
        to: "0xsolver",
      },
      {
        type: "output",
        transaction_hash: "0xwithdraw",
        timestamp: options.outputTimestamp ?? "2026-07-24T12:00:25+00:00",
        amount: 1,
        amount_in_usd: options.outputUsd === undefined ? 99 : options.outputUsd,
        from: "0xsolver",
        to: "0xuser",
      },
    ],
  },
});

// Returns a node-fetch stand-in that serves the given pages in order and records requested URLs.
const makeFetchImpl = (pages: any[][], requested: string[] = []) => {
  let call = 0;
  const impl = async (url: any) => {
    requested.push(String(url));
    const page = pages[call] ?? [];
    call += 1;
    return { ok: true, json: async () => ({ data: page }) };
  };
  return { fetchImpl: impl as unknown as typeof fetch, requested };
};

test("builds the explorer URL with the completed-swap keyset params", () => {
  const first = new URL(buildExplorerUrl(undefined, EXPLORER));
  assert.equal(first.searchParams.get("statuses"), "1");
  assert.equal(first.searchParams.get("compact"), "true");
  assert.equal(first.searchParams.get("limit"), "200");
  assert.equal(first.searchParams.get("starting_after"), null);

  const next = new URL(buildExplorerUrl("swap-42", EXPLORER));
  assert.equal(next.searchParams.get("starting_after"), "swap-42");
});

test("Layerswap maps network names to normalizeChain-style chain keys, not provider slugs", () => {
  assert.equal(networkNameToSlug.AVAX_MAINNET, "avalanche");
  assert.equal(networkNameToSlug.GNOSIS_MAINNET, "gnosis");
  assert.equal(networkNameToSlug.ZKSYNCERA_MAINNET, "zksync era");
  assert.equal(networkNameToSlug.WORLDCHAIN_MAINNET, "wc");
  assert.equal(networkNameToSlug.RONIN_MAINNET, "ronin");
});

test("uses transaction-level amount_in_usd", () => {
  const event = convertSwapToEvent(makeSwap({ inputUsd: 100, outputUsd: 99 }) as any);
  assert.equal(event.deposit?.amount.toString(), "100");
  assert.equal(event.withdraw?.amount.toString(), "99");
});

test("drops legs without transaction-level amount_in_usd", () => {
  const event = convertSwapToEvent(makeSwap({ inputUsd: null, outputUsd: null, inputAmount: 2 }) as any);
  assert.equal(event.deposit, undefined);
  assert.equal(event.withdraw, undefined);
});

test("drops legs worth less than half a dollar", () => {
  // Whole-dollar USD rows: anything under $0.50 rounds to zero, and aggregation discards zero rows,
  // so the leg is not written at all. Deliberate and conservative - see roundUsd.
  const event = convertSwapToEvent(makeSwap({ inputUsd: 0.49, outputUsd: 0.51 }) as any);
  assert.equal(event.deposit, undefined);
  assert.equal(event.withdraw?.amount.toString(), "1");
});

test("leaves the chain undefined for an unmapped network so the run can report degraded", () => {
  const event = convertSwapToEvent(makeSwap({ sourceNetwork: "NOT_A_REAL_MAINNET" }) as any);
  assert.equal(event.depositChain, undefined);
  assert.equal(event.deposit, undefined);
  assert.equal(event.withdrawChain, "arbitrum");
  assert.ok(event.withdraw);
});

test("stamps each leg with its own transaction timestamp", () => {
  const event = convertSwapToEvent(
    makeSwap({
      inputTimestamp: "2026-07-24T12:00:05+00:00",
      outputTimestamp: "2026-07-24T12:00:25+00:00",
    }) as any
  );
  assert.equal(event.deposit?.timestamp, Date.parse("2026-07-24T12:00:05Z"));
  assert.equal(event.withdraw?.timestamp, Date.parse("2026-07-24T12:00:25Z"));
});

test("pages by close_date with starting_after and hands pages back oldest first", async () => {
  const cutoff = Date.parse("2026-07-24T12:00:00Z");
  const newest = [
    makeSwap({ id: "a", closeDate: "2026-07-24T14:00:00.000000+00:00" }),
    makeSwap({ id: "b", closeDate: "2026-07-24T13:00:00.000000+00:00" }),
  ];
  const oldest = [
    makeSwap({ id: "c", closeDate: "2026-07-24T12:30:00.000000+00:00" }),
    makeSwap({ id: "d", closeDate: "2026-07-24T11:30:00.000000+00:00" }),
  ];
  const { fetchImpl, requested } = makeFetchImpl([newest, oldest]);

  const seen: string[][] = [];
  const result = await forEachSwapPage(
    cutoff,
    async (swaps) => {
      seen.push(swaps.map((s: any) => s.swap.id));
    },
    undefined,
    fetchImpl
  );

  assert.deepEqual(result, { pages: 2, swaps: 4, stopReason: "close-date-cutoff" });
  // Cursor is the last swap id of the previous page.
  assert.equal(new URL(requested[0]).searchParams.get("starting_after"), null);
  assert.equal(new URL(requested[1]).searchParams.get("starting_after"), "b");
  // Oldest page committed first, so an interrupted run leaves the checkpoint behind the remaining work.
  assert.deepEqual(seen, [
    ["c", "d"],
    ["a", "b"],
  ]);
});

test("stops without writing when the feed runs dry", async () => {
  const { fetchImpl } = makeFetchImpl([[]]);
  const seen: unknown[] = [];
  const result = await forEachSwapPage(
    0,
    async (swaps) => {
      seen.push(swaps);
    },
    undefined,
    fetchImpl
  );
  assert.deepEqual(result, { pages: 0, swaps: 0, stopReason: "empty" });
  assert.equal(seen.length, 0);
});

test("rejects a page with an unparseable close_date before committing anything", async () => {
  const bad = [makeSwap({ id: "a", closeDate: "not-a-date" })];
  const { fetchImpl } = makeFetchImpl([bad]);
  const seen: unknown[] = [];
  await assert.rejects(
    () =>
      forEachSwapPage(
        0,
        async (swaps) => {
          seen.push(swaps);
        },
        undefined,
        fetchImpl
      ),
    /invalid close_date/
  );
  assert.equal(seen.length, 0);
});

test("rejects a page whose cursor does not advance", async () => {
  const page = [makeSwap({ id: "a", closeDate: "2026-07-24T14:00:00.000000+00:00" })];
  // Same page served twice: the second response would reuse cursor "a" forever.
  const { fetchImpl } = makeFetchImpl([page, page]);
  await assert.rejects(() => forEachSwapPage(0, async () => {}, undefined, fetchImpl), /did not advance/);
});

test("propagates an abort instead of retrying it", async () => {
  const controller = new AbortController();
  controller.abort();
  const { fetchImpl } = makeFetchImpl([[makeSwap()]]);
  await assert.rejects(
    () => forEachSwapPage(0, async () => {}, controller.signal, fetchImpl),
    (error: Error) => error.name === "AbortError"
  );
});
