import bridgeNetworks from "../../data/bridgeNetworkData";
import { sql } from "../../utils/db";
import { runAdapterToCurrentBlock, shouldSkipBridge } from "../../utils/adapter";
import { PromisePool } from "@supercharge/promise-pool";
import { isAbortError, throwIfAborted } from "../../utils/errors";

export const runAllAdapters = async (signal?: AbortSignal) => {
  throwIfAborted(signal);
  const lastRecordedBlocks = await sql`SELECT jsonb_object_agg(bridge_id::text, subresult) as result
  FROM (
      SELECT bridge_id, jsonb_build_object('startBlock', MIN(tx_block), 'endBlock', MAX(tx_block)) as subresult
      FROM bridges.transactions
      WHERE origin_chain IS NULL
      GROUP BY bridge_id
  ) subquery;
  `;
  const storedBlocks = lastRecordedBlocks[0]?.result ?? {};
  console.log(`[ADAPTERS] Loaded progress for ${Object.keys(storedBlocks).length} bridge IDs`);
  const shuffledBridgeNetworks = [...bridgeNetworks].sort(() => Math.random() - 0.5);
  const activeAdapters = new Set<string>();
  let succeeded = 0;
  let failed = 0;

  const { errors } = await PromisePool.withConcurrency(10)
    .for(shuffledBridgeNetworks)
    .process(async (adapter) => {
      throwIfAborted(signal);
      if (shouldSkipBridge(adapter.bridgeDbName)) return;
      const startedAt = Date.now();
      activeAdapters.add(adapter.bridgeDbName);
      console.log(`[ADAPTER] START ${adapter.bridgeDbName}`);
      try {
        await runAdapterToCurrentBlock(adapter, true, "upsert", storedBlocks, signal);
        throwIfAborted(signal);
        succeeded++;
        console.log(`[ADAPTER] OK ${adapter.bridgeDbName} (${((Date.now() - startedAt) / 1000).toFixed(1)}s)`);
      } catch (e) {
        failed++;
        console.error(
          `[ADAPTER] FAILED ${adapter.bridgeDbName} (${((Date.now() - startedAt) / 1000).toFixed(1)}s):`,
          e
        );
        if (isAbortError(e) || signal?.aborted) throw e;
      } finally {
        activeAdapters.delete(adapter.bridgeDbName);
      }
    });

  if (signal?.aborted) {
    console.error(`[ADAPTERS] Aborted with active adapters: ${Array.from(activeAdapters).join(", ") || "none"}`);
    throwIfAborted(signal);
  }
  if (errors.length > 0) throw errors[0].raw;
  console.log(`[ADAPTERS] Completed: ${succeeded} ok, ${failed} failed; result=${failed > 0 ? "DEGRADED" : "OK"}`);
  return {
    degraded: failed > 0,
    error: failed > 0 ? `${failed} adapter(s) failed; see [ADAPTER] FAILED entries` : undefined,
  };
};
