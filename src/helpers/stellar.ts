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

