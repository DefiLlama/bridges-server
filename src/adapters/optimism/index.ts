import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getEVMEventLogs } from "../../helpers/eventLogs";
import { constructTransferParams } from "../../helpers/eventParams";

// 0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1 is Optimism: Gateway
// 0x467194771dAe2967Aef3ECbEDD3Bf9a310C76C65 is Optimism: L1 Escrow (DAI)

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const ercDepositParams: PartialContractEventParams = {
  target: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
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
    to: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
  },
};

const ethDepositParams: PartialContractEventParams = {
  target: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
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
    to: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
    token: WETH,
  },
};

const daiDepositEventParams: PartialContractEventParams = constructTransferParams(
  "0x467194771dAe2967Aef3ECbEDD3Bf9a310C76C65",
  true
);

const ercWithdrawalParams: PartialContractEventParams = {
  target: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
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
    from: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
  },
};

const ethWithdrawalParams: PartialContractEventParams = {
  target: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
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
    from: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
    token: WETH,
  },
};

const daiWithdrawalEventParams: PartialContractEventParams = constructTransferParams(
  "0x467194771dAe2967Aef3ECbEDD3Bf9a310C76C65",
  false
);

const constructParams = () => {
  const eventParams = [
    daiDepositEventParams,
    ercDepositParams,
    ethDepositParams,
    ercWithdrawalParams,
    ethWithdrawalParams,
    daiWithdrawalEventParams,
  ];
  return async (fromBlock: number, toBlock: number) =>
    getEVMEventLogs("optimism", "ethereum", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
