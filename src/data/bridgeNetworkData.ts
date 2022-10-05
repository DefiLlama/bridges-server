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
    displayName: "Multichain: Fantom Bridge",
    bridgeDbName: "fantom",
    largeTxThreshold: 10000,
    url: "",
    chains: ["fantom"],
    chainMapping: {
      fantom: "ethereum",
    },
  },
  /*
  {
    id: 5,
    displayName: "Synapse",
    bridgeDbName: "synapse",
  },
  {
    id: 6,
    displayName: "Hop",
    bridgeDbName: "hop",
  },
  */
] as BridgeNetwork[];
