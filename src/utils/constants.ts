export const PRICES_API = 'https://coins.llama.fi/prices'

export const defaultConfidenceThreshold = 0.5 // for querying defillama prices

// each chain should have number of blocks per approx. 1.5 or 2 hours. default is 400.
export const maxBlocksToQueryByChain = {
  default: 400,
  polygon: 2000,
  arbitrum: 25000,
} as { [chain: string]: number };