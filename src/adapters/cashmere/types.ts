export interface CashmereTransaction {
  id: number;
  source_tx_hash: string;
  block?: number;
  source_domain?: number;
  destination_domain?: number;
  sender?: string;
  recipient?: string;
  solana_owner?: string;
  deposit_amount?: number;  // USDC amount in 6 decimals (e.g., 1000000 = $1.00)
  receive_amount?: number;  // USDC amount in 6 decimals (e.g., 1000000 = $1.00)
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
  19: "hyperliquid" // hyperliquid evm
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
  
  // Non-EVM Chains
  solana: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // Solana SPL token
  sui: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC", // Sui Move type
  aptos: "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b", // Aptos coin type
  
  // Hyperliquid EVM
  hyperliquid: "0xb88339CB7199b77E23DB6E890353E22632Ba630f" // Hyperliquid EVM USDC
};
