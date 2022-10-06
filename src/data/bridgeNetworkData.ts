import type { BridgeNetwork } from "./types";

export default [
  {
    id: 1,
    displayName: "Polygon PoS Bridge",
    bridgeDbName: "polygon",
    largeTxThreshold: 10000,
    url: "",
    chains: ["polygon"],
    chainMapping: {
      polygon: "ethereum",
    },
  },
  {
    id: 2,
    displayName: "Arbitrum Bridge",
    bridgeDbName: "arbitrum",
    largeTxThreshold: 10000,
    url: "",
    chains: ["arbitrum"],
    chainMapping: {
      arbitrum: "ethereum",
    },
  },
  {
    id: 3,
    displayName: "Avalanche Bridge",
    bridgeDbName: "avalanche",
    largeTxThreshold: 10000,
    url: "",
    chains: ["avalanche"],
    chainMapping: {
      avax: "ethereum",
    },
  },
  {
    id: 4,
    displayName: "Optimism Gateway",
    bridgeDbName: "optimism",
    largeTxThreshold: 10000,
    url: "",
    chains: ["optimism"],
    chainMapping: {
      optimism: "ethereum",
    },
  },
  {
    id: 5,
    displayName: "Multichain",
    bridgeDbName: "multichain",
    largeTxThreshold: 10000,
    url: "",
    chains: ["ethereum"],
    chainMapping: {
    },
  },
] as BridgeNetwork[];
