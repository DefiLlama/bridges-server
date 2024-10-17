import { ContractEventParamsV2, } from "../../helpers/bridgeAdapter.type";
import { processEVMLogsExport, } from "../../helpers/processTransactions";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const BASE_PORTAL = "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e";
const BASE_BRIDGE = "0x3154Cf16ccdb4C6d922629664174b904d80F2C35";

const erc20DepositParams: ContractEventParamsV2 = {
  target: BASE_BRIDGE,
  abi: "event ERC20BridgeInitiated(address indexed localToken, address indexed remoteToken, address indexed from, address to, uint256 amount, bytes extraData)",
  isDeposit: true,
  argKeys: {
    token: "localToken",
  },
}

const erc20WithdrawalParams: ContractEventParamsV2 = {
  target: BASE_BRIDGE,
  abi: "event ERC20WithdrawalFinalized(address indexed l1Token, address indexed l2Token, address indexed from, address to, uint256 amount, bytes extraData)",
  isDeposit: false,
  argKeys: {
    token: "l1Token",
  },
}

const ethWithdrawalParams: ContractEventParamsV2 = {
  target: BASE_PORTAL,
  abi: "event ETHWithdrawalFinalized(address indexed from, address indexed to, uint256 amount, bytes extraData)",
  isDeposit: false,
  fixedEventData: {
    from: BASE_PORTAL,
    token: WETH,
  },
}

const ethDepositParams: ContractEventParamsV2 = {
  target: BASE_PORTAL,
  abi: "event TransactionDeposited (address indexed from, address indexed to, uint256 indexed version, bytes opaqueData)",
  isDeposit: true,
  fixedEventData: {
    token: WETH,
    to: BASE_PORTAL,
  },
  filter: (i: any) => i.args.opaqueData.length === 148, // only these transactions are for eth deposits
  transformLog: (log: any) => {
    log.amount = Number('0x'+log.args.opaqueData.slice(2,66)).toString()
    return log;
  },
}

export default {
  ethereum: processEVMLogsExport([erc20DepositParams, erc20WithdrawalParams, ethWithdrawalParams, ethDepositParams]),
};
