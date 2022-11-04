export const PRICES_API = 'https://coins.llama.fi/prices'

export const defaultConfidenceThreshold = 0.5 // for querying defillama prices


// each chain should have number of blocks per approx. 1.5 or 2 hours. default is 400.
export const maxBlocksToQueryByChain = {
  default: 400,
  ethereum: 400,
  polygon: 2000,
  fantom: 5000,
  arbitrum: 25000,
  avalanche: 3000,
  avax: 3000,
  bsc: 2000,
  optimism: 12000,
  gnosis: 400,
  aurora: 5400
} as { [chain: string]: number };


/*
// for multichain
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
} as { [chain: string]: number };
*/