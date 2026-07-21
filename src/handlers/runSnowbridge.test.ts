import assert from "node:assert/strict";
import test from "node:test";
import { fetchSnowbridgeTransfers, filterSnowbridgeTransfers, parseRetryAfterMs } from "./runSnowbridge";

test("parseRetryAfterMs supports seconds and HTTP dates", () => {
  assert.equal(parseRetryAfterMs("3"), 3000);
  assert.equal(parseRetryAfterMs("Tue, 21 Jul 2026 10:00:05 GMT", Date.parse("2026-07-21T10:00:00Z")), 5000);
  assert.equal(parseRetryAfterMs("invalid"), null);
});

test("Snowbridge response is filtered locally after one full-window fetch", () => {
  const response = {
    toPolkadot: [
      {
        messageId: "1",
        txHash: "0x1",
        blockNumber: 1,
        timestamp: "2026-07-21T10:30:00Z",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        amount: "1",
        status: 1,
        direction: "toPolkadot" as const,
      },
    ],
    toEthereum: [
      {
        messageId: "2",
        txHash: "0x2",
        blockNumber: 2,
        timestamp: "2026-07-20T09:00:00Z",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        amount: "1",
        status: 1,
        direction: "toEthereum" as const,
      },
    ],
  };

  const events = filterSnowbridgeTransfers(
    response,
    Date.parse("2026-07-21T10:00:00Z") / 1000,
    Date.parse("2026-07-21T11:00:00Z") / 1000
  );
  assert.equal(events.length, 1);
  assert.equal(events[0].txHash, "0x1");
  assert.equal(events[0].isDeposit, true);
});

test("Snowbridge retries 429 using Retry-After and then returns one response", async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls++;
    if (calls === 1) {
      return new Response("rate limited", { status: 429, headers: { "retry-after": "0" } });
    }
    return new Response(JSON.stringify({ toEthereum: [], toPolkadot: [] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  assert.deepEqual(await fetchSnowbridgeTransfers(undefined, fetchImpl as typeof fetch), {
    toEthereum: [],
    toPolkadot: [],
  });
  assert.equal(calls, 2);
});
