import { BridgeAdapter, ContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

/*
Rainbow Bridge is between Ethereum, Aurora, and Near.
On Ethereum side, txs are simple, though I cannot figure out the destination chain.
On Aurora side, there is no bridge contract or transactions, account is simply credited upon bridging (since Aurora is a smart contract).
On Near side, I don't know how explorer works, its helper can make calls, but I don't know how to even view or find contracts.

Just treating it like a 1-sided bridge to Aurora for now, it will only become an issue once Near is added.
*/

const depositEventParams: ContractEventParams = {
  target: "0x23Ddd3e3692d1861Ed57EDE224608875809e127f",
  topic: "Locked(address,address,uint256,string)",
  abi: ["event Locked(address indexed token, address indexed sender, uint256 amount, string accountId)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    from: "sender",
    amount: "amount",
  },
  fixedEventData: {
    to: "0x23Ddd3e3692d1861Ed57EDE224608875809e127f",
  },
  isDeposit: true,
};

const withdrawalEventParams: ContractEventParams = {
  target: "0x23Ddd3e3692d1861Ed57EDE224608875809e127f",
  topic: "Unlocked(uint128,address)",
  abi: ["event Unlocked(uint128 amount, address recipient)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "recipient",
    amount: "amount",
  },
  fixedEventData: {
    from: "0x23Ddd3e3692d1861Ed57EDE224608875809e127f",
  },
  getTokenFromReceipt: {
    token: true,
  },
  isDeposit: false,
};

const constructParams = () => {
  const eventParams = [depositEventParams, withdrawalEventParams];
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("rainbowbridge", "ethereum", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
