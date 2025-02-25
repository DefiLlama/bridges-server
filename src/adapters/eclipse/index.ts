import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

// 0x2B08D7cF7EafF0f5f6623d9fB09b080726D4be11 is Eclipse Canonical Bridge

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const depositEventParams: PartialContractEventParams = {
  target: "0x2B08D7cF7EafF0f5f6623d9fB09b080726D4be11",
  topic: "Deposited(address,bytes32,uint256,uint256)",
  abi: [
    "event Deposited(address indexed sender, bytes32 indexed recipient, uint256 amountWei, uint256 amountLamports)",
  ],
  argKeys: {
    from: "sender",
    to: "recipient",
    amount: "amountWei",
  },
  fixedEventData: {
    token: WETH,
  },
  isDeposit: true,
};

const withdrawalEventParams: PartialContractEventParams = {
  target: "0x2B08D7cF7EafF0f5f6623d9fB09b080726D4be11",
  topic: "WithdrawClaimed(address,bytes32,bytes32,WithdrawMessage)",
  abi: [
    "event WithdrawClaimed(address indexed receiver, bytes32 indexed remoteSender, bytes32 indexed messageHash, tuple(bytes32 from, address destination, uint256 amountWei, uint64 withdrawId, address feeReceiver, uint256 feeWei) message)",
  ],
  argKeys: {
    from: "remoteSender",
    to: "receiver",
    amount: "message.amountWei",
  },
  fixedEventData: {
    token: WETH,
  },
  isDeposit: false,
};

const constructParams = () => {
  const eventParams = [depositEventParams, withdrawalEventParams];
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("eclipse", "ethereum", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
