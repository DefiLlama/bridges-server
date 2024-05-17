const axios = require("axios");

const apiKeys = [
  "a4e25c66-b143-4d0b-91d2-0d9b2371d397",
  "1b2f1df4-c5bd-40b4-b416-118d7d6d3b51",
  "394bfb17-915c-4e38-82b0-61be1f8213c0",
];

export const getAccountTrcTransactions = async (
  address: string,
  contractAddress: string,
  minTimestamp: number,
  maxTimestamp?: number
) => {
  let transactions = [] as any;
  for (let i = 0; i < 4; i++) {
    let accumulatedTransactions = [] as any[];
    let fingerprint = null;
    try {
      do {
        const options = {
          method: "GET",
          headers: { "TRON-PRO-API-KEY": apiKeys[Math.floor(Math.random() * 3)], accept: "application/json" },
        };
        const response = await axios.get(
          `https://api.trongrid.io/v1/accounts/${address}/transactions/trc20?limit=50${
            fingerprint ? `&fingerprint=${fingerprint}` : ""
          }&min_timestamp=${minTimestamp}${
            maxTimestamp ? `&max_timestamp=${maxTimestamp}` : ""
          }&contract_address=${contractAddress}`,
          options
        );
        if (response?.status === 200) {
          accumulatedTransactions = [...accumulatedTransactions, ...response.data.data];
          fingerprint = response?.data?.meta?.fingerprint as string | null;
        } else {
          throw new Error(`Tron returned response ${response?.status} with statusText ${response?.statusText}.`);
        }
      } while (fingerprint);
      transactions = accumulatedTransactions;
      break;
    } catch (e) {
      if (i >= 3) {
        console.error(
          `Error getting Tron AccountTrcTransactions, transactions in timestamp range ${minTimestamp} to ${maxTimestamp} skipped.`,
          e
        );
        return [];
      } else continue;
    }
  }
  return transactions;
};

export const getTronLogs = async (
  contractAddress: string,
  eventName: string,
  minBlockTimestamp: number,
  maxBlockTimestamp: number
) => {
  const tronRpc = `https://api.trongrid.io`;
  const tronLogs: any[] = [];
  let fingerprint = null;
  do {
    const url = `${tronRpc}/v1/contracts/${contractAddress}/events?event_name=${eventName}&min_block_timestamp=${
      minBlockTimestamp * 1000
    }&max_block_timestamp=${maxBlockTimestamp * 1000}&limit=200${fingerprint ? `&fingerprint=${fingerprint}` : ""}`;
    const options = {
      method: "GET",
      headers: { "TRON-PRO-API-KEY": apiKeys[Math.floor(Math.random() * 3)], accept: "application/json" },
    };
    const response = await axios.get(url, options);
    if (response?.status !== 200) {
      throw new Error(`Tron returned response ${response?.status} with statusText ${response?.statusText}.`);
    }
    const body = response?.data;
    if (!body?.success) {
      throw new Error(`Error getting Tron events.`);
    }
    tronLogs.push(...body?.data);
    fingerprint = body?.meta?.fingerprint as string | null;
  } while (fingerprint);

  return tronLogs;
};

export const tronGetLatestBlock = async () => {
  const response = await axios.post("https://api.trongrid.io/wallet/getblockbylatestnum", { num: 1 });
  const { number, timestamp } = response?.data?.block?.[0]?.block_header?.raw_data;
  return { number: number, timestamp: Math.floor(timestamp / 1000) };
};

export const tronGetTimestampByBlockNumber = async (blockNumber: number) => {
  const response = await axios.post("https://api.trongrid.io/wallet/getblockbynum", { num: blockNumber });
  const { timestamp } = response?.data?.block_header?.raw_data;
  return Math.floor(timestamp / 1000);
};
