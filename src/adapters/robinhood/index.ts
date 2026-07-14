import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

// Robinhood Chain canonical Arbitrum token bridge contracts on Ethereum L1.
// Source: https://docs.robinhood.com/chain/protocol-contracts/
const L1_WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const L1_ERC20_GATEWAY = "0x85001CC4867C5e1C22dA4B79BB8852B9e2a06da0";
const L1_CUSTOM_GATEWAY = "0x9368EAEbFe6E063C69dcF8126711A6997E0eCeE1";
const L1_WETH_GATEWAY = "0xF7e12b9614b509C747ab4423bC4ACF923759Cf1B";
const DELAYED_INBOX = "0x1A07cc4BD17E0118BdB54D70990D2158AbAD7a2D";
const BRIDGE = "0xDf8755334ce7A73cCF6b581C02eA649AE3E864b3";

const tokenGatewayParams = [L1_ERC20_GATEWAY, L1_CUSTOM_GATEWAY, L1_WETH_GATEWAY].flatMap((gateway) => [
  constructTransferParams(gateway, true),
  constructTransferParams(gateway, false),
]);

const ethDepositParams: PartialContractEventParams = {
  target: DELAYED_INBOX,
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
    token: L1_WETH,
    to: DELAYED_INBOX,
  },
  // Only direct ETH deposits. Other retryable tickets can carry fee value and
  // would otherwise be double-counted alongside ERC20 gateway transfers.
  functionSignatureFilter: {
    // processTransactions currently compares the first eight characters.
    includeSignatures: ["0x439370", "0x0f4d14"],
  },
  isDeposit: true,
};

const ethWithdrawalParams: PartialContractEventParams = {
  target: BRIDGE,
  topic: "BridgeCallTriggered(address,address,uint256,bytes)",
  abi: ["event BridgeCallTriggered(address indexed outbox, address indexed to, uint256 value, bytes data)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "value",
    to: "to",
  },
  fixedEventData: {
    from: BRIDGE,
    token: L1_WETH,
  },
  filter: {
    includeArg: [{ data: "0x" }],
  },
  isDeposit: false,
};

const eventParams = [...tokenGatewayParams, ethDepositParams, ethWithdrawalParams];

const adapter: BridgeAdapter = {
  ethereum: async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("robinhood", "ethereum", fromBlock, toBlock, eventParams),
};

export default adapter;
