import assert from "node:assert/strict";
import test from "node:test";
import {
  chainIdToSlug,
  convertRequestToEvent,
  createRequestGate,
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

test("Relay requests target v3 and drop the removed referrer parameter", () => {
  const url = new URL(makeRequestsUrl(100, 200));
  assert.equal(url.pathname, "/requests/v3");
  assert.equal(url.searchParams.get("limit"), "50");
  assert.equal(url.searchParams.has("referrer"), false);
});

const v3Request = (overrides: Record<string, any> = {}) => ({
  id: "request-1",
  updatedAt: "2026-07-26T00:00:00Z",
  recipient: "0xrecipient",
  data: {
    inTxs: [{ txHash: "0xin", block: 1, chainId: 1, timestamp: 1785000000, data: { from: "0xfrom" } }],
    outTxs: [{ txHash: "0xout", block: 2, chainId: 8453, timestamp: 1785000060, data: {} }],
    route: {
      actual: {
        origin: {
          inputCurrency: { currency: { address: "0xtokenin" }, amountUsd: "100.5" },
          outputCurrency: { currency: { address: "0xoriginout" }, amountUsd: "99.4" },
        },
        destination: {
          inputCurrency: { currency: { address: "0xtokenout" }, amountUsd: "99.2" },
          outputCurrency: { currency: { address: "0xswapped" }, amountUsd: "70.1" },
        },
      },
    },
    ...overrides,
  },
});

test("Relay reads both legs from the v3 route instead of the removed data.metadata", () => {
  const event = convertRequestToEvent(v3Request() as any);

  assert.equal(event.depositChainId, 1);
  assert.equal(event.deposit?.txHash, "0xin");
  assert.equal(event.deposit?.token, "0xtokenin");
  assert.equal(event.deposit?.amount.toString(), "101");

  assert.equal(event.withdrawChainId, 8453);
  assert.equal(event.withdraw?.txHash, "0xout");
  assert.equal(event.withdraw?.to, "0xrecipient");
  assert.equal(event.withdraw?.token, "0xtokenout");
  assert.equal(event.withdraw?.amount.toString(), "99");
});

test("Relay falls back to the origin leg for same-chain routes with no destination", () => {
  const request = v3Request();
  delete (request.data.route.actual as any).destination;

  const event = convertRequestToEvent(request as any);
  assert.equal(event.withdraw?.token, "0xoriginout");
  assert.equal(event.withdraw?.amount.toString(), "99");
});

test("Relay falls back to the quoted route when the request has not settled", () => {
  const request: any = v3Request();
  request.data.route = { quoted: request.data.route.actual };

  const event = convertRequestToEvent(request);
  assert.equal(event.deposit?.amount.toString(), "101");
  assert.equal(event.withdraw?.amount.toString(), "99");
});

test("Relay request gate runs lanes concurrently while bounding the start rate", async () => {
  const gate = createRequestGate(4, 60_000);
  let active = 0;
  let peak = 0;

  await Promise.all(
    Array.from({ length: 12 }, () =>
      gate(async () => {
        active += 1;
        peak = Math.max(peak, active);
        await new Promise((resolve) => setTimeout(resolve, 20));
        active -= 1;
      })
    )
  );

  assert.equal(peak, 4);
  assert.equal(active, 0);
});

test("Relay request gate releases its slot when a request throws", async () => {
  const gate = createRequestGate(1, 60_000);
  await assert.rejects(gate(async () => { throw new Error("boom"); }), /boom/);
  assert.equal(await gate(async () => "recovered"), "recovered");
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
