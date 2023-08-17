export const gatewayAddresses = {
  ethereum: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
  bsc: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
  polygon: "0x6f015F16De9fC8791b234eF68D486d2bF203FBA8",
  avax: "0x5029C0EFf6C34351a0CEc334542cDb22c7928f78",
  fantom: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
  arbitrum: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  optimism: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  base: "0xe432150cce91c13a887f7D836923d5597adD8E31",
} as {
  [chain: string]: string;
};

export const supportedChains = [
  "ethereum",
  "binance",
  "polygon",
  "avalanche",
  "fantom",
  "arbitrum",
  "optimism",
  "base",
];
