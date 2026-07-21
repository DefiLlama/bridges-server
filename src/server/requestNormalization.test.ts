import assert from "node:assert/strict";
import test from "node:test";
import { normalizeBridgeDayStatsEvent, normalizeBridgesEvent } from "./requestNormalization";

test("normalizes bridge day stats timestamps and chain names before caching", () => {
  const event = normalizeBridgeDayStatsEvent({
    routePath: "/bridgedaystats/:timestamp/:chain",
    pathParameters: { timestamp: "1784516338", chain: "Ethereum" },
    queryStringParameters: {},
  });

  assert.deepEqual(event.pathParameters, { timestamp: "1784505600", chain: "ethereum" });
});

test("maps every timestamp in a UTC day to the same canonical event", () => {
  const first = normalizeBridgeDayStatsEvent({ pathParameters: { timestamp: "1784505601", chain: "Base" } });
  const last = normalizeBridgeDayStatsEvent({ pathParameters: { timestamp: "1784591999", chain: "base" } });

  assert.deepEqual(first.pathParameters, last.pathParameters);
});

test("versions the bridges cache without changing the request", () => {
  const event = normalizeBridgesEvent({
    routePath: "/bridges",
    queryStringParameters: { includeChains: "true" },
    body: {},
  });

  assert.deepEqual(event.queryStringParameters, { includeChains: "true" });
  assert.deepEqual(event.body, { cacheVersion: "bridges-freshness-v1" });
});
