import dayjs from "dayjs";
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
  is_deposit?: boolean;
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
  "wormchain",
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
  karura: "Karura",
  acala: "Acala",
  wormchain: "Wormchain",
  xlayer: "xLayer",
  blast: "Blast",
  xpla: "XPLA",
};

export function normalizeChainName(chainName: string): string {
  const lowercaseChain = chainName.toLowerCase();

  const mapping = chainNameMapping[lowercaseChain] || chainNameMapping[chainName];

  if (mapping) {
    return mapping?.toLowerCase();
  }

  return chainName?.toLowerCase();
}

// Map wormhole chain IDs to chain names
const wormholeChainMap: { [key: string]: string } = {
  "1": "solana",
  "2": "ethereum",
  "30": "base",
  "23": "arbitrum",
  "24": "optimism",
  "5": "polygon",
  "6": "avalanche",
  "4": "bsc",
  "21": "sui",
  "44": "unichain",
  "22": "aptos",
  "38": "linea"
};

export const fetchMayanEvents = async (fromTimestamp: number, toTimestamp: number): Promise<WormholeBridgeEvent[]> => {
  let allResults: WormholeBridgeEvent[] = [];
  let offset = 0;
  const BATCH_SIZE = 10000;
  
  // Convert timestamps to milliseconds for API
  const startMs = fromTimestamp * 1000;
  const endMs = toTimestamp * 1000;

  console.log(`[Mayan] Starting fetch from ${new Date(startMs).toISOString()} to ${new Date(endMs).toISOString()}`);
  console.log(`[Mayan] Timestamps: ${fromTimestamp} - ${toTimestamp} (unix seconds)`);

  while (true) {
    try {
      const url = `http://localhost:3000/swaps?startTs=${startMs}&endTs=${endMs}&offset=${offset}&limit=${BATCH_SIZE}`;
      console.log(`[Mayan] Fetching batch: offset=${offset}, limit=${BATCH_SIZE}`);
      console.log(`[Mayan] Request URL: ${url}`);
      
      const response = await fetch(url);
      
      console.log(`[Mayan] Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Mayan] API error response: ${errorText}`);
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`[Mayan] Received ${result.length} events in current batch`);
      
      if (result.length === 0) {
        console.log(`[Mayan] No more events, stopping pagination`);
        break;
      }

      // Log sample of first event for debugging
      if (offset === 0 && result.length > 0) {
        console.log(`[Mayan] Sample first event structure:`, JSON.stringify(result[0], null, 2));
      }

      const normalizedBatch = result
        .map((row: any) => {
          // Parse timestamp - handle both ISO string and unix formats
          const timestamp = row.ts ? dayjs(row.ts).unix() : dayjs().unix();
          
          // Map chain IDs to chain names
          const sourceChain = wormholeChainMap[row.originChain] || row.originChain || "unknown";
          const destChain = wormholeChainMap[row.chain] || row.chain || "unknown";
          
          // For deposits, swap source/dest (deposit means going FROM origin TO current chain)
          const [source, dest] = row.isDeposit 
            ? [sourceChain, destChain]
            : [destChain, sourceChain];

          // Parse USD amount and check for outliers
          const usdAmount = parseFloat(row.amountUsd || "0") || 0;
          
          // Log outliers over 100k for monitoring
          if (usdAmount > 100000) {
            console.log(`[Mayan] Large USD amount: $${usdAmount.toLocaleString()} - txHash: ${row.txHash}, isDeposit: ${row.isDeposit}`);
            if (usdAmount > 1000000) {
              console.log(`[Mayan] WARNING: Transaction over $1M detected - will be filtered in volume calculation`);
            }
          }

          return {
            block_timestamp: timestamp,
            transaction_hash: row.txHash || row.orderId || "",
            token_transfer_from_address: row.txFrom || "",
            token_transfer_to_address: row.txTo || "",
            token_address: row.token || "",
            token_usd_amount: String(usdAmount),
            token_amount: row.amount || "0",
            source_chain: source,
            destination_chain: dest,
            is_deposit: row.isDeposit, // Include deposit flag for filtering in handler
          };
        });

      allResults = [...allResults, ...normalizedBatch];
      console.log(`[Mayan] Total events fetched so far: ${allResults.length}`);
      
      // Log chain mapping for first few events
      if (offset === 0 && normalizedBatch.length > 0) {
        console.log(`[Mayan] Chain mapping example: originChain ${result[0].originChain} -> ${normalizedBatch[0].source_chain}, chain ${result[0].chain} -> ${normalizedBatch[0].destination_chain}`);
      }

      offset += BATCH_SIZE;

      if (result.length < BATCH_SIZE) {
        console.log(`[Mayan] Batch size (${result.length}) < limit (${BATCH_SIZE}), stopping pagination`);
        break;
      }
    } catch (error) {
      console.error("[Mayan] Error fetching events from API:", error);
      console.error(`[Mayan] Failed at offset: ${offset}`);
      throw error;
    }
  }

  console.log(`[Mayan] Fetch complete. Total events: ${allResults.length}`);
  return allResults;
};

const adapter = chains.reduce((acc: any, chain: string) => {
  acc[chain] = true;
  return acc;
}, {});

export default adapter;
