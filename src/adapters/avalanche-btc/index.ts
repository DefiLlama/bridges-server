import {
  BridgeAdapter,
  ContractEventParams,
} from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

// 0x152b9d0FdC40C096757F570A51E494bd4b943E50 is BTC.b

const depositEventParams: ContractEventParams = {
  target: "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
  topic: "Unwrap(uint256,uint256)",
  abi: [
    "event Unwrap(uint256 amount, uint256 chainId)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  txKeys: {
    from: "from"
  },
  argKeys: {
    amount: "amount",
  },
  fixedEventData: {
    to: "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
    token: "0x152b9d0FdC40C096757F570A51E494bd4b943E50"
  },
  isDeposit: true,
};


const withdrawalEventParams: ContractEventParams = {
  target: "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
  topic: "Mint(address,uint256,address,uint256,bytes32,uint256)",
  abi: [
    "event Mint(address to, uint256 amount, address feeAddress, uint256 feeAmount, bytes32 originTxId, uint256 originOutputIndex)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "to",
    amount: "amount",
  },
  fixedEventData: {
    from: "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
    token: "0x152b9d0FdC40C096757F570A51E494bd4b943E50"
  },
  isDeposit: false,
};

const constructParams = () => {
  const eventParams = [
    depositEventParams,
    withdrawalEventParams
  ];
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("avalanche-btc", "avax", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  avalanche: constructParams(),
};

export default adapter;
