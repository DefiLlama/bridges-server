import assert from "node:assert/strict";
import test from "node:test";
import { repriceWormholeOutliers, WormholeBridgeEvent } from "./index";

const event = (overrides: Partial<WormholeBridgeEvent> = {}): WormholeBridgeEvent => ({
  block_timestamp: 1_784_000_000,
  transaction_hash: "wormhole-event",
  token_transfer_from_address: "from",
  token_transfer_to_address: "to",
  token_address: "destination-token",
  token_usd_amount: "2000000",
  token_amount: "1",
  source_chain: "polygon",
  source_token_address: "0xABC",
  source_token_amount: "10",
  destination_chain: "near",
  application_protocol_ids: ["OMNI_BRIDGE"],
  ...overrides,
});

test("leaves normal Wormhole events unchanged without a price lookup", async () => {
  let lookups = 0;
  const input = event({ token_usd_amount: "999999" });
  const result = await repriceWormholeOutliers([input], {
    fetchPrice: async () => {
      lookups++;
      return { price: 2 };
    },
  });

  assert.deepEqual(result, [input]);
  assert.equal(lookups, 0);
});

test("reprices every verifiable large event regardless of protocol", async () => {
  const result = await repriceWormholeOutliers([event()], {
    fetchPrice: async (chain, token, timestamp) => {
      assert.equal(chain, "polygon");
      assert.equal(token, "0xabc");
      assert.equal(timestamp, Math.floor(1_784_000_000 / 3600) * 3600);
      return { price: 2, confidence: 0.9, decimals: 18 };
    },
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].token_usd_amount, "20");
});

test("drops a large event when source repricing fields are missing", async () => {
  let lookups = 0;
  const result = await repriceWormholeOutliers(
    [event({ source_token_address: null, source_token_amount: null })],
    {
      fetchPrice: async () => {
        lookups++;
        return { price: 2 };
      },
    }
  );

  assert.deepEqual(result, []);
  assert.equal(lookups, 0);
});

test("drops a large event when its source chain or price is not verifiable", async () => {
  const unsupportedChain = await repriceWormholeOutliers([event({ source_chain: "near" })], {
    fetchPrice: async () => ({ price: 2 }),
  });
  const lowConfidencePrice = await repriceWormholeOutliers([event()], {
    fetchPrice: async () => ({ price: 2, confidence: 0.2 }),
  });

  assert.deepEqual(unsupportedChain, []);
  assert.deepEqual(lowConfidencePrice, []);
});

test("drops a large event when the independent price lookup fails", async () => {
  const result = await repriceWormholeOutliers([event()], {
    fetchPrice: async () => {
      throw new Error("price API unavailable");
    },
  });

  assert.deepEqual(result, []);
});

test("normalizes raw source token units using price decimals", async () => {
  const result = await repriceWormholeOutliers(
    [event({ token_usd_amount: "2000000", source_token_amount: "2000000000000" })],
    { fetchPrice: async () => ({ price: 1, decimals: 6, confidence: 0.9 }) }
  );

  assert.equal(result[0].token_usd_amount, "2000000");
});
