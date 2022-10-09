import { Chain } from "@defillama/sdk/build/general";

export type BridgeNetwork = {
  id: number;
  displayName: string;
  bridgeDbName: string;
  largeTxThreshold: number;
  url: string;
  chains: string[];
  chainMapping?: {
    [chain: string]: Chain;
  }; // used when overwriting adapter key (adapter key is always the chain volume counts for, can be overwritten to query blocks/contracts on a different chain)
  destinationChain: string; // used to specify the destination chain when contracts on only 1 chain are tracked
};
