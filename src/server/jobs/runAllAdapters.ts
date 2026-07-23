import bridgeNetworks from "../../data/bridgeNetworkData";
import { sql } from "../../utils/db";
import { runAdapterToCurrentBlock } from "../../utils/adapter";
import { shouldSkipScheduledBridge } from "../../utils/bridgePolicy";
import { PromisePool } from "@supercharge/promise-pool";
import { isAbortError, throwIfAborted } from "../../utils/errors";
import { classifyAdapterFailure, evaluateAdapterQuality } from "./adapterQuality";

type RunAllAdaptersSnapshot = {
  total: number;
  started: number;
  succeeded: number;
  failed: number;
  active: string[];
  failedAdapters: string[];
  failureCategories: Record<string, number>;
};

let snapshot: RunAllAdaptersSnapshot = {
  total: 0,
  started: 0,
  succeeded: 0,
  failed: 0,
  active: [],
  failedAdapters: [],
  failureCategories: {},
};

const updateSnapshot = (updates: Partial<RunAllAdaptersSnapshot>) => {
  snapshot = { ...snapshot, ...updates };
};

export const getRunAllAdaptersDiagnostics = () => {
  const categories = Object.entries(snapshot.failureCategories)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => `${category}=${count}`)
    .join(",");
  return (
    `${snapshot.succeeded} ok, ${snapshot.failed} failed, ${snapshot.active.length} active` +
    ` [${snapshot.active.join(",") || "none"}], ${snapshot.started}/${snapshot.total} started` +
    `${snapshot.failedAdapters.length ? `; failed adapters: ${snapshot.failedAdapters.join(",")}` : ""}` +
    `${categories ? `; categories: ${categories}` : ""}`
  );
};

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
  if (!process.env.ONESEC_API_BASE_URL) {
    console.warn(
      "[ADAPTERS] Skipping 1sec: the public endpoint is blocked by a Cloudflare challenge; configure ONESEC_API_BASE_URL to enable it."
    );
  }
  const shuffledBridgeNetworks = [...bridgeNetworks].sort(() => Math.random() - 0.5);
  const activeAdapters = new Set<string>();
  const failedAdapters: string[] = [];
  const failureCategories: Record<string, number> = {};
  let succeeded = 0;
  let failed = 0;
  let started = 0;
  const total = shuffledBridgeNetworks.filter((adapter) => !shouldSkipScheduledBridge(adapter.bridgeDbName)).length;
  snapshot = { total, started: 0, succeeded: 0, failed: 0, active: [], failedAdapters: [], failureCategories: {} };

  const { errors } = await PromisePool.withConcurrency(10)
    .for(shuffledBridgeNetworks)
    .process(async (adapter) => {
      throwIfAborted(signal);
      if (shouldSkipScheduledBridge(adapter.bridgeDbName)) return;
      const startedAt = Date.now();
      activeAdapters.add(adapter.bridgeDbName);
      started++;
      updateSnapshot({ started, active: Array.from(activeAdapters) });
      console.log(`[ADAPTER] START ${adapter.bridgeDbName}`);
      try {
        await runAdapterToCurrentBlock(adapter, true, "upsert", storedBlocks, signal);
        throwIfAborted(signal);
        succeeded++;
        updateSnapshot({ succeeded });
        console.log(`[ADAPTER] OK ${adapter.bridgeDbName} (${((Date.now() - startedAt) / 1000).toFixed(1)}s)`);
      } catch (e) {
        failed++;
        failedAdapters.push(adapter.bridgeDbName);
        for (const category of classifyAdapterFailure(e)) {
          failureCategories[category] = (failureCategories[category] ?? 0) + 1;
        }
        updateSnapshot({ failed, failedAdapters: [...failedAdapters], failureCategories: { ...failureCategories } });
        console.error(
          `[ADAPTER] FAILED ${adapter.bridgeDbName} (${((Date.now() - startedAt) / 1000).toFixed(1)}s):`,
          e
        );
        if (isAbortError(e) || signal?.aborted) throw e;
      } finally {
        activeAdapters.delete(adapter.bridgeDbName);
        updateSnapshot({ active: Array.from(activeAdapters) });
      }
    });

  if (signal?.aborted) {
    console.error(`[ADAPTERS] Aborted with active adapters: ${Array.from(activeAdapters).join(", ") || "none"}`);
    throwIfAborted(signal);
  }
  if (errors.length > 0) throw errors[0].raw;
  const quality = evaluateAdapterQuality(total, failed);
  const result = quality.exceeded ? "FAILED_QUALITY_GATE" : failed > 0 ? "DEGRADED" : "OK";
  console.log(
    `[ADAPTERS] Completed: ${succeeded} ok, ${failed} failed; failedRatio=${(quality.failedRatio * 100).toFixed(
      1
    )}%; result=${result}`
  );
  console.log(`[ADAPTERS] Failure categories: ${JSON.stringify(failureCategories)}`);
  if (quality.exceeded) {
    throw new Error(
      `Adapter quality gate failed: ${failed}/${total} adapters failed (${(quality.failedRatio * 100).toFixed(
        1
      )}%); limits are ${quality.maxFailedAdapters} adapters and ${(quality.maxFailedRatio * 100).toFixed(1)}%`
    );
  }
  return {
    degraded: failed > 0,
    error: failed > 0 ? `${failed} adapter(s) failed: ${failedAdapters.join(", ")}` : undefined,
  };
};
