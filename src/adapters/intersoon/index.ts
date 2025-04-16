import dayjs from "dayjs";

type InterSoonBridgeEvent = {
  block_timestamp: string;
  transaction_hash: string;
  token_transfer_from_address: string;
  token_transfer_to_address: string;
  token_address: string;
  token_usd_amount: string;
  token_amount: string;
  source_chain: string;
  destination_chain: string;
};

const chains = [
  "solana",
  "ton"
];

export const chainNameMapping: { [key: string]: string } = {
  "Solana Network": "solana",
  "Ton Network": "ton"
};

export function normalizeChainName(chainName: string): string {
  return chainNameMapping[chainName] ?? chainName?.toLowerCase();
}


export const fetchInterSoonEvents = async (
  fromTimestamp: number,
  toTimestamp: number
): Promise<InterSoonBridgeEvent[]> => {
  let allResults: InterSoonBridgeEvent[] = [];
  let currentTimestamp = fromTimestamp;
  const BATCH_SIZE = 5000;

  while (currentTimestamp < toTimestamp) {
    const response = await axios.get<InterSoonBridgeEvent[]>(
      `https://api.ccb-relayer.soo.network/transaction/get_bridge_history?from_timestamp=${fromTimestamp}&end_timestamp=${toTimestamp}&limit=${BATCH_SIZE}`
    );
    const { data } = response.data;

    if (data.length === 0) break;

    const normalizedBatch = data.map((row: any) => ({
      ...row,
      source_chain: normalizeChainName(row.source_chain),
      destination_chain: normalizeChainName(row.destination_chain),
      token_usd_amount: String(row.token_usd_amount ?? 0),
      block_timestamp: Math.floor(row.create_timestamp / 1000),
    }));

    allResults = [...allResults, ...normalizedBatch];
    console.log(`Fetched ${allResults.length} InterSoon events.`);

    currentTimestamp = normalizedBatch[normalizedBatch.length - 1].block_timestamp + 1;

    if (data.length < BATCH_SIZE) break;
  }

  return allResults;
};

const adapter = chains.reduce((acc: any, chain: string) => {
  acc[chain] = true;
  return acc;
}, {});

export default adapter;
