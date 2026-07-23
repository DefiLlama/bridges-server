import assert from "node:assert/strict";
import test from "node:test";
import { makeRequestsUrl, parseRelayRequestsResponse } from "../adapters/relay";

test("Relay windows are filtered and sorted by updatedAt", () => {
  const url = new URL(makeRequestsUrl(100, 200, "next", 1));
  assert.equal(url.searchParams.get("startTimestamp"), "100");
  assert.equal(url.searchParams.get("endTimestamp"), "200");
  assert.equal(url.searchParams.get("sortBy"), "updatedAt");
  assert.equal(url.searchParams.get("sortDirection"), "asc");
  assert.equal(url.searchParams.get("continuation"), "next");
  assert.equal(url.searchParams.get("chainId"), "1");
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
