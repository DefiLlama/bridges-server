export const bridgesToSkip = [
  "across",
  "wormhole",
  "layerzero",
  "hyperlane",
  "intersoon",
  "relay",
  "cashmere",
  "teleswap",
  "mayan",
  "ccip",
];

export const shouldSkipBridge = (bridgeDbName: string) => bridgesToSkip.includes(bridgeDbName);

export const shouldSkipScheduledBridge = (bridgeDbName: string, env: NodeJS.ProcessEnv = process.env) =>
  shouldSkipBridge(bridgeDbName) || (bridgeDbName === "1sec" && !env.ONESEC_API_BASE_URL);
