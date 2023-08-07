import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const ethDepositParams: PartialContractEventParams = {
  target: "0x95fC37A27a2f68e3A647CDc081F0A89bb47c3012",
  topic: "ETHDepositInitiated(address,address,uint256,bytes)",
  abi: ["event ETHDepositInitiated(address indexed _from, address indexed _to, uint256 _amount, bytes _data)"],
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
    to: "0x95fC37A27a2f68e3A647CDc081F0A89bb47c3012",
  },
  isDeposit: true,
};

const ethWithdrawParams: PartialContractEventParams = {
  target: "0x95fC37A27a2f68e3A647CDc081F0A89bb47c3012",
  topic: "ETHWithdrawalFinalized(address,address,uint256,bytes)",
  abi: ["event ETHWithdrawalFinalized(address indexed _from, address indexed _to, uint256 _amount,bytes _data)"],
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
    from: "0x95fC37A27a2f68e3A647CDc081F0A89bb47c3012",
  },
  isDeposit: false,
};

const ercDepositParams: PartialContractEventParams = {
  target: "0x95fC37A27a2f68e3A647CDc081F0A89bb47c3012",
  topic: "ERC20DepositInitiated(address,address,address,address,uint256,bytes)",
  abi: [
    "event ERC20DepositInitiated(address indexed _l1Token, address indexed _l2Token, address indexed _from, address _to, uint256 _amount, bytes _data)",
  ],
  argKeys: {
    token: "_l1Token",
    amount: "_amount",
    from: "_from",
  },
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },

  fixedEventData: {
    to: "0x95fC37A27a2f68e3A647CDc081F0A89bb47c3012",
  },
  isDeposit: true,
};

const ercWithdrawParams: PartialContractEventParams = {
  target: "0x95fC37A27a2f68e3A647CDc081F0A89bb47c3012",
  topic: "ERC20WithdrawalFinalized(address,address,address,address,uint256,bytes)",
  abi: [
    "event ERC20WithdrawalFinalized(address indexed _l1Token, address indexed _l2Token, address indexed _from, address _to, uint256 _amount, bytes _data)",
  ],
  argKeys: {
    token: "_l1Token",
    amount: "_amount",
    to: "_to",
  },
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },

  fixedEventData: {
    from: "0x95fC37A27a2f68e3A647CDc081F0A89bb47c3012",
  },
  isDeposit: false,
};

const constructParams = () => {
  const eventParams = [ercDepositParams, ercWithdrawParams, ethDepositParams, ethWithdrawParams];
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("mantle", "ethereum", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
