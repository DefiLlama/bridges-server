import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";

/*
0xa3A7B6F88361F48403514059F1F16C8E78d60EeC is Arbitrum One: L1 ERC20 Bridge
0xcEe284F754E854890e311e3280b767F80797180d is Arbitrum One: L1 Arb - Custom Gateway
0xd92023E9d9911199a6711321D1277285e6d4e2db is Arbitrum One: Wrapped Ether Gateway
0xD3B5b60020504bc3489D6949d545893982BA3011 is Arbitrum One: L1 DAI Gateway
0xA10c7CE4b876998858b1a9E12b10092229539400 is Arbitrum One: DAI L1 Escrow
0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a is Arbitrum: Bridge
  -deposits of
    -most things, but they are all routed
  -withdrawals of
    -ETH
0x4Dbd4fc535Ac27206064B68FfCf827b0A60BAB3f is Arbitrum: Delayed Inbox
  -deposits of
    -ETH
0x72Ce9c846789fdB6fC1f34aC4AD25Dd9ef7031ef is Arbitrum One: L1 Gateway Router
  -deposits of:
    -ERC-20s routed to ERC20 Bridge, Custom Gateway, and others (DAI Gateway, etc.)
    -WETH routed to Wrapped Ether Gateway
    -NO ETH
  -NO withdrawals
  There are also Arbitrum One: Outbox 1-4 contracts that control withdrawals, but it may be easier to monitor each contract separately.
*/

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

/*
this misses some txs that are preceded by swaps and have no input data, e.g., 0x4927a66b30d96fcffe1df5317eaeb864352af19c7a28a7a145efdce0ed19c037
this misses ETH deposits
const depositParams: PartialContractEventParams = {
  target: "0x72Ce9c846789fdB6fC1f34aC4AD25Dd9ef7031ef",
  topic: "TransferRouted(address,address,address,address)",
  abi: [
    "event TransferRouted(address indexed token, address indexed _userFrom, address indexed _userTo, address gateway)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "_userTo", // it seems that userFrom = userTo, except in cases where deposit is routed: in that case userTo is original sender
    to: "gateway",
  },
  isDeposit: true,
  inputDataExtraction: {
    inputDataABI: [
      "function outboundTransfer(address _token, address _to, uint256 _amount, uint256 _maxGas, uint256 _gasPriceBid, bytes _data)",
    ],
    inputDataFnName: "outboundTransfer",
    inputDataKeys: {
      token: "_token",
      amount: "_amount",
    },
  },
};
*/

const erc20DepositEventParams: PartialContractEventParams = constructTransferParams(
  "0xa3A7B6F88361F48403514059F1F16C8E78d60EeC",
  true
);

const customGatewayDepositEventParams: PartialContractEventParams = constructTransferParams(
  "0xcEe284F754E854890e311e3280b767F80797180d",
  true
);

const wethDepositEventParams: PartialContractEventParams = constructTransferParams(
  "0xd92023E9d9911199a6711321D1277285e6d4e2db",
  true
);

const daiDepositEventParams: PartialContractEventParams = constructTransferParams(
  "0xA10c7CE4b876998858b1a9E12b10092229539400",
  true
);

const ethDepositParams: PartialContractEventParams = {
  target: "0x4Dbd4fc535Ac27206064B68FfCf827b0A60BAB3f",
  topic: "InboxMessageDelivered(uint256,bytes)",
  abi: ["event InboxMessageDelivered(uint256 indexed messageNum, bytes data)"],
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
    to: "0x4Dbd4fc535Ac27206064B68FfCf827b0A60BAB3f",
  },
  isDeposit: true,
};

const erc20WithdrawalEventParams: PartialContractEventParams = constructTransferParams(
  "0xa3A7B6F88361F48403514059F1F16C8E78d60EeC",
  false
);

const customGatewayWithdrawalEventParams: PartialContractEventParams = constructTransferParams(
  "0xcEe284F754E854890e311e3280b767F80797180d",
  false
);

const wethWithdrawalEventParams: PartialContractEventParams = constructTransferParams(
  "0xd92023E9d9911199a6711321D1277285e6d4e2db",
  false
);

const daiWithdrawalEventParams: PartialContractEventParams = constructTransferParams(
  "0xA10c7CE4b876998858b1a9E12b10092229539400",
  false
);

const ethWithdrawalEventParams: PartialContractEventParams = {
  target: "0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a",
  topic: "BridgeCallTriggered(address,address,uint256,bytes)",
  abi: ["event BridgeCallTriggered(address indexed outbox, address indexed to, uint256 value, bytes data)"],
  argKeys: {
    amount: "value", // correct??
    to: "to",
  },
  fixedEventData: {
    from: "0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a",
    token: WETH,
  },
  isDeposit: false,
  filter: {
    includeArg: [{ data: "0x" }],
  },
};

const constructParams = () => {
  const eventParams = [
    erc20DepositEventParams,
    customGatewayDepositEventParams,
    wethDepositEventParams,
    daiDepositEventParams,
    ethDepositParams,
    erc20WithdrawalEventParams,
    customGatewayWithdrawalEventParams,
    wethWithdrawalEventParams,
    daiWithdrawalEventParams,
    ethWithdrawalEventParams,
  ];
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("arbitrum", "ethereum", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
