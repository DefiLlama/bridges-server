export const PRICES_API = "https://coins.llama.fi/prices";

export const defaultConfidenceThreshold = 0.5; // for querying defillama prices

// each chain should have number of blocks per approx. 1.5 or 2 hours. default is 400.
export const maxBlocksToQueryByChain = {
  default: 300,
  ethereum: 300,
  polygon: 1000,
  fantom: 800,
  arbitrum: 3000,
  era: 5000,
  linea: 3000,
  manta: 800,
  blast: 2000,
  avax: 3000,
  bsc: 2000,
  optimism: 3000,
  xdai: 400,
  aurora: 5400,
  celo: 1200,
  klaytn: 6000,
  sui: 2400,
  solana: 6000,
  stellar: 1000,
  taiko: 100,
  sonic: 10000,
  base: 3000,
  arbitrum_nova: 3000,
  polygon_zkevm: 2000,
  scroll: 2000,
  mode: 2000,
  mantle: 2000,
  "b2-mainnet": 2000,
  berachain: 3000,
  hyperliquid: 3000,
  op_bnb: 5000,
  gravity: 5000,
  merlin: 3000,
  xlayer: 3000,
  bob: 3000,
  fraxtal: 3000,
  morph: 3000,
  lisk: 3000,
  zircuit: 3000,
  ink: 3000,
  mint: 3000,
  btr: 3000,
  zeta: 5000,
  fuse: 1500,
  wc: 3000,
  cyeth: 3000,
  zora: 3000,
  matchain: 3000,
  zklink: 3000,
  zkfair: 3000,
  monad: 5000,
  plume: 3000,
  imx: 3000,
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
