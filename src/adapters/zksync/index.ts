import { BridgeAdapter, ContractEventParamsV2, } from "../../helpers/bridgeAdapter.type";
import { processEVMLogs } from "../../helpers/processTransactions";

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

const ethWithdrawalParams: ContractEventParamsV2 = {
  target: "0x32400084C286CF3E17e7B677ea9583e60a000324",
  abi: "event EthWithdrawalFinalized(address indexed to, uint256 amount)",
  isDeposit: false,
  fixedEventData: {
    from: "0x32400084C286CF3E17e7B677ea9583e60a000324",
    token: WETH,
  },
}
const erc20WithdrawalParams: ContractEventParamsV2 = {
  target: "0x57891966931Eb4Bb6FB81430E6cE0A03AAbDe063",
  abi: "event WithdrawalFinalized(address indexed to, address indexed l1Token, uint256 amount)",
  isDeposit: false,
  argKeys: {
    token: "l1Token",
  },
  fixedEventData: {
    from: "0x57891966931Eb4Bb6FB81430E6cE0A03AAbDe063",
  },
}

const erc20DepositParams: ContractEventParamsV2 = {
  target: "0x57891966931Eb4Bb6FB81430E6cE0A03AAbDe063",
  abi: "event DepositInitiated (bytes32 indexed l2DepositTxHash, address indexed from, address indexed to, address l1Token, uint256 amount)",
  isDeposit: true,
  argKeys: {
    token: "l1Token",
  },
}
const ethDepositParams: ContractEventParamsV2 = {
  target: "0x32400084C286CF3E17e7B677ea9583e60a000324",
  abi: "event NewPriorityRequest(uint256 txId, bytes32 txHash, uint64 expirationTimestamp, tuple(uint256 txType, uint256 from, uint256 to, uint256 gasLimit, uint256 gasPerPubdataByteLimit, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, uint256 paymaster, uint256 nonce, uint256 value, uint256[4] reserved, bytes data, bytes signature, uint256[] factoryDeps, bytes paymasterInput, bytes reservedDynamic) transaction, bytes[] factoryDeps)",
  isDeposit: true,
  transformLog: (log: any) => {
    log.amount = log.transaction.amount
    log.to = log.transaction.to
    return log;
  }
}

const adapter: BridgeAdapter = {
  ethereum: async (_from, _to, options) => {
    const logs = await processEVMLogs({ options: options!, contractEventParams:[ethWithdrawalParams, erc20DepositParams, erc20WithdrawalParams] });
    const ethDepositLogs = await processEVMLogs({ options: options!, contractEventParams:[ethDepositParams, ] });

    // there was a bug where we assumed all NewPriorityRequest logs were for eth deposits, but we need to exclude all erc20 deposits
    const txSet = new Set(logs.map((log) => log.txHash));
    const filteredEthDepositLogs = ethDepositLogs.filter((log) => !txSet.has(log.txHash));
    return logs.concat(filteredEthDepositLogs)
  },
};

export default adapter;
