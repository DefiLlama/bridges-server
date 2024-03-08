import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const MODE_L1_BRIDGE = "0x735aDBbE72226BD52e818E7181953f42E3b0FF21";

const ercDepositParams: PartialContractEventParams = {
    target: MODE_L1_BRIDGE,
    topic: "ERC20DepositInitiated(address,address,address,address,uint256,bytes)",
    abi: [
      "event ERC20DepositInitiated(address indexed _l1Token, address indexed _l2Token, address indexed _from, address _to, uint256 _amount, bytes _data)",
    ],
    isDeposit: true,
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "_l1Token",
      from: "_from",
      amount: "_amount",
    },
    fixedEventData: {
      to: MODE_L1_BRIDGE,
    },
  };

  const ethDepositParams: PartialContractEventParams = {
    target: MODE_L1_BRIDGE,
    topic: "ETHDepositInitiated(address,address,uint256,bytes)",
    abi: ["event ETHDepositInitiated(address indexed _from, address indexed _to, uint256 _amount, bytes _data)"],
    isDeposit: true,
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      from: "_from",
      amount: "_amount",
    },
    fixedEventData: {
      to: MODE_L1_BRIDGE,
      token: WETH,
    },
  };

  const ercWithdrawalParams: PartialContractEventParams = {
    target: MODE_L1_BRIDGE,
    topic: "ERC20WithdrawalFinalized(address,address,address,address,uint256,bytes)",
    abi: [
      "event ERC20WithdrawalFinalized(address indexed _l1Token, address indexed _l2Token, address indexed _from, address _to, uint256 _amount, bytes _data)",
    ],
    isDeposit: false,
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "_l1Token",
      to: "_to",
      amount: "_amount",
    },
    fixedEventData: {
      from: MODE_L1_BRIDGE,
    },
  };
  
  const ethWithdrawalParams: PartialContractEventParams = {
    target: MODE_L1_BRIDGE,
    topic: "ETHWithdrawalFinalized(address,address,uint256,bytes)",
    abi: ["event ETHWithdrawalFinalized(address indexed _from, address indexed _to, uint256 _amount, bytes _data)"],
    isDeposit: false,
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      to: "_to",
      amount: "_amount",
    },
    fixedEventData: {
      from: MODE_L1_BRIDGE,
      token: WETH,
    },
  };

  const constructParams = () => {
    const eventParams = [
      ercDepositParams,
      ethDepositParams,
      ercWithdrawalParams,
      ethWithdrawalParams,
    ];
    return async (fromBlock: number, toBlock: number) =>
      getTxDataFromEVMEventLogs("mode", "ethereum", fromBlock, toBlock, eventParams);
  };

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
