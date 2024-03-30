import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { getTxsBlockRangeEtherscan } from "../../helpers/etherscan";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const BASE_PORTAL = "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e";
const BASE_BRIDGE = "0x3154Cf16ccdb4C6d922629664174b904d80F2C35";

const erc20DepositParams: PartialContractEventParams = {
  target: BASE_BRIDGE,
  topic: "ERC20BridgeInitiated(address,address,address,address,uint256,bytes)",
  abi: [
    "event ERC20BridgeInitiated(address indexed localToken, address indexed remoteToken, address indexed from, address to, uint256 amount, bytes extraData)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "from",
    amount: "amount",
    token: "localToken",
  },
  fixedEventData: {
    to: BASE_BRIDGE,
  },
  isDeposit: true,
};

const erc20WithdrawParams: PartialContractEventParams = {
  target: BASE_BRIDGE,
  topic: "ERC20WithdrawalFinalized(address,address,address,address,uint256,bytes)",
  abi: [
    "event ERC20WithdrawalFinalized(address indexed l1Token, address indexed l2Token, address indexed from, address to, uint256 amount, bytes extraData)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "to",
    amount: "amount",
    token: "l1Token",
  },
  fixedEventData: {
    from: BASE_BRIDGE,
  },
  isDeposit: false,
};

const constructParams = () => {
  const eventParams = [erc20WithdrawParams, erc20DepositParams];
  return async (fromBlock: number, toBlock: number) => {
    const eventLogsRes = await getTxDataFromEVMEventLogs("base", "ethereum", fromBlock, toBlock, eventParams);
    const txs = await getTxsBlockRangeEtherscan("ethereum", BASE_PORTAL, fromBlock, toBlock);
    const depositEvents = txs
      .filter((tx: any) => tx?.methodId === "0xe9e05c42")
      .map((tx: any) => {
        const event = {
          txHash: tx.hash,
          blockNumber: +tx.blockNumber,
          from: tx.from,
          to: tx.to,
          token: WETH,
          amount: tx.value,
          isDeposit: true,
        };
        return event;
      });

    const withdrawalEvents = txs
      .filter((tx: any) => tx?.methodId === "0x8c3152e9")
      .map((tx: any) => {
        const event = {
          txHash: tx.hash,
          blockNumber: +tx.blockNumber,
          from: BASE_PORTAL,
          to: tx.to,
          token: WETH,
          amount: tx.value,
          isDeposit: false,
        };
        return event;
      });
    return [...eventLogsRes, ...depositEvents, ...withdrawalEvents];
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
