export const squidRouterAddresses = {
  default: "0xce16F69375520ab01377ce7B88f5BA8C48F8D666",
  blast: "0x492751eC3c57141deb205eC2da8bFcb410738630",
  fraxtal: "0xDC3D8e1Abe590BCa428a8a2FC4CfDbD1AcF57Bd9",
};

export const axelarGatewayAddresses = {
  ethereum: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
  bsc: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
  polygon: "0x6f015F16De9fC8791b234eF68D486d2bF203FBA8",
  avax: "0x5029C0EFf6C34351a0CEc334542cDb22c7928f78",
  fantom: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
  arbitrum: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  base: "0xe432150cce91c13a887f7d836923d5597add8e31",
  linea: "0xe432150cce91c13a887f7d836923d5597add8e31",
  celo: "0xe432150cce91c13a887f7d836923d5597add8e31",
  moonbeam: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
  kava: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  filecoin: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  optimism: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  mantle: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  scroll: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  blast: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  fraxtal: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  immutable: "0xe432150cce91c13a887f7D836923d5597adD8E31",
} as {
  [chain: string]: string;
};

export const coralSpokeAddresses = {
  default: "0xA4cE01bD7Dd91DA968a7C4A8D04282a3f5eA06bB",
  new: "0xdf4fFDa22270c12d0b5b3788F1669D709476111E"
} as {
  [chain: string]: string;
};

export const stablecoins = {
  USDC: {
    ethereum: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    polygon: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    arbitrum: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
    bsc: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    base: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    avalanche: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
    celo: "0xceba9300f2b948710d2653dd7b07f33a8b32118c",
    optimism: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
  },
  USDT: {
    ethereum: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    polygon: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    arbitrum: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
    bsc: "0x55d398326f99059ff775485246999027b3197955",
    avalanche: "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",
    celo: "0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e", 
    optimism: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
    linea: "0xa219439258ca9da29e9cc4ce5596924745e12b93",

  }
};

export const chainIdToName: { [key: string]: string } = {
  "0x1": "ethereum",
  "0x38": "bsc",
  "0x89": "polygon",
  "0xa4b1": "arbitrum",
  "0xa": "optimism",
  "0x2105": "base",
  "0xe708": "linea",
  "0x504": "moonbeam",
  "0xa86a": "avalanche",
  "0xfa": "fantom",
  "0xa4ec": "celo",
  // Add other chains as needed
};

export const chainNameMapping: { [key: string]: string } = {
  avax: "avalanche",
  ethereum: "ethereum",
  polygon: "polygon",
  arbitrum: "arbitrum",
  optimism: "optimism",
  base: "base",
  linea: "linea",
  moonbeam: "moonbeam",
  bsc: "bsc",
  fantom: "fantom",
  blast: "blast",
  fraxtal: "fraxtal"
};
