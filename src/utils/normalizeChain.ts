export const normalizedChainReplacements = {
  binance: "bsc",
  wanchain: "wan",
  kucoin: "kcc",
  //gnosis: "xdai",
  "terra%20classic": "terra",
  sxnetwork: "sx",
  "arbitrum%20nova": "arbitrum_nova",
  ethereumpow: "ethpow",
  "milkomeda%20c1": "milkomeda",
} as {
  [chain: string]: string;
};

export function normalizeChain(chain: string) {
  let normalizedChain = chain.toLowerCase();
  return normalizedChainReplacements[normalizedChain] ?? normalizedChain;
}

export const nonChains = ["PK", "SK", "tvl", "totalCirculating", "tvlPrev1Hour", "tvlPrev1Day", "tvlPrev1Week"];

export function addToChains(chains: string[], chainDisplayName: string) {
  if (chainCoingeckoIds[chainDisplayName] !== undefined && !chains.includes(chainDisplayName)) {
    chains.push(chainDisplayName);
  } else if (chainDisplayName.includes("-")) {
    const chainName = chainDisplayName.split("-")[0];
    addToChains(chains, chainName);
  }
}

export const chainCoingeckoIds = {
  Ethereum: {
    geckoId: "ethereum",
    symbol: "ETH",
    cmcId: "1027",
    categories: ["EVM"],
    chainId: 1,
  },
  Arbitrum: {
    geckoId: null,
    symbol: null,
    cmcId: null,
    categories: ["EVM", "Rollup"],
    parent: "Ethereum",
    chainId: 42161,
  },
  "zkSync Era": {
    geckoId: null,
    symbol: null,
    cmcId: null,
    categories: ["EVM", "Rollup"],
    parent: "Ethereum",
    chainId: 324,
  },
  "Polygon zkEVM": {
    geckoId: null,
    symbol: null,
    cmcId: null,
    categories: ["EVM", "Rollup"],
    parent: "Ethereum",
    chainId: 1101,
  },
  Palm: {
    geckoId: null,
    symbol: null,
    cmcId: null,
    categories: ["EVM"],
    chainId: 11297108109,
  },
  Optimism: {
    geckoId: null,
    symbol: null,
    cmcId: null,
    categories: ["EVM", "Rollup"],
    parent: "Ethereum",
    chainId: 10,
  },
  Stacks: {
    geckoId: "blockstack",
    symbol: "STX",
    cmcId: "4847",
  },
  PolyNetwork: {
    geckoId: null,
    symbol: null,
    cmcId: null,
  },
  Conflux: {
    geckoId: "conflux-token",
    symbol: "CFX",
    cmcId: "7334",
  },
  Nuls: {
    geckoId: "nuls",
    symbol: "NULS",
    cmcId: "2092",
  },
  Witnet: {
    geckoId: null,
    symbol: null,
    cmcId: null,
  },
  BSC: {
    geckoId: "binancecoin",
    symbol: "BNB",
    cmcId: "1839",
    categories: ["EVM"],
    chainId: 56,
  },
  Avalanche: {
    geckoId: "avalanche-2",
    symbol: "AVAX",
    cmcId: "5805",
    categories: ["EVM"],
    chainId: 43114,
  },
  Solana: {
    geckoId: "solana",
    symbol: "SOL",
    cmcId: "5426",
  },
  Sui: {
    geckoId: "sui",
    symbol: "SUI",
    cmcId: "20947",
  },
  Polygon: {
    geckoId: "matic-network",
    symbol: "MATIC",
    cmcId: "3890",
    categories: ["EVM"],
    chainId: 137,
  },
  "Terra Classic": {
    geckoId: "terra-luna",
    symbol: "LUNA",
    cmcId: "4172",
    categories: ["Cosmos"],
  },
  Fantom: {
    geckoId: "fantom",
    symbol: "FTM",
    cmcId: "3513",
    categories: ["EVM"],
    chainId: 250,
  },
  Gnosis: {
    geckoId: "gnosis",
    symbol: "GNO",
    cmcId: "1659",
    categories: ["EVM"],
    chainId: 100,
  },
  XdaiArb: {
    geckoId: null,
    symbol: null,
    cmcId: null,
    categories: ["EVM"],
    chainId: 200,
  },
  Heco: {
    geckoId: "huobi-token",
    symbol: "HT",
    cmcId: "2502",
    categories: ["EVM"],
    chainId: 128,
  },
  Kava: {
    geckoId: "kava",
    symbol: "KAVA",
    cmcId: "4846",
    categories: ["Cosmos"],
  },
  OKExChain: {
    geckoId: "oec-token",
    symbol: "OKT",
    cmcId: "8267",
    categories: ["EVM"],
    chainId: 66,
  },
  Wanchain: {
    geckoId: "wanchain",
    symbol: "WAN",
    cmcId: "2606",
    categories: ["EVM"],
    chainId: 888,
  },
  DefiChain: {
    geckoId: "defichain",
    symbol: "DFI",
    cmcId: "5804",
  },
  Ontology: {
    geckoId: "ontology",
    symbol: "ONT",
    cmcId: "2566",
  },
  Bitcoin: {
    geckoId: "bitcoin",
    symbol: "BTC",
    cmcId: "1",
  },
  Energi: {
    geckoId: "energi",
    symbol: "NRG",
    cmcId: "3218",
    categories: ["EVM"],
    chainId: 39797,
  },
  Secret: {
    geckoId: "secret",
    symbol: "SCRT",
    cmcId: "5604",
  },
  Zilliqa: {
    geckoId: "zilliqa",
    symbol: "ZIL",
    cmcId: "2469",
  },
  NEO: {
    geckoId: "neo",
    symbol: "NEO",
    cmcId: "1376",
  },
  Harmony: {
    geckoId: "harmony",
    symbol: "ONE",
    cmcId: "3945",
    categories: ["EVM"],
    chainId: 1666600000,
  },
  RSK: {
    geckoId: "rootstock",
    symbol: "RBTC",
    cmcId: "3626",
    categories: ["EVM"],
    chainId: 30,
  },
  Sifchain: {
    geckoId: "sifchain",
    symbol: "EROWAN",
    cmcId: "8541",
    categories: ["Cosmos"],
  },
  Algorand: {
    geckoId: "algorand",
    symbol: "ALGO",
    cmcId: "4030",
  },
  Osmosis: {
    geckoId: "osmosis",
    symbol: "OSMO",
    cmcId: "12220",
    categories: ["Cosmos"],
  },
  Thorchain: {
    geckoId: "thorchain",
    symbol: "RUNE",
    cmcId: "4157",
    categories: ["Cosmos"],
  },
  Tron: {
    geckoId: "tron",
    symbol: "TRON",
    cmcId: "1958",
  },
  Icon: {
    geckoId: "icon",
    symbol: "ICX",
    cmcId: "2099",
  },
  Tezos: {
    geckoId: "tezos",
    symbol: "XTZ",
    cmcId: "2011",
  },
  Celo: {
    geckoId: "celo",
    symbol: "CELO",
    cmcId: "5567",
    categories: ["EVM"],
    chainId: 42220,
  },
  KCC: {
    geckoId: "kucoin-shares",
    symbol: "KCS",
    cmcId: "2087",
    categories: ["EVM"],
    chainId: 321,
  },
  Karura: {
    geckoId: "karura",
    symbol: "KAR",
    cmcId: "10042",
    categories: ["Parachain"],
    parent: "Kusama",
  },
  Moonriver: {
    geckoId: "moonriver",
    symbol: "MOVR",
    cmcId: "9285",
    categories: ["EVM", "Parachain"],
    parent: "Kusama",
    chainId: 1285,
  },
  Waves: {
    geckoId: "waves",
    symbol: "WAVES",
    cmcId: "1274",
  },
  Klaytn: {
    geckoId: "klay-token",
    symbol: "KLAY",
    cmcId: "4256",
    categories: ["EVM"],
    chainId: 8217,
  },
  IoTeX: {
    geckoId: "iotex",
    symbol: "IOTX",
    cmcId: "2777",
    categories: ["EVM"],
    chainId: 4689,
  },
  Ultra: {
    geckoId: "ultra",
    symbol: "UOS",
    cmcId: "4189",
  },
  Kusama: {
    geckoId: "kusama",
    symbol: "KSM",
    cmcId: "5034",
  },
  Shiden: {
    geckoId: "shiden",
    symbol: "SDN",
    cmcId: "11451",
    categories: ["EVM", "Parachain"],
    parent: "Kusama",
    chainId: 336,
  },
  Telos: {
    geckoId: "telos",
    symbol: "TLOS",
    cmcId: "4660",
    categories: ["EVM"],
    chainId: 40,
  },
  ThunderCore: {
    geckoId: "thunder-token",
    symbol: "TT",
    cmcId: "3930",
    categories: ["EVM"],
    chainId: 108,
  },
  Lamden: {
    geckoId: "lamden",
    symbol: "TAU",
    cmcId: "2337",
  },
  Near: {
    geckoId: "near",
    symbol: "NEAR",
    cmcId: "6535",
  },
  EOS: {
    geckoId: "eos",
    symbol: "EOS",
    cmcId: "1765",
  },
  Songbird: {
    geckoId: "songbird",
    symbol: "SGB",
    cmcId: "12186",
    categories: ["EVM"],
    chainId: 19,
  },
  EnergyWeb: {
    geckoId: "energy-web-token",
    symbol: "EWT",
    cmcId: "5268",
    categories: ["EVM", "Parachain"],
    parent: ["Polkadot"],
    chainId: 246,
  },
  HPB: {
    geckoId: "high-performance-blockchain",
    symbol: "HPB",
    cmcId: "2345",
    categories: ["EVM"],
    chainId: 269,
  },
  GoChain: {
    geckoId: "gochain",
    symbol: "GO",
    cmcId: "2861",
    categories: ["EVM"],
    chainId: 60,
  },
  TomoChain: {
    geckoId: "tomochain",
    symbol: "TOMO",
    cmcId: "2570",
    categories: ["EVM"],
    chainId: 88,
  },
  Fusion: {
    geckoId: "fsn",
    symbol: "FSN",
    cmcId: "2530",
    categories: ["EVM"],
    chainId: 32659,
  },
  Kardia: {
    geckoId: "kardiachain",
    symbol: "KAI",
    cmcId: "5453",
    categories: ["EVM"],
    chainId: 0,
  },
  Fuse: {
    geckoId: "fuse-network-token",
    symbol: "FUSE",
    cmcId: "5634",
    categories: ["EVM"],
    chainId: 122,
  },
  SORA: {
    geckoId: "sora",
    symbol: "XOR",
    cmcId: "5802",
  },
  smartBCH: {
    geckoId: "bitcoin-cash",
    symbol: "BCH",
    cmcId: "1831",
    categories: ["EVM"],
    chainId: 10000,
  },
  Elastos: {
    geckoId: "elastos",
    symbol: "ELA",
    cmcId: "2492",
    categories: ["EVM"],
    chainId: 20,
  },
  Hoo: {
    geckoId: "hoo-token",
    symbol: "HOO",
    cmcId: "7543",
    categories: ["EVM"],
    chainId: 70,
  },
  Cronos: {
    geckoId: "crypto-com-chain",
    symbol: "CRO",
    cmcId: "3635",
    categories: ["EVM"],
    chainId: 25,
  },
  Polis: {
    geckoId: "polis",
    symbol: "POLIS",
    cmcId: "2359",
    categories: ["EVM"],
    chainId: 333999,
  },
  ZYX: {
    geckoId: "zyx",
    symbol: "ZYX",
    cmcId: "6131",
    categories: ["EVM"],
    chainId: 55,
  },
  Elrond: {
    geckoId: "elrond-erd-2",
    symbol: "EGLD",
    cmcId: "6892",
  },
  Stellar: {
    geckoId: "stellar",
    symbol: "XLM",
    cmcId: "512",
  },
  Boba: {
    geckoId: "boba-network",
    symbol: "BOBA",
    cmcId: "14556",
    categories: ["EVM", "Rollup"],
    parent: "Ethereum",
    chainId: 288,
  },
  Metis: {
    geckoId: "metis-token",
    symbol: "METIS",
    cmcId: "9640",
    categories: ["EVM", "Rollup"],
    parent: "Ethereum",
    chainId: 1088,
  },
  Ubiq: {
    geckoId: "ubiq",
    symbol: "UBQ",
    cmcId: "588",
    categories: ["EVM"],
    chainId: 8,
  },
  Mixin: {
    geckoId: "mixin",
    symbol: "XIN",
    cmcId: "2349",
  },
  Everscale: {
    geckoId: "everscale",
    symbol: "EVER",
    cmcId: "7505",
  },
  VeChain: {
    geckoId: "vechain",
    symbol: "VET",
    cmcId: "3077",
  },
  XDC: {
    geckoId: "xdce-crowd-sale",
    symbol: "XDC",
    cmcId: "2634",
  },
  Velas: {
    geckoId: "velas",
    symbol: "VLX",
    cmcId: "4747",
    categories: ["EVM"],
    chainId: 106,
  },
  Polkadot: {
    geckoId: "polkadot",
    symbol: "DOT",
    cmcId: "6636",
  },
  CosmosHub: {
    geckoId: "cosmos",
    symbol: "ATOM",
    cmcId: "3794",
  },
  EthereumClassic: {
    geckoId: "ethereum-classic",
    symbol: "ETC",
    cmcId: "1321",
    categories: ["EVM"],
    chainId: 61,
  },
  Sora: {
    geckoId: "sora",
    symbol: "XOR",
    cmcId: "5802",
  },
  Aurora: {
    geckoId: "aurora-near",
    symbol: "AURORA",
    cmcId: "14803",
    categories: ["EVM"],
    parent: "Near",
    chainId: 1313161554,
  },
  Ronin: {
    geckoId: null,
    symbol: "RON",
    cmcId: null,
    categories: ["EVM"],
    chainId: 2020,
  },
  zkSync: {
    geckoId: null,
    symbol: null,
    cmcId: null,
    categories: ["Rollup"],
    parent: "Ethereum",
  },
  SmartBCH: {
    geckoId: "bitcoin-cash",
    symbol: "BCH",
    cmcId: "1831",
    categories: ["EVM"],
    chainId: 10000,
  },
  Godwoken: {
    geckoId: null,
    symbol: null,
    cmcId: null,
    categories: ["EVM"],
    parent: "Nervos",
    chainId: 71394,
  },
  Callisto: {
    geckoId: "callisto",
    symbol: "CLO",
    cmcId: "2757",
    categories: ["EVM"],
    chainId: 820,
  },
  CSC: {
    geckoId: "coinex-token",
    symbol: "CET",
    cmcId: "2941",
    categories: ["EVM"],
    chainId: 52,
  },
  Ergo: {
    geckoId: "ergo",
    symbol: "ERG",
    cmcId: "1555",
  },
  Cardano: {
    geckoId: "cardano",
    symbol: "ADA",
    cmcId: "2010",
  },
  Liquidchain: {
    geckoId: "liquidchain",
    symbol: "XLC",
    cmcId: null,
    categories: ["EVM"],
    chainId: 5050,
  },
  Nahmii: {
    geckoId: "nahmii",
    symbol: "NII",
    cmcId: "4865",
    categories: ["EVM", "Rollup"],
    parent: "Ethereum",
    chainId: 5551,
  },
  Parallel: {
    geckoId: null,
    symbol: "PARA",
    cmcId: null,
    categories: ["Parachain"],
    parent: "Polkadot",
  },
  Meter: {
    geckoId: "meter",
    symbol: "MTRG",
    cmcId: "5919",
    categories: ["EVM"],
    chainId: 82,
  },
  Oasis: {
    geckoId: "oasis-network",
    symbol: "ROSE",
    cmcId: "7653",
    categories: ["EVM"],
    chainId: 42262,
  },
  Theta: {
    geckoId: "theta-token",
    symbol: "THETA",
    cmcId: "2416",
    categories: ["EVM"],
    chainId: 361,
  },
  Syscoin: {
    geckoId: "syscoin",
    symbol: "SYS",
    cmcId: "541",
    categories: ["EVM"],
    chainId: 57,
  },
  Moonbeam: {
    geckoId: "moonbeam",
    symbol: "GLMR",
    cmcId: "6836",
    categories: ["EVM", "Parachain"],
    parent: "Polkadot",
    chainId: 1284,
  },
  Astar: {
    geckoId: "astar",
    symbol: "ASTR",
    cmcId: "12885",
    categories: ["EVM", "Parachain"],
    parent: "Polkadot",
    chainId: 592,
  },
  Curio: {
    geckoId: null,
    symbol: null,
    cmcId: null,
    categories: ["EVM"],
    parent: "Skale",
    chainId: 836542336838601,
  },
  SKALE: {
    geckoId: "skale",
    symbol: "SKL",
    cmcId: "5691",
    categories: ["EVM"],
  },
  Bittorrent: {
    geckoId: "bittorrent",
    symbol: "BTT",
    cmcId: "16086",
    categories: ["EVM"],
    chainId: 199,
  },
  Genshiro: {
    geckoId: "genshiro",
    symbol: "GENS",
    cmcId: "10278",
    categories: ["Parachain", "EVM"],
    parent: "Kusama",
  },
  Wax: {
    geckoId: "wax",
    symbol: "WAXP",
    cmcId: "2300",
  },
  Evmos: {
    geckoId: "evmos",
    symbol: "EVMOS",
    cmcId: null,
    categories: ["EVM", "Cosmos"],
    chainId: 9001,
  },
  Proton: {
    geckoId: "proton",
    symbol: "XPR",
    cmcId: "5350",
  },
  Kadena: {
    geckoId: "kadena",
    symbol: "KDA",
    cmcId: "5647",
  },
  Vite: {
    geckoId: "vite",
    symbol: "VITE",
    cmcId: "2937",
  },
  Milkomeda: {
    geckoId: null,
    symbol: null,
    cmcId: null,
    categories: ["EVM"],
    chainId: 2001,
  },
  DFK: {
    geckoId: "defi-kingdoms",
    symbol: "JEWEL",
    cmcId: "12319",
    categories: ["EVM"],
    chainId: 53935,
  },
  Omni: {
    geckoId: "omni",
    symbol: "OMNI",
    cmcId: "83",
  },
  Crab: {
    geckoId: "darwinia-crab-network-native-token",
    symbol: "CRAB",
    cmcId: "9243",
  },
  Statemine: {
    geckoId: null,
    symbol: null,
    cmcId: null,
    categories: ["Parachain"],
    parent: "Kusama",
  },
  Flow: {
    geckoId: "flow",
    symbol: "FLOW",
    cmcId: "4558",
  },
  Hedera: {
    geckoId: "hedera",
    symbol: "HBAR",
    cmcId: "4642",
  },
  REINetwork: {
    geckoId: "rei-network",
    symbol: "REI",
    cmcId: "19819",
  },
  Loopring: {
    geckoId: "loopring",
    symbol: "LRC",
    cmcId: "1934",
    categories: ["Rollup"],
    parent: "Ethereum",
  },
  Aztec: {
    geckoId: null,
    symbol: null,
    cmcId: null,
    categories: ["Rollup"],
    parent: "Ethereum",
  },
  StarkNet: {
    geckoId: null,
    symbol: null,
    cmcId: null,
    categories: ["Rollup"],
    parent: "Ethereum",
  },
  Acala: {
    geckoId: "acala",
    symbol: "ACA",
    cmcId: "6756",
    categories: ["EVM", "Parachain"],
    parent: "Polkadot",
  },
  SXnetwork: {
    geckoId: "sx-network",
    symbol: "SX",
    cmcId: "8377",
    categories: ["EVM", "Rollup"],
    parent: {
      chain: "Polygon",
      types: ["L2", "gas"],
    },
  },
  Heiko: {
    geckoId: null,
    symbol: "HKO",
    cmcId: null,
    categories: ["Parachain"],
    parent: {
      chain: "Kusama",
      types: ["parachain"],
    },
  },
  Dogechain: {
    geckoId: "dogechain",
    symbol: "DG",
    cmcId: null,
    categories: ["EVM"],
  },
  Canto: {
    geckoId: "canto",
    symbol: "CANTO",
    cmcId: "21516",
    categories: ["EVM", "Cosmos"],
  },
  Ripple: {
    geckoId: "ripple",
    symbol: "XRP",
    cmcId: "52",
  },
  "Arbitrum Nova": {
    geckoId: null,
    symbol: null,
    cmcId: null,
    categories: ["EVM", "Rollup"],
    parent: {
      chain: "Ethereum",
      types: ["L2", "gas"],
    },
    chainId: 42170,
  },
  Kujira: {
    geckoId: "kujira",
    symbol: "KUJI",
    cmcId: "15185",
    categories: ["Cosmos"],
  },
  Injective: {
    geckoId: "injective-protocol",
    symbol: "INJ",
    cmcId: null,
    categories: ["Cosmos"],
  },
  Crescent: {
    geckoId: "crescent-network",
    symbol: "CRE",
    cmcId: null,
    categories: ["Cosmos"],
  },
  Juno: {
    geckoId: "juno-network",
    symbol: "JUNO",
    cmcId: "14299",
    categories: ["Cosmos"],
  },
  Stride: {
    geckoId: "stride",
    symbol: "STRD",
    cmcId: "21781",
    categories: ["Cosmos"],
  },
  Axelar: {
    geckoId: "axelar",
    symbol: "AXL",
    cmcId: "17799",
    categories: ["Cosmos"],
  },
  "Gravity Bridge": {
    geckoId: null,
    symbol: null,
    cmcId: null,
    categories: ["Cosmos"],
  },
} as {
  [chain: string]: {
    geckoId: string | null;
    symbol: string | null;
    cmcId: string | null;
    categories?: string[];
  };
};
chainCoingeckoIds["xDai"] = chainCoingeckoIds["Gnosis"];
chainCoingeckoIds["Binance"] = chainCoingeckoIds["BSC"];
chainCoingeckoIds["Kucoin"] = chainCoingeckoIds["KCC"];
chainCoingeckoIds["Cosmos"] = chainCoingeckoIds["CosmosHub"];

export const extraSections = ["staking", "pool2", "offers", "borrowed", "masterchef"];

export function transformNewChainName(chain: string) {
  switch (chain) {
    case "Binance":
      return "BSC";
    case "Kucoin":
      return "KCC";
    case "xDai":
      return "Gnosis";
    case "Cosmos":
      return "CosmosHub";
    default:
      return chain;
  }
}

export function getChainDisplayName(normalizedChain: string, useNewChainNames: boolean): string {
  if (extraSections.includes(normalizedChain)) {
    return normalizedChain;
  }
  if (normalizedChain.includes("-")) {
    return normalizedChain
      .split("-")
      .map((chain) => getChainDisplayName(chain, useNewChainNames))
      .join("-");
  }
  switch (normalizedChain) {
    case "bsc":
      return useNewChainNames ? "BSC" : "Binance";
    case "wan":
      return "Wanchain";
    case "kcc":
      return useNewChainNames ? "KCC" : "Kucoin";
    case "xdai":
      return useNewChainNames ? "Gnosis" : "xDai";
    case "cosmos":
      return useNewChainNames ? "CosmosHub" : "Cosmos";
    case "avax":
      return "Avalanche";
    case "xdaiarb":
      return "XdaiArb";
    case "okexchain":
      return "OKExChain";
    case "defichain":
      return "DefiChain";
    case "stacks":
      return "Stacks";
    case "polynetwork":
      return "PolyNetwork";
    case "eos":
      return "EOS";
    case "neo":
      return "NEO";
    case "rsk":
      return "RSK";
    case "iotex":
      return "IoTeX";
    case "thundercore":
      return "ThunderCore";
    case "telos":
      return "Telos";
    case "hpb":
      return "HPB";
    case "energyweb":
      return "EnergyWeb";
    case "gochain":
      return "GoChain";
    case "tomochain":
      return "TomoChain";
    case "fusion":
      return "Fusion";
    case "kardia":
      return "Kardia";
    case "fuse":
      return "Fuse";
    case "sora":
      return "SORA";
    case "smartbch":
      return "smartBCH";
    case "elastos":
      return "Elastos";
    case "hoo":
      return "Hoo";
    case "cronos":
      return "Cronos";
    case "polis":
      return "Polis";
    case "zyx":
      return "ZYX";
    case "elrond":
      return "Elrond";
    case "stellar":
      return "Stellar";
    case "shiden":
      return "Shiden";
    case "metis":
      return "Metis";
    case "ubiq":
      return "Ubiq";
    case "mixin":
      return "Mixin";
    case "everscale":
      return "Everscale";
    case "vechain":
      return "VeChain";
    case "xdc":
      return "XDC";
    case "velas":
      return "Velas";
    case "ethereumclassic":
      return "EthereumClassic";
    case "zksync":
      return "zkSync";
    case "godwoken":
      return "Godwoken";
    case "callisto":
      return "Callisto";
    case "csc":
      return "CSC";
    case "ergo":
      return "Ergo";
    case "parallel":
      return "Parallel";
    case "oasis":
      return "Oasis";
    case "theta":
      return "Theta";
    case "meter":
      return "Meter";
    case "syscoin":
      return "Syscoin";
    case "moonbeam":
      return "Moonbeam";
    case "astar":
      return "Astar";
    case "curio":
      return "Curio";
    case "skale":
      return "SKALE";
    case "bittorrent":
      return "Bittorrent";
    case "genshiro":
      return "Genshiro";
    case "wax":
      return "Wax";
    case "evmos":
      return "Evmos";
    case "proton":
      return "Proton";
    case "kadena":
      return "Kadena";
    case "vite":
      return "Vite";
    case "milkomeda":
      return "Milkomeda";
    case "dfk":
      return "DFK";
    case "omni":
      return "Omni";
    case "crab":
      return "Crab";
    case "statemine":
      return "Statemine";
    case "flow":
      return "Flow";
    case "hedera":
      return "Hedera";
    case "reinetwork":
      return "REINetwork";
    case "loopring":
      return "Loopring";
    case "aztec":
      return "Aztec";
    case "starknet":
      return "StarkNet";
    case "acala":
      return "Acala";
    case "terra":
      return "Terra Classic";
    case "sx":
      return "SXnetwork";
    case "heiko":
      return "Heiko";
    case "dogechain":
      return "Dogechain";
    case "canto":
      return "Canto";
    case "ripple":
      return "Ripple";
    case "arbitrum_nova":
      return "Arbitrum Nova";
    case "gravity_bridge":
      return "Gravity Bridge";
    case "kujira":
      return "Kujira";
    case "injective":
      return "Injective";
    case "crescent":
      return "Crescent";
    case "juno":
      return "Juno";
    case "stride":
      return "Stride";
    case "axelar":
      return "Axelar";
    case "zkSync Era":
      return "zkSync Era";
    case "sui":
      return "Sui";
    case "solana":
      return "Solana";
    default:
      return normalizedChain.slice(0, 1).toUpperCase() + normalizedChain.slice(1); // Capitalize first letter
  }
}

export function getDisplayChain(chains: string[]) {
  if (chains.length > 1) {
    return "Multi-Chain";
  } else {
    return chains[0];
  }
}
