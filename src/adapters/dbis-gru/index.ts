/**
 * DBIS GRU cross-chain bridge (c* hub on Chain 138 ↔ cW* on public EVM chains).
 * AUTO-GENERATED — scripts/defillama/generate-bridges-server-dbis-gru.py
 */
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const L1_BRIDGE = "0x152ed3e9912161b76bdfd368d0c84b7c31c10de7";
const L2_BRIDGE = "0x2bF74583206A49Be07E0E8A94197C12987AbD7B5";

const hubLocked: PartialContractEventParams = {
  target: L1_BRIDGE,
  topic: "Locked(address,address,uint256)",
  abi: ["event Locked(address indexed canonicalToken, address indexed user, uint256 amount)"],
  isDeposit: true,
  logKeys: { blockNumber: "blockNumber", txHash: "transactionHash" },
  argKeys: { token: "canonicalToken", from: "user", amount: "amount" },
  fixedEventData: { to: L1_BRIDGE },
  chain: "dfio_meta_main" as any,
};

const hubReleased: PartialContractEventParams = {
  target: L1_BRIDGE,
  topic: "Released(address,address,uint256)",
  abi: ["event Released(address indexed canonicalToken, address indexed recipient, uint256 amount)"],
  isDeposit: false,
  logKeys: { blockNumber: "blockNumber", txHash: "transactionHash" },
  argKeys: { token: "canonicalToken", to: "recipient", amount: "amount" },
  fixedEventData: { from: L1_BRIDGE },
  chain: "dfio_meta_main" as any,
};

const l2Minted: PartialContractEventParams = {
  target: L2_BRIDGE,
  topic: "Minted(address,address,address,uint256)",
  abi: [
    "event Minted(address indexed canonicalToken, address indexed mirroredToken, address indexed recipient, uint256 amount)",
  ],
  isDeposit: false,
  logKeys: { blockNumber: "blockNumber", txHash: "transactionHash" },
  argKeys: { token: "mirroredToken", to: "recipient", amount: "amount" },
  fixedEventData: { from: L2_BRIDGE },
};

const l2Burned: PartialContractEventParams = {
  target: L2_BRIDGE,
  topic: "Burned(address,address,address,uint256)",
  abi: [
    "event Burned(address indexed canonicalToken, address indexed mirroredToken, address indexed user, uint256 amount)",
  ],
  isDeposit: true,
  logKeys: { blockNumber: "blockNumber", txHash: "transactionHash" },
  argKeys: { token: "mirroredToken", from: "user", amount: "amount" },
  fixedEventData: { to: L2_BRIDGE },
};

const adapter: BridgeAdapter = {
  defi_oracle_meta: async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("dbis-gru", "dfio_meta_main" as any, fromBlock, toBlock, [hubLocked, hubReleased]),
  ethereum: async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("dbis-gru", "ethereum", fromBlock, toBlock, [l2Minted, l2Burned]),
};

export default adapter;
