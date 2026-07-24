import assert from "node:assert/strict";
import test from "node:test";
import { getProviderRpcOverride } from "./provider";

test("Darwinia uses the current official RPC instead of the retired SDK hostname", () => {
  assert.deepEqual(getProviderRpcOverride("darwinia"), {
    url: "https://rpc.darwinia.network",
    chainId: 46,
  });
  assert.equal(getProviderRpcOverride("ethereum"), undefined);
});
