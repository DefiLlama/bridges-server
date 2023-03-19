export const PRICES_API = "https://coins.llama.fi/prices";

export const defaultConfidenceThreshold = 0.5; // for querying defillama prices

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
  aurora: 5400,
  celo: 1200,
  klaytn: 6000,
} as { [chain: string]: number };

export const nonBlocksChains = [
  "osmosis",
  "secret",
  "injective",
  "terra",
  "crescent",
  "juno",
  "kujira",
  "sifchain",
  "stride",
  "cosmos",
  "canto",
];
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

export const tokenWhitelist = [
  /// ETH TOKENS
  "ethereum:0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
  "ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
  "ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
  "ethereum:0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
  "ethereum:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
  /// ETH STARGATE
  "ethereum:0x101816545f6bd2b1076434b54383a1e633390a2e", // ETH
  "ethereum:0xdf0770df86a8034b3efef0a1bb3c889b8332ff56", // USDC
  "ethereum:0x38ea452219524bb87e18de1c24d3bb59510bd783", // USDT
  "ethereum:0x692953e758c3669290cb1677180c64183cee374e", // USDD
  "ethereum:0x0faf1d2d3ced330824de3b8200fc8dc6e397850d", // DAI
  "ethereum:0xfa0f307783ac21c39e939acff795e27b650f6e68", // FRAX
  "ethereum:0x590d4f8a68583639f215f675f3a259ed84790580", // sUSD
  "ethereum:0xe8f55368c82d38bbbbdb5533e7f56afc2e978cc2", // LUSD
  "ethereum:0x9cef9a0b1be0d289ac9f4a98ff317c33eaa84eb8", // MAI
  "ethereum:0x430ebff5e3e80a6c58e7e6ada1d90f5c28aa116d", // USDT
  /// ARB TOKENS
  "arbitrum:0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
  "arbitrum:0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
  "arbitrum:0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // WETH
  "arbitrum:0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", // DAI
  "arbitrum:0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", // WBTC
  /// ARB STARGATE
  "arbitrum:0x915a55e36a01285a14f05de6e81ed9ce89772f8e", // ETH
  "arbitrum:0x892785f33cdee22a30aef750f285e18c18040c3e", // USDC
  "arbitrum:0xb6cfcf89a7b22988bfc96632ac2a9d6dab60d641", // USDT
  "arbitrum:0xaa4bf442f024820b2c28cd0fd72b82c63e66f56c", // FRAX
  "arbitrum:0xf39b7be294cb36de8c510e267b82bb588705d977", // MAI
  "arbitrum:0x600e576f9d853c95d58029093a16ee49646f3ca5", // LUSD
  /// OP TOKENS
  "optimism:0x94b008aa00579c1307b0ef2c499ad98a8ce58e58", // USDT
  "optimism:0x7f5c764cbc14f9669b88837ca1490cca17c31607", // USDC
  "optimism:0x4200000000000000000000000000000000000006", // WETH
  "optimism:0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", // DAI
  "optimism:0x68f180fcce6836688e9084f035309e29bf0a2095", // WBTC
  /// OP STARGATE
  "optimism:0xd22363e3762ca7339569f3d33eade20127d5f98c", // ETH
  "optimism:0xdecc0c09c3b5f6e92ef4184125d5648a66e35298", // USDC
  "optimism:0x165137624f1f692e69659f944bf69de02874ee27", // DAI
  "optimism:0x368605d9c6243a80903b9e326f1cddde088b8924", // FRAX
  "optimism:0x2f8bc9081c7fcfec25b9f41a50d97eaa592058ae", // sUSD
  "optimism:0x3533f5e279bdbf550272a199a223da798d9eff78", // LUSD
  "optimism:0x5421fa1a48f9ff81e4580557e86c7c0d24c18036", // MAI
  /// FTM TOKENS
  "fantom:0x049d68029688eabf473097a2fc38ef61633a3c7a", // fUSDT
  "fantom:0x04068da6c83afcfa0e13ba15a6696662335d5b75", // USDC
  "fantom:0x74b23882a30290451a17c44f4f05243b6b58c76d", // ETH
  "fantom:0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e", // DAI
  "fantom:0x321162cd933e2be498cd2267a90534a804051b11", // BTC
  /// FTM STARGATE
  "fantom:0x12edea9cd262006cc3c4e77c90d2cd2dd4b1eb97", // USDC
  /// AVAX TOKENS
  "avax:0xc7198437980c041c805a1edcba50c1ce5db95118", // USDT
  "avax:0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664", // USDC
  "avax:0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab", // WETH
  "avax:0xd586e7f844cea2f87f50152665bcbc2c279d8d70", // DAI
  "avax:0x50b7545627a5162f82a992c33b87adc75187b218", // WBTC
  /// POLY TOKENS
  "polygon:0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // USDT
  "polygon:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // USDC
  "polygon:0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", // WETH
  "polygon:0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", // DAI
  "polygon:0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6", // WBTC0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6
  /// BSC TOKENS
  "bsc:0x55d398326f99059ff775485246999027b3197955", // USDT
  "bsc:0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC
  "bsc:0x2170ed0880ac9a755fd29b2688956bd959f933f8", // ETH
];
