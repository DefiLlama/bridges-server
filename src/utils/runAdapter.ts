import { getEVMLogs } from "../helpers/processTransactions";
import { EventData } from "./types";

export async function runAdapter({ fromBlock, toBlock, adapterChainEventsFn, chain}: {
  fromBlock: number;
  toBlock: number;
  adapterChainEventsFn: Function;
  chain: string;
}): Promise<EventData[]> {
  const v2Params = {
    fromBlock,
    toBlock,
    chain,
    getLogs: (args: Parameters<typeof getEVMLogs>[0]) => getEVMLogs({ chain, ...args, fromBlock, toBlock }),
  }
  return adapterChainEventsFn(fromBlock, toBlock, v2Params);
}

export default runAdapter;