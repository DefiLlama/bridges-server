import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const ethDepositParams: PartialContractEventParams = {
  target: "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e",
  topic: "TransactionDeposited(address,address,uint256,bytes)",
  abi: [
    "event TransactionDeposited(address indexed from,address indexed to, uint256 indexed version, bytes opaqueData)",
  ],
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
    to: "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e",
  },
  isDeposit: true,
};

const constructParams = () => {
  const eventParams = [ethDepositParams];
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("base", "ethereum", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
