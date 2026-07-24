import { strict as assert } from "node:assert";
import test from "node:test";
import { formatDiscordErrorDigest, getDiscordRetryAfterMs } from "./discord";

test("formatDiscordErrorDigest deduplicates messages and respects Discord's limit", () => {
  const digest = formatDiscordErrorDigest(["alpha failed", "alpha failed", "beta failed", "x".repeat(2500)]);

  assert.match(digest, /^Bridges cron failures \(3\):/);
  assert.equal(digest.match(/alpha failed/g)?.length, 1);
  assert.ok(digest.length <= 2000);
  assert.match(digest, /failure\(s\) omitted/);
});

test("getDiscordRetryAfterMs prefers Discord's JSON seconds value", () => {
  assert.equal(getDiscordRetryAfterMs('{"retry_after":0.35}', "5"), 350);
  assert.equal(getDiscordRetryAfterMs("not-json", "2"), 2000);
  assert.equal(getDiscordRetryAfterMs("not-json"), 1000);
});
