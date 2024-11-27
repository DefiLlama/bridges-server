import dayjs from "dayjs";
import { queryAllium } from "../../helpers/allium";

type WormholeBridgeEvent = {
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
  "ethereum",
  "avalanche",
  "avax",
  "bsc",
  "polygon",
  "arbitrum",
  "optimism",
  "base",
  "zksync",
  "scroll",
  "aptos",
  "sui",
  "solana",
  "sei",
  "mantle",
  "fantom",
  "injective",
  "moonbeam",
  "oasis",
  "celo",
  "kaia",
  "near",
  "algorand",
  "terra",
  "terra classic",
  "karura",
  "acala",
];

export const chainNameMapping: { [key: string]: string } = {
  ethereum: "Ethereum",
  avalanche: "Avalanche",
  avax: "Avalanche",
  polygon: "Polygon",
  arbitrum: "Arbitrum",
  optimism: "Optimism",
  fantom: "Fantom",
  base: "Base",
  solana: "Solana",
  sui: "Sui",
  aptos: "Aptos",
  celo: "Celo",
  mantle: "Mantle",
  scroll: "Scroll",
  algorand: "Algorand",
  sei: "Sei",
  moonbeam: "Moonbeam",
  injective: "Injective",
  kaia: "Kaia",
  oasis: "Oasis",
  BNB_Smart_Chain: "BSC",
  bnb_smart_chain: "BSC",
  terra: "Terra Classic",
  terra2: "Terra",
  "terra classic": "Terra Classic",
  near: "Near",
};

export function normalizeChainName(chainName: string): string {
  const lowercaseChain = chainName.toLowerCase();

  const mapping = chainNameMapping[lowercaseChain] || chainNameMapping[chainName];

  if (mapping) {
    return mapping?.toLowerCase();
  }

  return chainName?.toLowerCase();
}

export const fetchWormholeEvents = async (
  fromTimestamp: number,
  toTimestamp: number
): Promise<WormholeBridgeEvent[]> => {
  let allResults: WormholeBridgeEvent[] = [];
  let currentTimestamp = fromTimestamp;
  const BATCH_SIZE = 10000;

  while (currentTimestamp < toTimestamp) {
    const result = await queryAllium(`
      select
        BLOCK_TIMESTAMP,
        TOKEN_TRANSFER_FROM_ADDRESS,
        TOKEN_TRANSFER_TO_ADDRESS,
        TOKEN_ADDRESS,
        TOKEN_USD_AMOUNT,
        TOKEN_AMOUNT,
        SOURCE_CHAIN,
        DESTINATION_CHAIN, 
        UNIQUE_ID AS transaction_hash
      from org_db__defillama.default.wormhole_token_transfers
      where
        block_timestamp BETWEEN TO_TIMESTAMP_NTZ(${currentTimestamp}) AND TO_TIMESTAMP_NTZ(${toTimestamp}) 
        and status != 'REFUNDED'
        order by block_timestamp
        limit ${BATCH_SIZE};
    `);

    if (result.length === 0) break;

    const normalizedBatch = result.map((row: any) => ({
      ...row,
      block_timestamp: dayjs(row.block_timestamp).unix(),
    }));

    allResults = [...allResults, ...normalizedBatch];
    console.log(`Fetched ${allResults.length} Wormhole events.`);

    currentTimestamp = normalizedBatch[normalizedBatch.length - 1].block_timestamp + 1;

    if (result.length < BATCH_SIZE) break;
  }

  return allResults;
};

const adapter = chains.reduce((acc: any, chain: string) => {
  acc[chain] = true;
  return acc;
}, {});

export default adapter;
