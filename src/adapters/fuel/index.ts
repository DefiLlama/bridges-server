import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const FUEL_BRIDGE_ADDRESS_ERC20 = "0xa4cA04d02bfdC3A2DF56B9b6994520E69dF43F67";
const FUEL_MESSAGING_ADDRESS = "0xAEB0c00D0125A8a788956ade4f4F12Ead9f65DDf";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const erc20DepositEventParams: PartialContractEventParams = constructTransferParams(FUEL_BRIDGE_ADDRESS_ERC20, true);

const erc20WithdrawalEventParams: PartialContractEventParams = constructTransferParams(
  FUEL_BRIDGE_ADDRESS_ERC20,
  false
);

function bytes32ToAddress(bytes32: string) {
  return "0x" + bytes32.slice(26);
}

const ethWithdrawalParams: PartialContractEventParams = {
  target: FUEL_MESSAGING_ADDRESS,
  topic: "MessageRelayed(bytes32,bytes32,bytes32,uint64)",
  abi: [
    "event MessageRelayed (bytes32 indexed messageId, bytes32 indexed sender, bytes32 indexed recipient, uint64 amount)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "recipient",
    amount: "amount",
  },
  fixedEventData: {
    from: FUEL_MESSAGING_ADDRESS,
    token: WETH,
  },
  isDeposit: false,
};

const ethDepositParams: PartialContractEventParams = {
  target: FUEL_MESSAGING_ADDRESS,
  topic: "MessageSent(bytes32,bytes32,uint256,uint64,bytes)",
  abi: [
    "event MessageSent (bytes32 indexed sender, bytes32 indexed recipient, uint256 indexed nonce, uint64 amount, bytes data)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "amount",
    from: "sender",
  },
  argGetters: {
    from: (logArgs: any) => bytes32ToAddress(logArgs.sender),
  },
  fixedEventData: {
    to: FUEL_MESSAGING_ADDRESS,
    token: WETH,
  },
  isDeposit: true,
};

const constructParams = (chain: string) => {
  let eventParams = [
    ethDepositParams,
    ethWithdrawalParams,
    erc20DepositEventParams,
    erc20WithdrawalEventParams,
  ] as PartialContractEventParams[];

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("fuel", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
};

export default adapter;
