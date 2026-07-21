import assert from "node:assert/strict";
import test from "node:test";
import { responseAllowsCaching } from "./cachePolicy";

test("does not cache degraded no-store responses", () => {
  assert.equal(responseAllowsCaching({ "Cache-Control": "no-store" }), false);
  assert.equal(responseAllowsCaching({ "cache-control": "public, no-store, max-age=0" }), false);
});

test("allows normal cache-control responses", () => {
  assert.equal(responseAllowsCaching({ "Cache-Control": "max-age=600" }), true);
  assert.equal(responseAllowsCaching({}), true);
});
