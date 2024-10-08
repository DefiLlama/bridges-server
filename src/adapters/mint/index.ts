import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const MINT_L1_BRIDGE = "0x2b3F201543adF73160bA42E1a5b7750024F30420";

const ercDepositParams: PartialContractEventParams = {
    target: MINT_L1_BRIDGE,
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
      to: MINT_L1_BRIDGE,
    },
  };

  const ethDepositParams: PartialContractEventParams = {
    target: MINT_L1_BRIDGE,
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
      to: MINT_L1_BRIDGE,
      token: WETH,
    },
  };

  const ercWithdrawalParams: PartialContractEventParams = {
    target: MINT_L1_BRIDGE,
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
      from: MINT_L1_BRIDGE,
    },
  };
  
  const ethWithdrawalParams: PartialContractEventParams = {
    target: MINT_L1_BRIDGE,
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
      from: MINT_L1_BRIDGE,
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
      getTxDataFromEVMEventLogs("mint", "ethereum", fromBlock, toBlock, eventParams);
  };

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
