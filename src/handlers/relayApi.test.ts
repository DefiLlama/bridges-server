import assert from "node:assert/strict";
import test from "node:test";
import {
  chainIdToSlug,
  makeRequestsUrl,
  parseRelayChainsResponse,
  parseRelayRequestsResponse,
  serializeRelayChainCatalog,
  slugToChainId,
} from "../adapters/relay";

test("Relay windows are filtered and sorted by updatedAt", () => {
  const url = new URL(makeRequestsUrl(100, 200, "next", 1));
  assert.equal(url.searchParams.get("startTimestamp"), "100");
  assert.equal(url.searchParams.get("endTimestamp"), "200");
  assert.equal(url.searchParams.get("sortBy"), "updatedAt");
  assert.equal(url.searchParams.get("sortDirection"), "asc");
  assert.equal(url.searchParams.get("continuation"), "next");
  assert.equal(url.searchParams.get("chainId"), "1");
});

test("Relay maps currently supported non-EVM and emerging chain IDs", () => {
  assert.equal(slugToChainId.hyperliquid, 1337);
  assert.equal(slugToChainId.ronin, 2020);
  assert.equal(slugToChainId.somnia, 5031);
});

test("Relay parses and normalizes the dynamic chain catalog", () => {
  const catalog = parseRelayChainsResponse({
    chains: [
      { id: 1, name: "ethereum" },
      { id: 2741, name: "Abstract" },
    ],
  });

  assert.deepEqual(catalog, { 1: "ethereum", 2741: "abstract" });
  assert.deepEqual(parseRelayChainsResponse(serializeRelayChainCatalog(catalog)), catalog);
  assert.deepEqual({ ...chainIdToSlug, ...catalog }[2741], "abstract");
});

test("Relay rejects malformed chain catalogs before replacing the last-known-good cache", () => {
  assert.throws(() => parseRelayChainsResponse({}), /chains array/);
  assert.throws(() => parseRelayChainsResponse({ chains: [] }), /empty chain catalog/);
  assert.throws(() => parseRelayChainsResponse({ chains: [{ id: 0, name: "bad" }] }), /invalid id/);
  assert.throws(() => parseRelayChainsResponse({ chains: [{ id: 1, name: "" }] }), /without a name/);
  assert.throws(
    () =>
      parseRelayChainsResponse({
        chains: [
          { id: 1, name: "ethereum" },
          { id: 1, name: "duplicate" },
        ],
      }),
    /duplicate chain ID/
  );
});

test("Relay rejects malformed successful responses before checkpoint advancement", () => {
  assert.throws(() => parseRelayRequestsResponse({}), /requests array/);
  assert.throws(() => parseRelayRequestsResponse({ requests: [], continuation: 123 }), /continuation/);
  assert.throws(() => parseRelayRequestsResponse({ requests: [{}] }), /without an id/);
  assert.throws(() => parseRelayRequestsResponse({ requests: ["bad"] }), /invalid request/);
  assert.throws(
    () => parseRelayRequestsResponse({ requests: [{ id: "request-1", updatedAt: "not-a-date" }] }),
    /invalid updatedAt/
  );
  assert.throws(
    () => parseRelayRequestsResponse({ requests: [{ id: "request-1", updatedAt: "2026-07-23T00:00:00Z", data: [] }] }),
    /invalid data/
  );
  assert.deepEqual(
    parseRelayRequestsResponse({
      requests: [{ id: "request-1", updatedAt: "2026-07-23T00:00:00Z", data: {} }],
    }),
    {
      requests: [{ id: "request-1", updatedAt: "2026-07-23T00:00:00Z", data: {} }],
    }
  );
  assert.deepEqual(parseRelayRequestsResponse({ requests: [], continuation: "next" }), {
    requests: [],
    continuation: "next",
  });
});
