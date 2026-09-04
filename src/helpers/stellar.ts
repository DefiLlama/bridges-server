const axios = require("axios");
const retry = require("async-retry");

export const getRpcNode = () => {
  return process.env.STELLAR_RPC ?? "https://mainnet.sorobanrpc.com";
};
export const getHorizonRpcNode = () => {
  return process.env.STELLAR_HORIZON_RPC ?? "https://horizon.stellar.org";
};

export const getLatestLedger = async (): Promise<{ number: number; timestamp: number }> => {
  let response = await retry(
    () => axios.post(
      getRpcNode(),
      {
        jsonrpc: "2.0",
        id: 1,
        method: "getLatestLedger",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    ),
    { factor: 1, retries: 3 }
  );
  if (response?.status === 200) {
    return {
      number: response.data.result.sequence,
      timestamp: response.data.result.closeTime,
    };
  } else {
    throw new Error(`Stellar returned response ${response?.status} with statusText ${response?.statusText}.`);
  }
}

export const getTimestampByLedgerNumber = async (sequence: number): Promise<number> => {
  let response = await retry(
    () => axios.get(`${getHorizonRpcNode()}/ledgers/${sequence}`),
    { factor: 1, retries: 3 }
  );
  if (response?.status === 200) {
    return new Date(response.data.closed_at).getTime() / 1000;
  } else {
    throw new Error(`Stellar returned response ${response?.status} with statusText ${response?.statusText}.`);
  }
}

// a getEvents window wider than this is silently truncated; the page limit is a hard server maximum
const MAX_LEDGER_SPAN = 10000;
const MAX_EVENTS_PER_PAGE = 10000;

// nominal ledger close time, only used to seek an approximate ledger, never to report one as exact
const LEDGER_CLOSE_SECONDS = 5;

export const getLedgerByTimestamp = async (timestamp: number): Promise<number> => {
  const latest = await getLatestLedger();
  const latestTimestamp = Number(latest.timestamp);
  if (timestamp >= latestTimestamp) return latest.number;
  let ledger = latest.number;
  let ledgerTimestamp = latestTimestamp;
  // close times drift from the nominal rate, so the estimate is walked in until it lands on the target
  for (let i = 0; i < 12 && Math.abs(ledgerTimestamp - timestamp) > LEDGER_CLOSE_SECONDS; i++) {
    ledger = Math.max(1, ledger - Math.round((ledgerTimestamp - timestamp) / LEDGER_CLOSE_SECONDS));
    ledgerTimestamp = await getTimestampByLedgerNumber(ledger);
  }
  return ledger;
};

// the runner samples ledger times only to fill in events that carry no timestamp of their own, and
// stellar events always carry one, so horizon being unreachable must not fail the batch
export const getStellarProvider = () => ({
  getBlock: async (sequence: number) => ({
    number: sequence,
    timestamp: await getTimestampByLedgerNumber(sequence).catch(async () => {
      const latest = await getLatestLedger();
      return Number(latest.timestamp) - (latest.number - sequence) * LEDGER_CLOSE_SECONDS;
    }),
  }),
});

type StellarContractEvent = {
  ledger: number;
  ledgerClosedAt: string;
  txHash: string;
  topicJson: any[];
  valueJson: any;
};

const sorobanRpcCall = async (method: string, params: any) => {
  const response = await retry(() => axios.post(getRpcNode(), { jsonrpc: "2.0", id: 1, method, params }), {
    factor: 1,
    retries: 3,
  });
  // soroban reports its own errors with an http 200 status, so axios does not throw on them
  if (response.data.error) {
    throw new Error(`Stellar ${method} failed: ${response.data.error.message}`);
  }
  return response.data.result;
};

// public soroban nodes retain about 7 days of ledgers; an older fromLedger throws instead of returning nothing
export const getContractEvents = async (
  contractId: string,
  fromLedger: number,
  toLedger: number
): Promise<StellarContractEvent[]> => {
  const filters = [{ type: "contract", contractIds: [contractId] }];
  const events: StellarContractEvent[] = [];
  for (let startLedger = fromLedger; startLedger <= toLedger; startLedger += MAX_LEDGER_SPAN) {
    const endLedger = Math.min(startLedger + MAX_LEDGER_SPAN, toLedger + 1); // exclusive
    let cursor: string | undefined;
    while (true) {
      const result: { events: StellarContractEvent[]; cursor?: string } = await sorobanRpcCall("getEvents", {
        ...(cursor ? {} : { startLedger, endLedger }), // a cursor cannot be combined with a ledger range
        filters,
        pagination: { cursor, limit: MAX_EVENTS_PER_PAGE },
        xdrFormat: "json",
      });
      // paging past the first page drops the ledger range, so the window is closed here instead
      const inRange = result.events.filter((event) => event.ledger < endLedger);
      events.push(...inRange);
      if (inRange.length < result.events.length || result.events.length < MAX_EVENTS_PER_PAGE) break;
      if (!result.cursor) {
        throw new Error("Stellar getEvents returned a full page without a pagination cursor");
      }
      if (result.cursor === cursor) {
        throw new Error("Stellar getEvents returned a non-advancing pagination cursor");
      }
      cursor = result.cursor;
    }
  }
  return events;
};
