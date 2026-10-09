import { BridgeAdapter, PartialContractEventParams } from "./bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "./processTransactions";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const logKeys = {
  blockNumber: "blockNumber",
  txHash: "transactionHash",
};

// Canonical OP Stack bridge, L1 side. Deposits are counted when initiated on Ethereum and withdrawals
// when finalized there, both from the L1StandardBridge proxy. ETH is booked as WETH.
export const buildOpStackBridgeAdapter = (bridgeDbName: string, l1StandardBridge: string): BridgeAdapter => {
  const eventParams: PartialContractEventParams[] = [
    {
      target: l1StandardBridge,
      topic: "ETHDepositInitiated(address,address,uint256,bytes)",
      abi: ["event ETHDepositInitiated(address indexed from, address indexed to, uint256 amount, bytes extraData)"],
      logKeys,
      argKeys: { from: "from", amount: "amount" },
      fixedEventData: { to: l1StandardBridge, token: WETH },
      isDeposit: true,
    },
    {
      target: l1StandardBridge,
      topic: "ERC20DepositInitiated(address,address,address,address,uint256,bytes)",
      abi: [
        "event ERC20DepositInitiated(address indexed l1Token, address indexed l2Token, address indexed from, address to, uint256 amount, bytes extraData)",
      ],
      logKeys,
      argKeys: { token: "l1Token", from: "from", amount: "amount" },
      fixedEventData: { to: l1StandardBridge },
      isDeposit: true,
    },
    {
      target: l1StandardBridge,
      topic: "ETHWithdrawalFinalized(address,address,uint256,bytes)",
      abi: ["event ETHWithdrawalFinalized(address indexed from, address indexed to, uint256 amount, bytes extraData)"],
      logKeys,
      argKeys: { to: "to", amount: "amount" },
      fixedEventData: { from: l1StandardBridge, token: WETH },
      isDeposit: false,
    },
    {
      target: l1StandardBridge,
      topic: "ERC20WithdrawalFinalized(address,address,address,address,uint256,bytes)",
      abi: [
        "event ERC20WithdrawalFinalized(address indexed l1Token, address indexed l2Token, address indexed from, address to, uint256 amount, bytes extraData)",
      ],
      logKeys,
      argKeys: { token: "l1Token", to: "to", amount: "amount" },
      fixedEventData: { from: l1StandardBridge },
      isDeposit: false,
    },
  ];

  return {
    ethereum: async (fromBlock: number, toBlock: number) =>
      getTxDataFromEVMEventLogs(bridgeDbName, "ethereum", fromBlock, toBlock, eventParams),
  };
};
