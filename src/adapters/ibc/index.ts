import { BridgeNetwork } from "../../data/types";
import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { getBlockFromTimestamp, getIbcVolumeByZoneId, getLatestBlockForZone } from "../../helpers/mapofzones";
import bridges from "../../data/bridgeNetworkData";
import { LatestBlockNotFoundError } from "./errors";

const ibcBridgeNetwork = bridges.find((bridge) => bridge.bridgeDbName === "ibc");

export const getLatestBlockForZoneFromMoz = async (
  zoneId: string,
  signal?: AbortSignal
): Promise<{
  number: number;
  timestamp: number;
}> => {
  const block = await getLatestBlockForZone(zoneId, signal);
  if (!block) {
    throw new LatestBlockNotFoundError(zoneId);
  }
  return {
    number: block.block,
    timestamp: block.timestamp,
  };
};

// this returns height only
export const getLatestBlockHeightForZoneFromMoz = async (zoneId: string, signal?: AbortSignal): Promise<number> => {
  const block = await getLatestBlockForZone(zoneId, signal);
  if (!block) {
    throw new LatestBlockNotFoundError(zoneId);
  }
  return block.block;
};

export const findChainId = (bridgeNetwork: BridgeNetwork, chain: string) => {
  if (bridgeNetwork.chainMapping === undefined) {
    throw new Error("Chain mapping is undefined for ibc bridge network.");
  }

  if (bridgeNetwork.chainMapping[chain]) {
    return bridgeNetwork.chainMapping[chain];
  } else if (Object.values(bridgeNetwork.chainMapping).includes(chain)) {
    return chain;
  }
};

export const ibcGetBlockFromTimestamp = async (
  bridge: BridgeNetwork,
  timestamp: number,
  chainName: string,
  position?: "First" | "Last",
  signal?: AbortSignal
) => {
  if (position === undefined) {
    throw new Error("Position is required for ibcGetBlockFromTimestamp");
  }
  const chainId = findChainId(bridge, chainName);
  if (chainId === undefined) {
    throw new Error(`Could not find chain id for chain name ${chainName}`);
  }
  return await getBlockFromTimestamp(timestamp, chainId, position, signal);
};

const chainExports = () => {
  if (ibcBridgeNetwork === undefined) {
    throw new Error("Could not find ibc bridge network.");
  }

  const chainNames = ibcBridgeNetwork.chains;

  const chainBreakdown = {} as BridgeAdapter;
  chainNames.forEach((chainName) => {
    const chainId = findChainId(ibcBridgeNetwork, chainName);
    if (chainId) {
      chainBreakdown[chainName.toLowerCase()] = getIbcVolumeByZoneId(chainId);
    }
  });
  return chainBreakdown;
};

const adapter: BridgeAdapter = chainExports();

export default adapter;
