import { Chain } from "@defillama/sdk/build/general";
import bridgeNetworkData from "../data/bridgeNetworkData";
import { BridgeNetwork } from "../data/types";
import { wait } from "../helpers/etherscan";
import { runAdapterHistorical } from "./adapter";
import { getBlockByTimestamp } from "./blocks";
import retry from "async-retry";
import { sql } from "./db";

interface ChainTask {
  adapterKey: string; // e.g. "gnosis" — key into the adapter object
  blockChain: string; // e.g. "xdai" — SDK chain name for block lookups
}

const startTs = Number(process.argv[2]);
const endTs = Number(process.argv[3]);
const bridgeName = process.argv[4];
const chainFilter = process.argv[5] && !process.argv[5].startsWith("--") ? process.argv[5] : undefined;

if (!startTs || !endTs || !bridgeName) {
  console.error("Usage: npm run adapter <startTs> <endTs> <bridgeName> [chain]");
  console.error("Example: npm run adapter 1704067200 1704153600 hop ethereum");
  process.exit(1);
}

if (startTs >= endTs) {
  console.error("startTs must be less than endTs");
  process.exit(1);
}

let shuttingDown = false;

process.on("SIGINT", () => {
  if (shuttingDown) {
    console.log("\nForce shutdown.");
    process.exit(1);
  }
  shuttingDown = true;
  console.log("\nGraceful shutdown requested. Finishing in-flight work...");
});

function resolveChains(adapter: BridgeNetwork, filter?: string): ChainTask[] {
  const tasks: ChainTask[] = [];

  for (const chain of adapter.chains) {
    const adapterKey = chain.toLowerCase();
    if (adapterKey === adapter.destinationChain?.toLowerCase()) continue;

    const blockChain = adapter.chainMapping?.[adapterKey] ?? adapterKey;

    if (filter) {
      const f = filter.toLowerCase();
      if (adapterKey !== f && blockChain !== f) continue;
    }

    tasks.push({ adapterKey, blockChain });
  }

  return tasks;
}

function splitIntoDailyIntervals(startTimestamp: number, endTimestamp: number): Array<{ start: number; end: number }> {
  const intervals: Array<{ start: number; end: number }> = [];
  const oneDay = 24 * 60 * 60;
  let currentStart = startTimestamp;

  while (currentStart < endTimestamp) {
    const startOfDay = Math.floor(currentStart / oneDay) * oneDay;
    const endOfDay = startOfDay + oneDay - 1;
    intervals.push({ start: currentStart, end: Math.min(endOfDay, endTimestamp) });
    currentStart = endOfDay + 1;
  }

  return intervals;
}

async function processOneDay(
  adapter: BridgeNetwork,
  task: ChainTask,
  interval: { start: number; end: number },
  progress: BackfillProgress
): Promise<void> {
  const { adapterKey, blockChain } = task;
  const date = new Date(interval.start * 1000).toISOString().slice(0, 10);

  try {
    let startBlock: number;
    let endBlock: number;

    if (adapter.bridgeDbName === "ibc") {
      const sb = await getBlockByTimestamp(interval.start, blockChain as Chain, adapter, "First");
      if (!sb) throw new Error(`Could not find start block for ${blockChain}`);
      const eb = await getBlockByTimestamp(interval.end, blockChain as Chain, adapter, "Last");
      if (!eb) throw new Error(`Could not find end block for ${blockChain}`);
      startBlock = sb.block ?? sb;
      endBlock = eb.block ?? eb;
    } else {
      const sb = await retry(() => getBlockByTimestamp(interval.start, blockChain as Chain), { retries: 3, factor: 2 });
      const eb = await retry(() => getBlockByTimestamp(interval.end, blockChain as Chain), { retries: 3, factor: 2 });
      startBlock = sb.block;
      endBlock = eb.block;
    }

    await runAdapterHistorical(startBlock, endBlock, adapter.id, adapterKey, true, false, "upsert");

    progress.succeed(adapterKey, date);
  } catch (e: any) {
    const errMsg = e.message || String(e);
    progress.fail(adapterKey, date, errMsg);
  }
}

async function processChainAllDays(
  adapter: BridgeNetwork,
  task: ChainTask,
  intervals: Array<{ start: number; end: number }>,
  progress: BackfillProgress,
  parallel: boolean
): Promise<void> {
  if (parallel) {
    await Promise.all(intervals.map((interval) => processOneDay(adapter, task, interval, progress)));
  } else {
    for (const interval of intervals) {
      if (shuttingDown) break;
      await processOneDay(adapter, task, interval, progress);
    }
  }
}

// --- Progress Tracker ---

class BackfillProgress {
  private totalChains: number;
  private totalDays: number;
  private chainDaysDone: Map<string, number> = new Map();
  private succeeded = 0;
  private failed = 0;
  private failures: Array<{ chain: string; date: string; error: string }> = [];
  private startTime: number;
  private lastPrint = 0;

  constructor(chains: ChainTask[], totalDays: number) {
    this.totalChains = chains.length;
    this.totalDays = totalDays;
    this.startTime = Date.now();
    for (const c of chains) {
      this.chainDaysDone.set(c.adapterKey, 0);
    }
  }

  succeed(chain: string, date: string) {
    this.succeeded++;
    this.chainDaysDone.set(chain, (this.chainDaysDone.get(chain) || 0) + 1);
    this.print();
  }

  fail(chain: string, date: string, error: string) {
    this.failed++;
    this.chainDaysDone.set(chain, (this.chainDaysDone.get(chain) || 0) + 1);
    this.failures.push({ chain, date, error });
    this.print(`FAIL ${chain} ${date}: ${error}`);
  }

  private print(extra?: string) {
    const now = Date.now();
    // Throttle progress line to every 2s unless there's an error
    if (!extra && now - this.lastPrint < 2000) return;
    this.lastPrint = now;

    const total = this.totalChains * this.totalDays;
    const done = this.succeeded + this.failed;
    const pct = ((done / total) * 100).toFixed(1);
    const elapsed = ((now - this.startTime) / 1000).toFixed(0);

    // Show which chains are furthest behind
    let slowest = "";
    let minDays = this.totalDays;
    for (const [chain, days] of this.chainDaysDone) {
      if (days < minDays) {
        minDays = days;
        slowest = chain;
      }
    }

    if (extra) {
      process.stdout.write(`\n  ${extra}\n`);
    }
    process.stdout.write(
      `\r  [${pct}%] ${done}/${total} chain-days | OK: ${this.succeeded} FAIL: ${this.failed} | ${elapsed}s | slowest: ${slowest} (${minDays}/${this.totalDays})`
    );
  }

  summary() {
    const elapsed = Date.now() - this.startTime;
    const total = this.totalChains * this.totalDays;

    process.stdout.write("\n");
    console.log("\n" + "=".repeat(60));
    console.log("BACKFILL COMPLETE");
    console.log("=".repeat(60));
    console.log(`Total chain-days:   ${total}`);
    console.log(`Succeeded:          ${this.succeeded}`);
    console.log(`Failed:             ${this.failed}`);
    console.log(`Total time:         ${(elapsed / 60000).toFixed(1)} minutes`);

    // Per-chain summary
    console.log("\nPer-chain progress:");
    for (const [chain, days] of this.chainDaysDone) {
      const status = days === this.totalDays ? "done" : `${days}/${this.totalDays}`;
      console.log(`  ${chain}: ${status}`);
    }

    if (this.failures.length > 0) {
      console.log("\nFailures:");
      for (const f of this.failures) {
        console.log(`  ${f.date} | ${f.chain}: ${f.error}`);
      }
    }
    console.log("=".repeat(60));
  }
}

// --- Main ---

async function main() {
  const adapter = bridgeNetworkData.find((x) => x.bridgeDbName === bridgeName);
  if (!adapter) {
    console.error(`Adapter "${bridgeName}" not found.`);
    process.exit(1);
  }

  const tasks = resolveChains(adapter, chainFilter);
  if (tasks.length === 0) {
    console.error(`No chains to process for "${bridgeName}"${chainFilter ? ` with filter "${chainFilter}"` : ""}`);
    process.exit(1);
  }

  const intervals = splitIntoDailyIntervals(startTs, endTs);

  console.log(`Adapter:  ${adapter.displayName} (${adapter.bridgeDbName})`);
  console.log(
    `Range:    ${new Date(startTs * 1000).toISOString().slice(0, 10)} to ${new Date(endTs * 1000)
      .toISOString()
      .slice(0, 10)}`
  );
  console.log(`Days:     ${intervals.length}`);
  console.log(`Chains:   ${tasks.map((t) => t.adapterKey).join(", ")}`);
  console.log("");

  const progress = new BackfillProgress(tasks, intervals.length);

  const singleChain = tasks.length === 1;
  if (singleChain) {
    console.log("Single chain detected — running all days in parallel");
  }

  // Each chain runs through all days independently, in parallel
  // Stagger chain starts by 500ms to avoid thundering herd on block lookups
  const chainPromises = tasks.map(async (task, i) => {
    await wait(500 * i);
    await processChainAllDays(adapter, task, intervals, progress, singleChain);
  });

  await Promise.all(chainPromises);

  progress.summary();
}

// --- Entry ---

(async () => {
  try {
    await main();
  } catch (e: any) {
    console.error("Fatal error:", e.message);
  } finally {
    try {
      await sql.end({ timeout: 5 });
    } catch {}
    process.exit(0);
  }
})();
