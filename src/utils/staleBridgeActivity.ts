type BridgeNetworkActivityConfig = {
  bridgeDbName: string;
  chains: string[];
  destinationChain?: string;
};

type BridgeDailyActivity = {
  bridgeName: string;
  chain: string;
  lastActiveDay: Date | null;
};

export const buildStaleBridgeActivity = (
  bridgeNetworks: BridgeNetworkActivityConfig[],
  activity: BridgeDailyActivity[],
  currentDate: Date
) => {
  const lastActiveDays = new Map(
    activity.map((entry) => [`${entry.bridgeName}:${entry.chain.toLowerCase()}`, entry.lastActiveDay])
  );

  return bridgeNetworks.flatMap((bridge) =>
    bridge.chains
      .filter((chain) => bridge.destinationChain !== chain)
      .map((chain) => {
        const lastActiveDay = lastActiveDays.get(`${bridge.bridgeDbName}:${chain.toLowerCase()}`);
        const staleDays = lastActiveDay
          ? Math.floor((currentDate.getTime() - lastActiveDay.getTime()) / (1000 * 60 * 60 * 24))
          : 7;
        return { bridge: bridge.bridgeDbName, chain, staleDays };
      })
  );
};
