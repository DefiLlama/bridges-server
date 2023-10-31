import { BridgeAdapter, ContractEventParams, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";

// 0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016 is Gnosis Chain: xDai Bridge
// 0x88ad09518695c6c3712AC10a214bE5109a655671 is Gnosis Chain: Omni Bridge

const daiDepositParams = constructTransferParams("0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016", true);
const daiWithdrawalParams: PartialContractEventParams = constructTransferParams(
  "0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016",
  false,
  {
    excludeTo: ["0x83F20F44975D03b1b09e64809B757c47f942BEeA"], //sDAI
  }
);

const omniDepositEventParams: ContractEventParams = {
  target: "0x88ad09518695c6c3712AC10a214bE5109a655671",
  topic: "TokensBridgingInitiated(address,address,uint256,bytes32)",
  abi: [
    "event TokensBridgingInitiated(address indexed token, address indexed sender, uint256 value, bytes32 indexed messageId)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    from: "sender",
    amount: "value",
  },
  fixedEventData: {
    to: "0x88ad09518695c6c3712AC10a214bE5109a655671",
  },
  isDeposit: true,
};

const omniWithdrawalEventParams: ContractEventParams = {
  target: "0x88ad09518695c6c3712AC10a214bE5109a655671",
  topic: "TokensBridged(address,address,uint256,bytes32)",
  abi: [
    "event TokensBridged(address indexed token, address indexed recipient, uint256 value, bytes32 indexed messageId)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    to: "recipient",
    amount: "value",
  },
  fixedEventData: {
    from: "0x88ad09518695c6c3712AC10a214bE5109a655671",
  },
  isDeposit: false,
};

const constructParams = () => {
  const eventParams = [daiDepositParams, daiWithdrawalParams, omniDepositEventParams, omniWithdrawalEventParams];

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("xdai", "ethereum", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
