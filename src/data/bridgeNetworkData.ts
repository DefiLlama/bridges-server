import type { BridgeNetwork } from "./types";

export default [
  {
    id: 1,
    displayName: "Polygon PoS Bridge",
    bridgeDbName: "polygon",
    largeTxThreshold: 10000,
    url: "",
    chains: ["ethereum", "polygon"],
  },
  {
    id: 2,
    displayName: "Arbitrum Bridge",
    bridgeDbName: "arbitrum",
    largeTxThreshold: 10000,
    url: "",
    chains: ["ethereum", "arbitrum"],
  },
  {
    id: 3,
    displayName: "Avalanche Bridge",
    bridgeDbName: "avalanche",
    largeTxThreshold: 10000,
    url: "",
    chains: ["ethereum", "avax"],
  },
  {
    id: 4,
    displayName: "Optimism Gateway",
    bridgeDbName: "optimism",
    largeTxThreshold: 10000,
    url: "",
    chains: ["ethereum", "optimism"],
  },
  {
    id: 5,
    displayName: "Multichain",
    bridgeDbName: "multichain",
    largeTxThreshold: 10000,
    url: "",
    chains: ["ethereum", "polygon", "fantom", "avax", "bsc", "arbitrum"],
  },
  {
    id: 6,
    displayName: "Celer",
    bridgeDbName: "celer",
    largeTxThreshold: 10000,
    url: "",
    chains: ["ethereum", "polygon", "fantom", "avax", "bsc", "arbitrum"],
  },
] as BridgeNetwork[];
