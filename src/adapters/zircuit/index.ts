import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const L1StandardBridge = "0x386B76D9cA5F5Fb150B6BFB35CF5379B22B26dd8";

const ethDepositParams: PartialContractEventParams = {
  target: L1StandardBridge,
  topic: "ETHBridgeInitiated(address,address,uint256,bytes)",
  abi: ["event ETHBridgeInitiated(address indexed from, address indexed to, uint256 amount, bytes extraData)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  txKeys: {
    from: "from",
    amount: "value",
  },
  fixedEventData: {
    token: WETH,
    to: L1StandardBridge,
  },
  isDeposit: true,
};

const ethWithdrawParams: PartialContractEventParams = {
  target: L1StandardBridge,
  topic: "ETHBridgeFinalized(address,address,uint256,bytes)",
  abi: ["event ETHBridgeFinalized(address indexed from, address indexed to, uint256 amount, bytes extraData)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  txKeys: {
    to: "to",
    amount: "value",
  },
  fixedEventData: {
    token: WETH,
    from: L1StandardBridge,
  },
  isDeposit: false,
};

const ercDepositParams: PartialContractEventParams = {
  target: L1StandardBridge,
  topic: "ERC20BridgeInitiated(address,address,address,address,uint256,bytes)",
  abi: ["event ERC20BridgeInitiated(address indexed localToken, address indexed remoteToken, address indexed from, address to, uint256 amount, bytes extraData)"],
  argKeys: {
    token: "localToken",
    amount: "amount",
    from: "from",
  },
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  fixedEventData: {
    to: L1StandardBridge,
  },
  isDeposit: true,
};

const ercWithdrawParams: PartialContractEventParams = {
  target: L1StandardBridge,
  topic: "ERC20BridgeFinalized(address,address,address,address,uint256,bytes)",
  abi: ["event ERC20BridgeFinalized(address indexed localToken, address indexed remoteToken, address indexed from, address to, uint256 amount, bytes extraData)"],
  argKeys: {
    token: "localToken",
    amount: "amount",
    to: "to",
  },
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },

  fixedEventData: {
    from: L1StandardBridge,
  },
  isDeposit: false,
};

const constructParams = () => {
  const eventParams = [
    ethDepositParams,
    ethWithdrawParams,
    ercDepositParams,
    ercWithdrawParams,
  ];
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("zircuit", "ethereum", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
