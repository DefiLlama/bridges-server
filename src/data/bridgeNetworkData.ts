import type { BridgeNetwork } from "./types";

// FIX need to control chain naming here
export default [
  {
    id: 1,
    displayName: "Polygon PoS Bridge",
    bridgeDbName: "polygon",
    iconLink: "chain:polygon",
    largeTxThreshold: 10000,
    url: "",
    chains: ["Ethereum", "Polygon"],
    destinationChain: "Polygon",
  },
  {
    id: 2,
    displayName: "Arbitrum Bridge",
    bridgeDbName: "arbitrum",
    iconLink: "chain:arbitrum",
    largeTxThreshold: 10000,
    url: "",
    chains: ["Ethereum", "Arbitrum"],
    destinationChain: "Arbitrum",
  },
  {
    id: 3,
    displayName: "Avalanche Bridge",
    bridgeDbName: "avalanche",
    iconLink: "chain:avalanche",
    largeTxThreshold: 10000,
    url: "",
    chains: ["Ethereum", "Avalanche"],
    destinationChain: "Avalanche",
  },
  {
    id: 4,
    displayName: "Optimism Gateway",
    bridgeDbName: "optimism",
    iconLink: "chain:optimism",
    largeTxThreshold: 10000,
    url: "",
    chains: ["Ethereum", "Optimism"],
  },
  {
    id: 5,
    displayName: "Multichain",
    bridgeDbName: "multichain",
    iconLink: "icons:multichain",
    largeTxThreshold: 10000,
    url: "",
    chains: [
      "Ethereum",
      "Polygon",
      "Fantom",
      "Avalanche",
      "Arbitrum",
      "Optimism",
      "Gnosis",
      // "BSC"
    ],
    chainMapping: {
      avalanche: "avax", // this is needed temporarily, need to fix and remove
      gnosis: "xdai",
    },
  },
  {
    id: 6,
    displayName: "Poly Network",
    bridgeDbName: "polynetwork",
    iconLink: "icons:poly-network",
    largeTxThreshold: 10000,
    url: "",
    chains: [
      "Ethereum",
      "Polygon",
      "Fantom",
      "Avalanche",
      "Arbitrum",
      "Optimism",
      "Gnosis",
      // "BSC"
    ],
    chainMapping: {
      avalanche: "avax",
      gnosis: "xdai",
    },
  },
  {
    id: 7,
    displayName: "Orbit Bridge",
    bridgeDbName: "orbitbridge",
    iconLink: "icons:orbit-bridge",
    largeTxThreshold: 10000,
    url: "",
    chains: [
      "Ethereum",
      "Polygon",
      "Fantom",
      "Avalanche",
      // "BSC"
    ],
    chainMapping: {
      avalanche: "avax",
      gnosis: "xdai",
    },
  },
  {
    id: 8,
    displayName: "ChainPort",
    bridgeDbName: "chainport",
    iconLink: "icons:chainport",
    largeTxThreshold: 10000,
    url: "",
    chains: [
      "Ethereum",
      "Polygon",
      "Fantom",
      "Avalanche",
      "Aurora",
      // "BSC"
    ],
    chainMapping: {
      avalanche: "avax",
    },
  },
  {
    id: 9,
    displayName: "Portal by Wormhole",
    bridgeDbName: "portal",
    iconLink: "icons:portal",
    largeTxThreshold: 10000,
    url: "",
    chains: [
      "Ethereum",
      "Polygon",
      "Fantom",
      "Avalanche",
      "Aurora",
      // "BSC"
    ],
    chainMapping: {
      avalanche: "avax", // this is needed temporarily, need to fix and remove
    },
  },
  {
    id: 10,
    displayName: "Celer cBridge",
    bridgeDbName: "celer",
    iconLink: "icons:cbridge",
    largeTxThreshold: 10000,
    url: "",
    chains: [
      "Ethereum",
      "Polygon",
      "Fantom",
      "Avalanche",
      "Arbitrum",
      "Optimism",
      "Gnosis",
      "Aurora",
      // "BSC"
    ],
    chainMapping: {
      avalanche: "avax",
      gnosis: "xdai",
    },
  },
  {
    id: 11,
    displayName: "Synapse",
    bridgeDbName: "synapse",
    iconLink: "icons:synapse",
    largeTxThreshold: 10000,
    url: "",
    chains: [
      "Ethereum",
      "Polygon",
      "Fantom",
      "Avalanche",
      "Arbitrum",
      "Optimism",
      "Aurora",
      // "BSC"
    ],
    chainMapping: {
      avalanche: "avax",
    },
  },
  {
    id: 12,
    displayName: "Stargate",
    bridgeDbName: "stargate",
    iconLink: "icons:stargate",
    largeTxThreshold: 10000,
    url: "",
    chains: [
      "Ethereum",
      "Polygon",
      "Fantom",
      "Avalanche",
      "Arbitrum",
      "Optimism",
      // "BSC"
    ],
    chainMapping: {
      avalanche: "avax", // this is needed temporarily, need to fix and remove
    },
  },
  {
    id: 13,
    displayName: "Hop",
    bridgeDbName: "hop",
    iconLink: "icons:hop-protocol",
    largeTxThreshold: 10000,
    url: "",
    chains: ["Ethereum", "Polygon", "Arbitrum", "Optimism", "Gnosis"],
    chainMapping: {
      gnosis: "xdai", // this is needed temporarily, need to fix and remove
    },
  },
  /*
  {
    id: 14,
    displayName: "Binance Issued",
    bridgeDbName: "bsc",
    iconLink: "",
    largeTxThreshold: 10000,
    url: "",
    chains: ["Ethereum", "BSC"],
    destinationChain: "Ethereum",
  },
  */
  {
    id: 15,
    displayName: "Core Bitcoin Bridge",
    bridgeDbName: "avalanche-btc",
    iconLink: "chain:avalanche",
    largeTxThreshold: 10000,
    url: "",
    chains: ["Avalanche"],
    destinationChain: "-", // not sure the effect this will have, need to double-check everything works
    chainMapping: {
      avalanche: "avax", // this is needed temporarily, need to fix and remove
    },
  },
  {
    id: 16,
    displayName: "xDai Bridge",
    bridgeDbName: "xdai",
    iconLink: "chain:xdai",
    largeTxThreshold: 10000,
    url: "",
    chains: ["Ethereum", "Gnosis"],
    destinationChain: "Gnosis",
    chainMapping: {
      gnosis: "xdai", // this is needed temporarily, need to fix and remove
    },
  },
  /*
  {
    id: 17,
    displayName: "Axelar",
    bridgeDbName: "axelar",
    iconLink: "icons:axelar",
    largeTxThreshold: 10000,
    url: "",
    chains: [
      "Ethereum",
      "Polygon",
      "Avalanche", 
      //"BSC",
      "Fantom",
      "Aurora",
    ],
    chainMapping: {
      avalanche: "avax", // this is needed temporarily, need to fix and remove
    },
  },
  */
  {
    id: 18,
    displayName: "Rainbow Bridge",
    bridgeDbName: "rainbowbridge",
    iconLink: "chain:aurora",
    largeTxThreshold: 10000,
    url: "",
    chains: ["Ethereum", "Aurora"],
    destinationChain: "Aurora",
  },
  {
    id: 19,
    displayName: "Across",
    bridgeDbName: "across",
    iconLink: "icons:across",
    largeTxThreshold: 10000,
    url: "",
    chains: ["Ethereum", "Polygon", "Arbitrum", "Optimism"],
  },
  /*
  {
    id: 20,
    displayName: "deBridge",
    bridgeDbName: "debridge",
    iconLink: "icons:debridge",
    largeTxThreshold: 10000,
    url: "",
    chains: [
      "Ethereum",
      "Polygon",
      "Arbitrum",
      "Avalanche",
      //BSC
    ],
    chainMapping: {
      avalanche: "avax", // this is needed temporarily, need to fix and remove
    },
  },
  */
  {
    id: 21,
    displayName: "Optics",
    bridgeDbName: "optics",
    iconLink: "chains:celo",
    largeTxThreshold: 10000,
    url: "",
    chains: ["Ethereum", "Polygon", "Celo"],
  },
] as BridgeNetwork[];
