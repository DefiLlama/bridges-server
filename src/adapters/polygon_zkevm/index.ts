import { BridgeAdapter, ContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { getLogs } from "@defillama/sdk/build/util";
import { ethers } from "ethers";
import { EventData } from "../../utils/types";

const BRIDGES_ADDRESS = "0x2a3DD3EB832aF982ec71669E178424b10Dca2EDe";

// This is the Agglayer unified bridge, shared by every connected network. Polygon zkEVM is network 1
// (RollupManager rollupIDToRollupData(1) has chainID 1101); flows to and from the other networks
// (Katana, X Layer, ...) are tracked by the agglayer adapter.
const ZKEVM_NETWORK_ID = 1;

const etherDepositEventParams: ContractEventParams = {
  target: BRIDGES_ADDRESS,
  topic: "BridgeEvent(uint8,uint32,address,uint32,address,uint256,bytes,uint32)",
  abi: [
    `event BridgeEvent(uint8 leafType, uint32 originNetwork, address originAddress, uint32 destinationNetwork, address destinationAddress, uint256 amount, bytes metadata, uint32 depositCount)`,
  ],
  argKeys: {
    from: "destinationAddress",
    amount: "amount",
    token: "originAddress",
  },
  filter: {
    includeArg: [{ destinationNetwork: ZKEVM_NETWORK_ID as unknown as string }],
  },
  isDeposit: true,
};

// Claims before the bridge upgrade to the unified (v2) bridge, when zkEVM was the only network.
const etherWithdrawEventParamsV1: ContractEventParams = {
  target: BRIDGES_ADDRESS,
  topic: "ClaimEvent(uint32,uint32,address,address,uint256)",
  abi: [
    `event ClaimEvent(uint32 index, uint32 originNetwork, address originAddress, address destinationAddress, uint256 amount)`,
  ],
  argKeys: {
    to: "destinationAddress",
    amount: "amount",
    token: "originAddress",
  },
  fixedEventData: {
    from: BRIDGES_ADDRESS,
  },
  isDeposit: false,
};

// Unified bridge claims carry the source network in globalIndex: bit 64 is the mainnet flag and bits
// 32-63 the rollup index (network id - 1). A zkEVM exit has mainnet flag 0 and rollup index 0, i.e.
// globalIndex < 2^32. includeArg can only test equality, so these are filtered here.
const claimV2Abi =
  "event ClaimEvent(uint256 globalIndex, uint32 originNetwork, address originAddress, address destinationAddress, uint256 amount)";
const claimV2Iface = new ethers.utils.Interface([claimV2Abi]);
const claimV2Topic = claimV2Iface.getEventTopic("ClaimEvent");

const getZkevmClaims = async (fromBlock: number, toBlock: number): Promise<EventData[]> => {
  const logs = (
    await getLogs({
      target: BRIDGES_ADDRESS,
      topic: "",
      keys: [],
      fromBlock,
      toBlock,
      topics: [claimV2Topic],
      chain: "ethereum",
    })
  ).output;
  const events: EventData[] = [];
  for (const log of logs as any[]) {
    const args = claimV2Iface.parseLog(log).args;
    if (!ethers.BigNumber.from(args.globalIndex).lt(ethers.BigNumber.from(2).pow(32))) continue;
    events.push({
      blockNumber: Number(log.blockNumber),
      txHash: log.transactionHash,
      from: BRIDGES_ADDRESS,
      to: args.destinationAddress,
      token: args.originAddress,
      amount: args.amount,
      isDeposit: false,
    });
  }
  return events;
};

const constructParams = () => {
  const eventParams = [etherDepositEventParams, etherWithdrawEventParamsV1];
  return async (fromBlock: number, toBlock: number) => {
    const [events, claims] = await Promise.all([
      getTxDataFromEVMEventLogs("polygonzk", "ethereum", fromBlock, toBlock, eventParams),
      getZkevmClaims(fromBlock, toBlock),
    ]);
    return [...events, ...claims];
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
