import type { BridgeNetwork } from "./types";

// FIX need to control chain naming here
export default [
  {
    id: 1,
    displayName: "Polygon PoS Bridge",
    bridgeDbName: "polygon",
    largeTxThreshold: 10000,
    url: "",
    chains: ["Ethereum", "Polygon"],
    destinationChain: "Polygon",
  },
  {
    id: 2,
    displayName: "Arbitrum Bridge",
    bridgeDbName: "arbitrum",
    largeTxThreshold: 10000,
    url: "",
    chains: ["Ethereum", "Arbitrum"],
    destinationChain: "Arbitrum",
  },
  {
    id: 3,
    displayName: "Avalanche Bridge",
    bridgeDbName: "avalanche",
    largeTxThreshold: 10000,
    url: "",
    chains: ["Ethereum", "Avalanche"],
    destinationChain: "Avalanche",
  },
  {
    id: 4,
    displayName: "Optimism Gateway",
    bridgeDbName: "optimism",
    largeTxThreshold: 10000,
    url: "",
    chains: ["Ethereum", "Optimism"],
  },
 /*
  {
    id: 5,
    displayName: "Multichain",
    bridgeDbName: "multichain",
    largeTxThreshold: 10000,
    url: "",
    chains: ["Ethereum", "Polygon", "Fantom", "Avalanche", "BSC", "Arbitrum"],
  },
  */
  /*
  {
    id: 6,
    displayName: "Celer",
    bridgeDbName: "celer",
    largeTxThreshold: 10000,
    url: "",
    chains: ["ethereum", "polygon", "fantom", "avax", "bsc", "arbitrum"],
  },
  */
] as BridgeNetwork[];
