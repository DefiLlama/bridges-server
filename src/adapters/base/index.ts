import { BridgeAdapter, } from "../../helpers/bridgeAdapter.type";
import { getEVMLogs, } from "../../helpers/processTransactions";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const BASE_PORTAL = "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e";
const BASE_BRIDGE = "0x3154Cf16ccdb4C6d922629664174b904d80F2C35";

const constructParams = () => {
  return async (fromBlock: number, toBlock: number) => {
    const erc20DepositLogs = await getEVMLogs({
      target: BASE_BRIDGE,
      fromBlock,
      toBlock,
      eventAbi: 'event ERC20BridgeInitiated(address indexed localToken, address indexed remoteToken, address indexed from, address to, uint256 amount, bytes extraData)',
      transformLog: (log: any) => {
        log.from = log.args.from;
        log.to = log.args.to;
        log.token = log.args.localToken;
        log.amount = log.args.amount;
        log.isDeposit = true;
        return log;
      }
    })
    const erc20WithdrawalLogs = await getEVMLogs({
      target: BASE_BRIDGE,
      fromBlock,
      toBlock,
      eventAbi: 'event ERC20WithdrawalFinalized(address indexed l1Token, address indexed l2Token, address indexed from, address to, uint256 amount, bytes extraData)',
      transformLog: (log: any) => {
        log.from = log.args.from;
        log.to = log.args.to;
        log.token = log.args.l1Token;
        log.amount = log.args.amount;
        log.isDeposit = false;
        return log;
      }
    })
    const ethWithdrawalLogs = await getEVMLogs({
      target: BASE_PORTAL,
      fromBlock,
      toBlock,
      eventAbi: 'event ETHWithdrawalFinalized(address indexed from, address indexed to, uint256 amount, bytes extraData)',
      transformLog: (log: any) => {
        log.from = BASE_PORTAL;
        log.to = log.args.to;
        log.token = WETH;
        log.amount = log.args.amount;
        log.isDeposit = false;
        return log;
      }
    })
    const ethDepositLogs = await getEVMLogs({
      target: BASE_PORTAL,
      fromBlock,
      toBlock,
      eventAbi: 'event TransactionDeposited (address indexed from, address indexed to, uint256 indexed version, bytes opaqueData)',
      transformLog: (log: any) => {
        log.from = log.args.from;
        log.to = BASE_PORTAL;
        log.token = WETH;
        log.amount = Number('0x'+log.args.opaqueData.slice(2,66)).toString()
        log.isDeposit = true;
        return log;
      }
    })
    return [erc20DepositLogs, ethDepositLogs, erc20WithdrawalLogs, ethWithdrawalLogs].flat()
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
