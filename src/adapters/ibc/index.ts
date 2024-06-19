import retry from "async-retry"
import axios from "axios";

import { BridgeNetwork } from "../../data/types";
import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { 
  getBlockFromTimestamp, 
  getIbcVolumeByZoneId, 
  getLatestBlockForZone,
} from "../../helpers/mapofzones";
import bridges from "../../data/bridgeNetworkData";

const ibcBridgeNetwork = bridges.find((bridge) => bridge.bridgeDbName === "ibc");
const DEFILLAMA_LATEST_BLOCK_URL = "https://llama-bridges-data.s3.eu-central-1.amazonaws.com/lastRecordedBlocks.json";

export const getBlockToStartFromDefillama = async (bridge: BridgeNetwork, chain: string, timestamp: number): Promise<{
  block: number;
} | undefined> => {
  const response = await retry(async (_bail) => await axios.get(
    DEFILLAMA_LATEST_BLOCK_URL
  ))

  const data = await response.data;

  if (!data) {
    console.log(`Failed to fetch latest block for ${chain}`);
    return undefined;
  }

  const chainName = findChainName(bridge, chain);

  const block = data[`ibc-${chainName}`];

  if (block) {
    return {
      block: block.endBlock + 1,
    };
  }
  // for new chains may be they have not been added to defillama yet
  // fallback to the timestamp
  const blockFromTimestamp = await ibcGetBlockFromTimestamp(bridge, timestamp, chain, 'First');
  if (!blockFromTimestamp) {
    console.log(`Could not find block for ${chain} from timestamp ${timestamp}`);
    return undefined;
  }

  return {
    block: blockFromTimestamp.block,
  };

}

export const getLatestBlockForZoneFromMoz = async (zoneId: string): Promise<{
  number: number;
  timestamp: number;
}> => {
  const block = await getLatestBlockForZone(zoneId);
  if (!block) {
    throw new LatestBlockNotFoundError(zoneId);
  }
  return {
    number: block.block,
    timestamp: block.timestamp,
  };
}

// this returns height only
export const getLatestBlockHeightForZoneFromMoz = async (zoneId: string): Promise<number> => {
  const block = await getLatestBlockForZone(zoneId);
  if (!block) {
    throw new LatestBlockNotFoundError(zoneId);
  }
  return block.block;
}

export const findChainId = (bridgeNetwork: BridgeNetwork, chain: string) => {
  if (bridgeNetwork.chainMapping === undefined) {
    throw new Error("Chain mapping is undefined for ibc bridge network.");
  }

  if (bridgeNetwork.chainMapping[chain]) {
    return bridgeNetwork.chainMapping[chain];
  } else if (Object.values(bridgeNetwork.chainMapping).includes(chain)) {
    return chain;
  }
}

export const findChainName = (bridgeNetwork: BridgeNetwork, chainId: string) => {
  if (bridgeNetwork.chainMapping === undefined) {
    throw new Error("Chain mapping is undefined for ibc bridge network.");
  }

  for (const [key, value] of Object.entries(bridgeNetwork.chainMapping)) {
    if (value === chainId) {
      return key;
    }
  }
}

export const ibcGetBlockFromTimestamp = async (bridge: BridgeNetwork, timestamp: number, chainName: string, position?: 'First' | 'Last') => {
  if(position === undefined) {
    throw new Error("Position is required for ibcGetBlockFromTimestamp");
  }
  const chainId = findChainId(bridge, chainName);
  if(chainId === undefined) {
    throw new Error(`Could not find chain id for chain name ${chainName}`);
  }
  return await getBlockFromTimestamp(timestamp, chainId, position);
}

const chainExports = () => {
  if (ibcBridgeNetwork === undefined) {
    throw new Error("Could not find ibc bridge network.");
  }

  const chainNames = ibcBridgeNetwork.chains;

  const chainBreakdown = {} as BridgeAdapter;
  chainNames.forEach((chainName) => {
    const chainId = findChainId(ibcBridgeNetwork, chainName);
    if(chainId) {
      chainBreakdown[chainName.toLowerCase()] = getIbcVolumeByZoneId(chainId);
    }
  });
  return chainBreakdown;
};

const adapter: BridgeAdapter = chainExports();

export default adapter;
