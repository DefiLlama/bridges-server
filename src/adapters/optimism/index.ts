import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getEVMEventLogs } from "../../helpers/eventLogs";
import { constructTransferParams } from "../../helpers/eventParams";

// 0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1 is Optimism: Gateway
// 0x467194771dAe2967Aef3ECbEDD3Bf9a310C76C65 is Optimism: L1 Escrow (DAI)
// 0x5Fd79D46EBA7F351fe49BFF9E87cdeA6c821eF9f is Synthetix: L2 Deposit Escrow
// 0x76943C0D61395d8F2edF9060e1533529cAe05dE6 is Lido: Optimism L1 ERC20 Token Bridge
// 0x52ec2F3d7C5977A8E558C8D9C6000B615098E8fC is Optimism: Teleportr Deposit V2 (takes deposits of 0.05 ETH, I don't believe there is withdrawal function)

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

const teleportrDepositParams: PartialContractEventParams = {
  target: "0x52ec2F3d7C5977A8E558C8D9C6000B615098E8fC",
  topic: "EtherReceived(uint256,address,uint256)",
  abi: ["event EtherReceived(uint256 indexed depositId, address indexed emitter, uint256 indexed amount)"],
  isDeposit: true,
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "amount",
  },
  txKeys: {
    from: "from",
  },
  fixedEventData: {
    to: "0x52ec2F3d7C5977A8E558C8D9C6000B615098E8fC",
    token: WETH,
  },
};

const daiDepositEventParams: PartialContractEventParams = constructTransferParams(
  "0x467194771dAe2967Aef3ECbEDD3Bf9a310C76C65",
  true
);

const snxDepositEventParams: PartialContractEventParams = constructTransferParams(
  "0x5Fd79D46EBA7F351fe49BFF9E87cdeA6c821eF9f",
  true
);

const lidoDepositEventParams: PartialContractEventParams = constructTransferParams(
  "0x76943C0D61395d8F2edF9060e1533529cAe05dE6",
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

const snxWithdrawalEventParams: PartialContractEventParams = constructTransferParams(
  "0x5Fd79D46EBA7F351fe49BFF9E87cdeA6c821eF9f",
  false
);

const lidoWithdrawalEventParams: PartialContractEventParams = constructTransferParams(
  "0x76943C0D61395d8F2edF9060e1533529cAe05dE6",
  false
);

const constructParams = () => {
  const eventParams = [
    ercDepositParams,
    ethDepositParams,
    teleportrDepositParams,
    daiDepositEventParams,
    snxDepositEventParams,
    lidoDepositEventParams,
    ercWithdrawalParams,
    ethWithdrawalParams,
    daiWithdrawalEventParams,
    snxWithdrawalEventParams,
    lidoWithdrawalEventParams,
    
  ];
  return async (fromBlock: number, toBlock: number) =>
    getEVMEventLogs("optimism", "ethereum", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
