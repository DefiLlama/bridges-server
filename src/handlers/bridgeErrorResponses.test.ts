import assert from "node:assert/strict";
import test from "node:test";
import getBridge from "./getBridge";
import getBridgeStatsOnDay from "./getBridgeStatsOnDay";
import getBridgeVolume from "./getBridgeVolume";

const unknownBridgeId = "999999";

const cases = [
  {
    name: "bridge summary",
    handler: getBridge,
    event: {
      pathParameters: { id: unknownBridgeId },
      queryStringParameters: {},
    },
  },
  {
    name: "bridge volume",
    handler: getBridgeVolume,
    event: {
      pathParameters: { chain: "ethereum" },
      queryStringParameters: { id: unknownBridgeId },
    },
  },
  {
    name: "bridge day stats",
    handler: getBridgeStatsOnDay,
    event: {
      pathParameters: { timestamp: "1760000000", chain: "ethereum" },
      queryStringParameters: { id: unknownBridgeId },
    },
  },
];

for (const { name, handler, event } of cases) {
  test(`${name} returns validation errors without wrapping or caching them`, async () => {
    const response = await (handler as any)(event);

    assert.equal(response.statusCode, 400);
    assert.equal(response.headers["Cache-Control"], undefined);
    assert.equal(typeof JSON.parse(response.body).message, "string");
  });
}

const malformedCases = [
  {
    name: "bridge summary",
    handler: getBridge,
    event: {
      pathParameters: { id: "999999junk" },
      queryStringParameters: {},
    },
  },
  {
    name: "bridge volume",
    handler: getBridgeVolume,
    event: {
      pathParameters: { chain: "ethereum" },
      queryStringParameters: { id: "999999junk" },
    },
  },
  {
    name: "bridge day stats",
    handler: getBridgeStatsOnDay,
    event: {
      pathParameters: { timestamp: "1760000000", chain: "ethereum" },
      queryStringParameters: { id: "999999junk" },
    },
  },
];

for (const { name, handler, event } of malformedCases) {
  test(`${name} rejects partially numeric bridge ids`, async () => {
    const response = await (handler as any)(event);

    assert.equal(response.statusCode, 400);
    assert.deepEqual(JSON.parse(response.body), { message: "Invalid bridge ID entered." });
    assert.equal(response.headers["Cache-Control"], undefined);
  });
}
