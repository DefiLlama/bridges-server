export const PRICES_API = "https://coins.llama.fi/prices";

export const defaultConfidenceThreshold = 0.5; // for querying defillama prices

// each chain should have number of blocks per approx. 1.5 or 2 hours. default is 400.
export const maxBlocksToQueryByChain = {
  default: 300,
  ethereum: 300,
  polygon: 1000,
  fantom: 800,
  arbitrum: 3000,
  "zksync era": 5000,
  era: 4000,
  linea: 3000,
  manta: 800,
  blast: 2000,
  avalanche: 1000,
  avax: 3000,
  bsc: 2000,
  optimism: 3000,
  gnosis: 400,
  aurora: 5400,
  celo: 1200,
  klaytn: 6000,
  sui: 2400, // sui creates a checkpoint about every 3 seconds
  solana: 12000, // solana produces slots every 400ms, so 2 hours is 18000 slotsб
  taiko: 100,
} as { [chain: string]: number };

// will be handled by the bridge adapter
export const nonBlocksChains: string[] = [];

/*
// for slow adapters
export const maxBlocksToQueryByChain = {
  default: 1600,
  ethereum: 1600,
  polygon: 8000,
  fantom: 20000,
  arbitrum: 40000,
  avalanche: 12000,
  avax: 12000,
  bsc: 8000,
  optimism: 40000,
  gnosis: 1200,
  aurora: 10000,
  celo: 3000,
  klaytn: 8000,
} as { [chain: string]: number };
*/
