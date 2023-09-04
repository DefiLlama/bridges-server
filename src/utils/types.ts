import { ethers } from "ethers";

type EventKeys = "blockNumber" | "txHash" | "from" | "to" | "token" | "amount";

export type EventData = {
  blockNumber: number;
  txHash: string;
  from: string;
  to: string;
  token: string;
  amount: ethers.BigNumber;
  isDeposit: boolean;
  chainOverride?: string; // used to insert tx using bridgeID from same bridgeNetwork but a different chain
  isUSDVolume?: boolean; // used to insert tx without specifying any token, only a USD value
  txsCountedAs?: number; // used to insert tx and have it count as multiple txs (only affects transaction counts in hourly/daily aggregated entries)
};

export type EventKeyMapping = {
  [key in EventKeys]?: string;
};

export type RecordedBlocksFromAWS = {
  [adapterDbNameChain: string]: {
    startBlock: number;
    endBlock: number;
  };
};

export type RecordedBlocks = {
  startBlock: number;
  endBlock: number;
};
