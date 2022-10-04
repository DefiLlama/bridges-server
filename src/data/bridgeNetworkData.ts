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
      polygon: "ethereum"
    }
  },
  /*
  {
    id: 2,
    displayName: "Arbitrum Bridge",
    bridgeDbName: "arbitrum",
    largeTxThreshold: 10000,
    url: "",
    chains: ["arbitrum"],
    chainMapping: {
      arbitrum: "ethereum"
    }
  },
  {
    id: 3,
    displayName: "Synapse",
    bridgeDbName: "synapse",
  },
  {
    id: 4,
    displayName: "Hop",
    bridgeDbName: "hop",
  },
  */
] as BridgeNetwork[];
