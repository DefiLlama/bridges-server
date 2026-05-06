import { ethers } from "ethers";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { EventData } from "../../utils/types";

const BRIDGE_CONTRACT = "0x3100000000000000000000000000000000000002";

// Native cBTC on Citrea — same sentinel used by Garden's Citrea handler.
const CBTC_NATIVE = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

// Each Deposit / Withdrawal event represents a fixed peg amount.
// Confirmed on-chain: depositAmount() == 10e18 (10 cBTC, 18 decimals).
const PEG_AMOUNT_STR = "10000000000000000000";
const PEG_AMOUNT = ethers.BigNumber.from(PEG_AMOUNT_STR);

// We index the Citrea (L2) side, but the DefiLlama UI's "Deposited" / "Withdrawn"
// columns are read by users as bridge-flow direction (BTC → Citrea vs Citrea → BTC),
// not as bridge-contract-balance direction. So `isDeposit` here is set to match the
// contract event name (peg-in → Deposited, peg-out → Withdrawn), the opposite of
// what the strict "indexed-chain perspective" convention (e.g. usdt0) would give.
const depositParams: PartialContractEventParams = {
  target: BRIDGE_CONTRACT,
  topic: "Deposit(bytes32,bytes32,address,uint256,uint256)",
  abi: [
    "event Deposit(bytes32 wtxId, bytes32 txId, address recipient, uint256 timestamp, uint256 depositId)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "recipient",
  },
  fixedEventData: {
    from: BRIDGE_CONTRACT,
    token: CBTC_NATIVE,
    amount: PEG_AMOUNT as unknown as string,
  },
  isDeposit: true,
};

const withdrawalParams: PartialContractEventParams = {
  target: BRIDGE_CONTRACT,
  topic: "Withdrawal((bytes32,bytes4),uint256,uint256)",
  abi: [
    "event Withdrawal(tuple(bytes32 txId, bytes4 outputId) utxo, uint256 index, uint256 timestamp)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  txKeys: {
    from: "from",
  },
  fixedEventData: {
    to: BRIDGE_CONTRACT,
    token: CBTC_NATIVE,
    amount: PEG_AMOUNT as unknown as string,
  },
  isDeposit: false,
};

// `batchWithdraw` emits one Withdrawal event per UTXO. They share the same
// (txHash, from, to, token), which collides with the unique constraint on
// `bridges.transactions`. Sum the per-event amounts so each tx becomes a
// single row carrying the full batch volume.
const collapseBatches = (events: EventData[]): EventData[] => {
  const merged = new Map<string, EventData>();
  for (const e of events) {
    const key = `${e.txHash}|${e.isDeposit}|${e.from}|${e.to}|${e.token}`;
    const existing = merged.get(key);
    if (existing) {
      existing.amount = existing.amount.add(e.amount);
    } else {
      merged.set(key, { ...e });
    }
  }
  return [...merged.values()];
};

const getCitreaEvents = async (fromBlock: number, toBlock: number): Promise<EventData[]> => {
  const events = await getTxDataFromEVMEventLogs("clementine", "citrea", fromBlock, toBlock, [
    depositParams,
    withdrawalParams,
  ]);
  return collapseBatches(events);
};

const adapter: BridgeAdapter = {
  citrea: getCitreaEvents,
};

export default adapter;
