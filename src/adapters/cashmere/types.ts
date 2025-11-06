export interface CashmereTransaction {
  id: number;
  source_tx_hash: string;
  block?: number;
  source_domain?: number;
  destination_domain?: number;
  sender?: string;
  recipient?: string;
  solana_owner?: string;
  deposit_amount?: number; // USDC amount in 6 decimals (e.g., 1000000 = $1.00)
  receive_amount?: number; // USDC amount in 6 decimals (e.g., 1000000 = $1.00)
  max_fee?: number;
  relayer_fee?: number;
  gas_drop_amount?: number;
  gas_drop_status?: string;
  gas_drop_tx_hash?: string;
  is_gas_drop_in_native?: boolean;
  message_hash?: string;
  attestation_hash?: string;
  nonce?: string;
  domain_nonce?: number;
  version?: number;
  source_tx_error?: string;
  confirmed: boolean;
  attestation_error?: string;
  destination_tx_hash?: string;
  destination_tx_error?: string;
  destination_tx_status?: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  has_source_tx_error: boolean;
  has_attestation_error: boolean;
  has_destination_tx_error: boolean;
}

export interface CashmereAPIResponse {
  transactions: CashmereTransaction[];
  next_cursor: string;
  has_more: boolean;
}

// Domain ID to chain name mapping for CCTP (matching bridges-server chain names)
export const domainToChain: Record<number, string> = {
  /// circle cctp
  0: "ethereum",
  1: "avax",
  2: "optimism",
  3: "arbitrum",
  5: "solana",
  6: "base",
  7: "polygon",
  8: "sui",
  9: "aptos",
  10: "unichain",
  11: "linea",
  13: "sonic",
  14: "wc", // worldchain
  16: "sei",
  19: "hyperliquid", // hyperliquid evm
  /// layer zero
  30101: "ethereum",
  30106: "avax",
  30109: "polygon",
  30110: "arbitrum",
  30111: "optimism",
  30184: "base",
  30320: "unichain",
  30183: "linea",
  30319: "wc",
  30280: "sei",
  30332: "sonic",
  30367: "hyperliquid",
  30362: "berachain",
  30339: "ink",
  30331: "corn",
  30295: "flare",
  30333: "rootstock",
  30274: "xlayer",
  30383: "plasma",
  /// near intents
  500_011: "ethereum",
  500_012: "ethereum",
  500_021: "arbitrum",
  500_022: "arbitrum",
  500_031: "polygon",
  500_032: "polygon",
  500_041: "optimism",
  500_042: "optimism",
  500_051: "avax",
  500_052: "avax",
  500_061: "base",
  500_071: "solana",
  500_072: "solana",
  500_081: "bsc",
  500_082: "bsc",
};

export const chainToDomain: Record<string, number> = Object.fromEntries(
  Object.entries(domainToChain).map(([domain, chain]) => [chain, parseInt(domain)])
);

// USDC mainnet contract addresses by chain
export const usdcAddresses: Record<string, string> = {
  // EVM Chains
  ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  avax: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  optimism: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  polygon: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  unichain: "0x078D782b760474a361dDA0AF3839290b0EF57AD6",
  linea: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff",
  sonic: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
  wc: "0x79A02482A880bCe3F13E09da970dC34dB4cD24D1", // worldchain
  sei: "0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392",
  bsc: "0x8965349fb649a33a30cbfda057d8ec2c48abe2a2",

  // Non-EVM Chains
  solana: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // Solana SPL token
  sui: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC", // Sui Move type
  aptos: "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b", // Aptos coin type

  // Hyperliquid EVM
  hyperliquid: "0xb88339CB7199b77E23DB6E890353E22632Ba630f", // Hyperliquid EVM USDC
};

export const usdt0Addresses: Record<string, string> = {
  ethereum: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  polygon: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  arbitrum: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
  optimism: "0x01bFF41798a0BcF287b996046Ca68b395DbC1071",
  unichain: "0x9151434b16b9763660705744891fA906F660EcC5",
  sei: "0x9151434b16b9763660705744891fA906F660EcC5",
  hyperliquid: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb",
  berachain: "0x779Ded0c9e1022225f8E0630b35a9b54bE713736",
  bnb: "0x55d398326f99059fF775485246999027B3197955",
  ink: "0x0200C29006150606B650577BBE7B6248F58470c1",
  corn: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb",
  flare: "0xe7cd86e13AC4309349F30B3435a9d337750fC82D",
  rootstock: "0x779dED0C9e1022225F8e0630b35A9B54Be713736",
  xlayer: "0x779Ded0c9e1022225f8E0630b35a9b54bE713736",
  plasma: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb",
};

export const usdtAddresses: Record<string, string> = {
  ethereum: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  arbitrum: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  polygon: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  optimism: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
  avax: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
  solana: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  bsc: "0x381169958af503ed00894b2284307eb75b93e11140e81fc10d80fc1345124856", // BSC USD
};
