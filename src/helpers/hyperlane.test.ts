import assert from "node:assert/strict";
import test from "node:test";
import { fetchHyperlaneEvents } from "../adapters/hyperlane";
import { isNonRetryableError } from "../utils/errors";

test("Hyperlane events fail closed on forbidden responses", async () => {
  await assert.rejects(
    () =>
      fetchHyperlaneEvents(
        100,
        200,
        async () =>
          ({
            ok: false,
            status: 403,
            statusText: "Forbidden",
            text: async () => "blocked",
            json: async () => [],
          } as any)
      ),
    (error: unknown) => isNonRetryableError(error) && /HTTP 403 Forbidden: blocked/.test((error as Error).message)
  );
});

test("Hyperlane events reject successful malformed responses", async () => {
  await assert.rejects(
    () =>
      fetchHyperlaneEvents(
        100,
        200,
        async () =>
          ({
            ok: true,
            status: 200,
            statusText: "OK",
            text: async () => "",
            json: async () => ({ events: [] }),
          } as any)
      ),
    /non-array response/
  );
});

test("Hyperlane events return a valid upstream array", async () => {
  const events = [{ blockNumber: 1, txHash: "0x1" }];
  assert.deepEqual(
    await fetchHyperlaneEvents(
      100,
      200,
      async () =>
        ({
          ok: true,
          status: 200,
          statusText: "OK",
          text: async () => "",
          json: async () => events,
        } as any)
    ),
    events
  );
});
