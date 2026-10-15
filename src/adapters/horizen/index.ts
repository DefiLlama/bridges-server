import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { getTxsBlockRangeEtherscan } from "../../helpers/etherscan";

// Horizen is an OP Stack L3 (Caldera) settling to Base, so its native bridge lives on
// the Base (L1) side — same Bedrock contract layout as the Base<-Ethereum bridge.
// Addresses from Horizen docs + Basescan (deployer 0x8F2CfC...66E68, ~Nov 2025):
//   L1StandardBridge      0xf4a6cc4171fda694439f856d912777aa6ab05369 (holds 0 ETH; forwards to portal)
//   OptimismPortal        0x78e794d10a355468A0e7A14AA1a9F9A253D78784 (OptimismPortal2; locks the ETH)
// ERC20s on the standard bridge emit ERC20BridgeInitiated/WithdrawalFinalized.
// ETH is captured on BOTH disjoint deposit paths (no double-count):
//   1. standard-bridge route (Caldera UI) -> ETHBridgeInitiated/ETHBridgeFinalized events on the bridge
//   2. direct-to-portal route -> OptimismPortal txs (depositTransaction / finalizeWithdrawalTransaction)
// Bridge-routed deposits reach the portal only as INTERNAL txs, so the portal txlist scan (path 2)
// never sees them -> the two paths don't overlap. ZEN/USDC/cbBTC bridge via Stargate (not covered here).
const WETH = "0x4200000000000000000000000000000000000006"; // Base WETH
const HORIZEN_PORTAL = "0x78e794d10a355468A0e7A14AA1a9F9A253D78784";
const HORIZEN_BRIDGE = "0xf4a6cc4171fda694439f856d912777aa6ab05369";

const ethDepositParams: PartialContractEventParams = {
  target: HORIZEN_BRIDGE,
  topic: "ETHBridgeInitiated(address,address,uint256,bytes)",
  abi: ["event ETHBridgeInitiated(address indexed from, address indexed to, uint256 amount, bytes extraData)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "from",
    amount: "amount",
  },
  fixedEventData: {
    token: WETH,
    to: HORIZEN_BRIDGE,
  },
  isDeposit: true,
};

const ethWithdrawParams: PartialContractEventParams = {
  target: HORIZEN_BRIDGE,
  topic: "ETHBridgeFinalized(address,address,uint256,bytes)",
  abi: ["event ETHBridgeFinalized(address indexed from, address indexed to, uint256 amount, bytes extraData)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "to",
    amount: "amount",
  },
  fixedEventData: {
    token: WETH,
    from: HORIZEN_BRIDGE,
  },
  isDeposit: false,
};

const erc20DepositParams: PartialContractEventParams = {
  target: HORIZEN_BRIDGE,
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
    to: HORIZEN_BRIDGE,
  },
  isDeposit: true,
};

const erc20WithdrawParams: PartialContractEventParams = {
  target: HORIZEN_BRIDGE,
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
    from: HORIZEN_BRIDGE,
  },
  isDeposit: false,
};

const constructParams = () => {
  const eventParams = [ethDepositParams, ethWithdrawParams, erc20WithdrawParams, erc20DepositParams];
  return async (fromBlock: number, toBlock: number) => {
    const eventLogsRes = await getTxDataFromEVMEventLogs("horizen", "base", fromBlock, toBlock, eventParams);
    const txs = await getTxsBlockRangeEtherscan("base", HORIZEN_PORTAL, fromBlock, toBlock);
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
          from: HORIZEN_PORTAL,
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
  base: constructParams(),
};

export default adapter;
