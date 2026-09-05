import BigNumber from "bignumber.js";
import { CCIPEvent } from "../adapters/ccip";

export type StoredCCIPEvent = Omit<CCIPEvent, "ts"> & { id: string; ts: Date };

export const ccipEventKey = (event: Pick<CCIPEvent, "chain" | "tx_hash" | "token" | "tx_from" | "tx_to">) =>
  JSON.stringify([event.chain, event.tx_hash, event.token, event.tx_from, event.tx_to]);

export function groupCCIPEvents(events: CCIPEvent[]): CCIPEvent[] {
  const grouped = new Map<string, CCIPEvent>();
  for (const event of events) {
    const key = ccipEventKey(event);
    const previous = grouped.get(key);
    if (!previous) {
      grouped.set(key, { ...event });
    } else {
      if (previous.is_deposit !== event.is_deposit || previous.is_usd_volume !== event.is_usd_volume) {
        throw new Error(`Conflicting CCIP events for ${event.tx_hash}`);
      }
      previous.amount = new BigNumber(previous.amount).plus(event.amount).toFixed();
      // Destination batches can contain multiple messages. Keep their bucket
      // stable when the upstream response changes ordering.
      previous.ts = Math.min(previous.ts, event.ts);
    }
  }
  return [...grouped.values()];
}

export function diffCCIPSnapshot(expected: CCIPEvent[], stored: StoredCCIPEvent[]) {
  if (expected.length === 0 && stored.length > 0) {
    throw new Error("Refusing to erase an existing CCIP day from an empty API snapshot");
  }
  const remaining = new Map(expected.map((event) => [ccipEventKey(event), event]));
  const deleted: StoredCCIPEvent[] = [];
  const updated: CCIPEvent[] = [];
  let unchanged = 0;
  for (const row of stored) {
    const key = ccipEventKey(row);
    const event = remaining.get(key);
    if (!event) {
      deleted.push(row);
      continue;
    }
    remaining.delete(key);
    if (
      event.ts !== row.ts.getTime() ||
      event.is_deposit !== row.is_deposit ||
      event.is_usd_volume !== row.is_usd_volume ||
      !new BigNumber(event.amount).eq(row.amount)
    ) {
      updated.push(event);
    } else {
      unchanged++;
    }
  }
  return { added: [...remaining.values()], updated, deleted, unchanged };
}

export function ccipUSDTotals(events: Array<Pick<CCIPEvent, "amount" | "is_deposit" | "is_usd_volume">>) {
  let deposit = new BigNumber(0);
  let withdrawal = new BigNumber(0);
  for (const event of events) {
    if (!event.is_usd_volume) continue;
    if (event.is_deposit) deposit = deposit.plus(event.amount);
    else withdrawal = withdrawal.plus(event.amount);
  }
  return { depositUSD: deposit.toFixed(2), withdrawUSD: withdrawal.toFixed(2) };
}
