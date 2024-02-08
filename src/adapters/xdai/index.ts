import { BridgeAdapter, ContractEventParams, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";

// 0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016 is Gnosis Chain: xDai Bridge
// 0x88ad09518695c6c3712AC10a214bE5109a655671 is Gnosis Chain: Omni Bridge

const contracts = {
  omni: {
    ethereum: "0x88ad09518695c6c3712AC10a214bE5109a655671",
    gnosis: "0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d"
  },
  xdai: {
    ethereum: "0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016",
    gnosis: "0x7301CFA0e1756B71869E93d4e4Dca5c7d0eb0AA6"
  }
}

const WXDAI = "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d" // need for price calc, but it's less than 1 USD

// on ethereum
const daiDepositParams = constructTransferParams("0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016", true);
const daiWithdrawalParams: PartialContractEventParams = constructTransferParams(
  contracts.xdai.ethereum,
  false,
  {
    excludeTo: ["0x83F20F44975D03b1b09e64809B757c47f942BEeA"], //sDAI
  }
);

const omniDepositEventParams: ContractEventParams = {
  target: contracts.omni.ethereum,
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
    to: contracts.omni.ethereum,
  },
  isDeposit: true,
};

const omniWithdrawalEventParams: ContractEventParams = {
  target: contracts.omni.ethereum,
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
    from: contracts.omni.ethereum,
  },
  isDeposit: false,
};

const constructParamsEth = () => {
  const eventParams = [daiDepositParams, daiWithdrawalParams, omniDepositEventParams, omniWithdrawalEventParams];

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("xdai", "ethereum", fromBlock, toBlock, eventParams);
};

// on gnosis chain
const omniGnosisDepositParams: PartialContractEventParams = {
  target: contracts.omni.gnosis, // "0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d",
  topic:"TokensBridgingInitiated(address,address,uint256,bytes32)",
  abi: [
    "event TokensBridgingInitiated(address indexed token, address indexed sender, uint256 value, bytes32 indexed messageId)"
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
    from: "address",
  },
  argKeys: {
    amount: "value",
    token: "token",
    to: "sender",
  },
  isDeposit: true,
};

const omniGnosisWithdrawalParams: PartialContractEventParams = {
  target: contracts.omni.gnosis, // "0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d",
  topic:"TokensBridged(address,address,uint256,bytes32)",
  abi: [
    "event TokensBridged(address indexed token, address indexed recipient, uint256 value, bytes32 indexed messageId)"
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
    from: "address",
  },
  argKeys: {
    amount: "value",
    token: "token",
    to: "recipient",
  },
  isDeposit: false,
};

const xdaiGnosisDepositParams: PartialContractEventParams = {
  target: contracts.xdai.gnosis,
  topic:"UserRequestForSignature(address,uint256)",
  abi: [
    "event UserRequestForSignature(address recipient, uint256 value)"
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
    from: "address",
  },
  argKeys: {
    amount: "value",
    to: "recipient",
  },
  fixedEventData: {
    token: WXDAI
  },
  isDeposit: true,
};

const xdaiGnosisWithdrawalParams: PartialContractEventParams = {
  target: contracts.xdai.gnosis,
  topic:"AffirmationCompleted(address,uint256,bytes32)",
  abi: [
    "event AffirmationCompleted(address recipient, uint256 value, bytes32 transactionHash)"
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
    from: "address",
  },
  argKeys: {
    amount: "value",
    to: "recipient",
  },
  fixedEventData: {
    token: WXDAI
  },
  isDeposit: false,
};

const constructParamsGnosis = () => {
  const eventParams = [
    omniGnosisDepositParams, 
    omniGnosisWithdrawalParams,
    xdaiGnosisDepositParams,
    xdaiGnosisWithdrawalParams
  ]

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("xdai", "xdai", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParamsEth(),
  xdai: constructParamsGnosis()
};

export default adapter;
