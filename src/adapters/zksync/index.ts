import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";

/* 

0x32400084C286CF3E17e7B677ea9583e60a000324 is zkSync Era: Diamond Proxy
    - deposits of 
        - ETH
0xf8A16864D8De145A266a534174305f881ee2315e is zkSync Era: Withdrawal Finalizer
0x57891966931Eb4Bb6FB81430E6cE0A03AAbDe063 is zkSync Era: Bridge
    - deposits of 
        - ERC20
    - withdrawals of 
        - ETH
        - ERC20
*/

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const ethDepositEventParams: PartialContractEventParams = {
  target: "0x32400084C286CF3E17e7B677ea9583e60a000324",
  // topic: "NewPriorityRequest(uint256,bytes32,uint64,tuple,bytes[])", // as shown on Etherscan
  topic:
    "NewPriorityRequest(uint256,bytes32,uint64,(uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256[4],bytes,bytes,uint256[],bytes,bytes),bytes[])", // expand tuple data types
  // topic: "NewPriorityRequest(uint256,bytes32,uint64,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256[4],bytes,bytes,uint256[],bytes,bytes,bytes[])", // break out data types from tuple
  abi: [
    // "event NewPriorityRequest(uint256 txId, bytes32 txHash, uint64 expirationTimestamp, tuple transaction, bytes[] factoryDeps)", // as shown on Etherscan
    "event NewPriorityRequest(uint256 txId, bytes32 txHash, uint64 expirationTimestamp, tuple(uint256 txType, uint256 from, uint256 to, uint256 gasLimit, uint256 gasPerPubdataByteLimit, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, uint256 paymaster, uint256 nonce, uint256 value, uint256[4] reserved, bytes data, bytes signature, uint256[] factoryDeps, bytes paymasterInput, bytes reservedDynamic) transaction, bytes[] factoryDeps)",
  ],
  argKeys: {
    to: "transaction[2]",
    amount: "transaction[9]",
  },
  argGetters: {
    to: (log: any) => log?.transaction?.[2]?.toHexString(),
    amount: (log: any) => log?.transaction?.[9],
  },
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  fixedEventData: {
    from: "0x32400084C286CF3E17e7B677ea9583e60a000324",
    token: WETH,
  },
  isDeposit: true,
};

const erc20DepositEventParams: PartialContractEventParams = constructTransferParams(
  "0x57891966931Eb4Bb6FB81430E6cE0A03AAbDe063",
  true
);

const ethWithdrawalEventParams: PartialContractEventParams = {
  target: "0x32400084C286CF3E17e7B677ea9583e60a000324",
  topic: "EthWithdrawalFinalized(address,uint256)",
  abi: ["event EthWithdrawalFinalized(address indexed to, uint256 amount)"],
  argKeys: {
    to: "to",
    amount: "amount",
  },
  fixedEventData: {
    from: "0x32400084C286CF3E17e7B677ea9583e60a000324",
    token: WETH,
  },
  isDeposit: false,
};

const erc20WithdrawalEventParams: PartialContractEventParams = constructTransferParams(
  "0x57891966931Eb4Bb6FB81430E6cE0A03AAbDe063",
  false
);

const constructParams = () => {
  const eventParams = [
    ethDepositEventParams,
    erc20DepositEventParams,
    ethWithdrawalEventParams,
    erc20WithdrawalEventParams,
  ];
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("zksync", "ethereum", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
