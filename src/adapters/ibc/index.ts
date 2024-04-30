import { BridgeNetwork } from "../../data/types";
import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { 
  ChainFromMapOfZones, 
  getBlockFromTimestamp, 
  getIbcVolumeByZoneId, 
  getSupportedChains,
  getLatestBlockForZone
} from "../../helpers/mapofzones";


export const getLatestBlockForZoneFromMoz = async (zoneId: string): Promise<{
  number: number;
  timestamp: number;
}> => {
  const block = await getLatestBlockForZone(zoneId);
  if (!block) {
    throw new Error(`No block found for zone ${zoneId}`);
  }
  return {
    number: block.block,
    timestamp: block.timestamp,
  };
}

export const findChainIdFromChainName = (bridgeNetwork: BridgeNetwork, chainName: string) => {
  if (bridgeNetwork.chainMapping === undefined) {
    throw new Error("Chain mapping is undefined for ibc bridge network.");
  }

  for(const key of Object.keys(bridgeNetwork.chainMapping)) {
    if(key.toLowerCase() === chainName.toLowerCase()) {
      return bridgeNetwork.chainMapping[key];
    }
  }
}

export const newIBCBridgeNetwork = async(bridgeNetwork: BridgeNetwork) => {
  const chains = await supportedChainsFromMoz();

  bridgeNetwork.chains = chains.map((chain) => chain.zone_name);
  const chainMapping: { [key: string]: string } = chains.reduce<{ [key: string]: string }>((acc, chain) => {
    acc[chain.zone_name] = chain.zone_id;
    return acc;
  }, {});

  bridgeNetwork.chainMapping = chainMapping;

  return bridgeNetwork;
}

export const ibcGetBlockFromTimestamp = async (bridge: BridgeNetwork, timestamp: number, chainName: string, position?: 'First' | 'Last') => {
  if(position === undefined) {
    throw new Error("Position is required for ibcGetBlockFromTimestamp");
  }
  const chainId = findChainIdFromChainName(bridge, chainName);
  if(chainId === undefined) {
    throw new Error(`Could not find chain id for chain name ${chainName}`);
  }
  return await getBlockFromTimestamp(timestamp, chainId, position);
}

export const excludedChains: string[] = []

export const supportedChainsFromMoz = async (): Promise<ChainFromMapOfZones[]> => {
  return getSupportedChains().then((chains) => {
    return chains.filter((chain) => [chain.zone_id, chain.zone_name].every((x) => !excludedChains.includes(x)));
  });
}

const chainExports = (ibcBridgeNetwork: BridgeNetwork) => {
  const chainNames = ibcBridgeNetwork.chains;

  const chainBreakdown = {} as BridgeAdapter;
  chainNames.forEach((chainName) => {
    const chainId = findChainIdFromChainName(ibcBridgeNetwork, chainName);
    if(chainId) {
      chainBreakdown[chainName.toLowerCase()] = getIbcVolumeByZoneId(chainId);
    }
  });
  return chainBreakdown;
};

const adapter: BridgeAdapter = {} as BridgeAdapter;

export const newIBCAdapter = (ibcBridgeNetwork: BridgeNetwork) => {
  if (ibcBridgeNetwork.chainMapping === undefined) {
    throw new Error("Chain mapping is undefined for ibc bridge network.");
  }

  return chainExports(ibcBridgeNetwork);
}

export default adapter;
