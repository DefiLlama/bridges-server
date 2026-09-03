import { BigNumber, ethers } from "ethers";
import { Chain } from "@defillama/sdk/build/general";
import { fromHex } from "tron-format-address";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { getTxDataFromTronEventLogs } from "./eventParsing";

/*
Allbridge Core (https://core.allbridge.io) is a stablecoin bridge built on burn-and-mint transfer
protocols: Circle CCTP (v1 and v2) for USDC, LayerZero OFT for USDT / USDT0 / USDe and Circle xReserve
for USDC <-> USDCx on Stacks. Nothing is locked in Allbridge contracts.

Deposits (tokens leaving a chain) are read from the TokensSent-style events of the Allbridge bridge
contracts on the source chain. Withdrawals (tokens arriving on a chain) are only counted for CCTP v2,
where Allbridge's own contract triggers the mint: we anchor on the bridge's ReceivedMessageId event
and read recipient and net amount from Circle's MintAndWithdraw event in the same receipt.
CCTP v1 transfers can be completed outside the Allbridge contract, and OFT / xReserve deliveries are
executed by LayerZero / Circle directly to the recipient, so those routes are counted on the source
chain only. Transfers from Solana and Sui (CCTP v1 counterparties) are therefore not counted.
*/

const adapterName = "allbridge-core";

type ChainContracts = {
  cctpV1?: { bridge: string; token: string };
  cctpV2?: { bridge: string; token: string };
  oft?: { bridge: string };
  xReserve?: { bridge: string; token: string };
};

// Allbridge addresses: https://api.core.allbridge.io/token-info
const contracts: Record<string, ChainContracts> = {
  ethereum: {
    cctpV1: { bridge: "0xC51397b75B783E31469bFaADE79913F3f82210d6", token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
    cctpV2: { bridge: "0x7972d6907739593C00e6284c53C83dB3ECd15c33", token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
    oft: { bridge: "0xeC455fFC19811e573eb5700a1bDff6ee1C47AB7B" },
    xReserve: { bridge: "0x44F9E60cB5543777492101BF424271c5F252cF15", token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
  },
  arbitrum: {
    cctpV1: { bridge: "0x23e1aEC13c92158643cF2aA17E155D27A792ccdb", token: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" },
    cctpV2: { bridge: "0x7ED5343dFC95dc3eBe5B6de64F5B5423A888Ca18", token: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" },
    oft: { bridge: "0xB074e73e637E778BE6411c3732bD58D44194FDEa" },
  },
  avax: {
    cctpV1: { bridge: "0x65dE05Fccce36Ce7FdDd668Ef4348D9e933B57Ff", token: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E" },
    cctpV2: { bridge: "0x5FBf8d23fa705A0bADb6f398fDcdC28FCCB521c0", token: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E" },
  },
  base: {
    cctpV1: { bridge: "0x1eFE2C85989D97fEBbD0743cdd79B9F0826314f6", token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
    cctpV2: { bridge: "0x214D972b8c869cfcE50D55B595adC7eF336D7FAd", token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
  },
  polygon: {
    cctpV1: { bridge: "0x710282BfeB554Ed0A34dFaD061C7c343221AC82C", token: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" },
  },
  optimism: {
    cctpV1: { bridge: "0x08391edF36f41f05d27A1e0fD7a29448417C1CD0", token: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85" },
  },
  unichain: {
    oft: { bridge: "0xe8A580782942e072C57bcf7db8329C7a7CC0528B" },
  },
};

const tronOftBridge = "TWPziSAroSacAjDuL52ByQzU86s9mP2gPr";

const logKeys = { blockNumber: "blockNumber", txHash: "transactionHash" };

// Circle TokenMessengerV2: MintAndWithdraw(address indexed mintRecipient, uint256 amount, address indexed mintToken, uint256 feeCollected)
const MINT_AND_WITHDRAW_V2_TOPIC = ethers.utils.id("MintAndWithdraw(address,uint256,address,uint256)");
const mintAndWithdrawV2Iface = new ethers.utils.Interface([
  "event MintAndWithdraw(address indexed mintRecipient, uint256 amount, address indexed mintToken, uint256 feeCollected)",
]);
const mintCache = new Map<string, Promise<ethers.utils.Result | undefined>>();
const getMintAndWithdrawV2 = (provider: any, txHash: string) => {
  if (!mintCache.has(txHash)) {
    mintCache.set(
      txHash,
      provider.getTransactionReceipt(txHash).then((receipt: any) => {
        const log = receipt?.logs?.find((l: any) => l.topics?.[0] === MINT_AND_WITHDRAW_V2_TOPIC);
        return log ? mintAndWithdrawV2Iface.parseLog(log).args : undefined;
      })
    );
  }
  return mintCache.get(txHash)!;
};

const cctpV1SendParams = ({ bridge, token }: { bridge: string; token: string }): PartialContractEventParams => ({
  target: bridge,
  topic: "TokensSent(uint256,address,bytes32,uint256,uint256,uint256,uint256,uint256,uint256,uint256)",
  abi: [
    "event TokensSent(uint256 amount, address sender, bytes32 recipient, uint256 destinationChainId, uint256 nonce, uint256 receivedRelayerFeeFromGas, uint256 receivedRelayerFeeFromTokens, uint256 relayerFee, uint256 receivedRelayerFeeTokenAmount, uint256 adminFeeTokenAmount)",
  ],
  logKeys,
  argKeys: { from: "sender", amount: "amount" },
  fixedEventData: { to: bridge, token },
  isDeposit: true,
});

const cctpV2SendParams = ({ bridge, token }: { bridge: string; token: string }): PartialContractEventParams => ({
  target: bridge,
  topic: "TokensSent(address,bytes32,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)",
  abi: [
    "event TokensSent(address sender, bytes32 recipient, uint256 amount, uint256 destinationChainId, uint256 receivedRelayerFeeFromGas, uint256 receivedRelayerFeeFromTokens, uint256 relayerFee, uint256 receivedRelayerFeeTokenAmount, uint256 adminFeeTokenAmount, uint256 maxFee)",
  ],
  logKeys,
  argKeys: { from: "sender", amount: "amount" },
  fixedEventData: { to: bridge, token },
  isDeposit: true,
});

// Mint on the destination chain: `receiveTokens` on our bridge triggers Circle's mint in the same tx,
// so recipient and net amount are read from Circle's MintAndWithdraw log of that receipt.
const cctpV2ReceiveParams = ({ bridge, token }: { bridge: string; token: string }): PartialContractEventParams => ({
  target: bridge,
  topic: "ReceivedMessageId(bytes32)",
  abi: ["event ReceivedMessageId(bytes32 messageId)"],
  logKeys: { ...logKeys, to: "mintRecipient", amount: "mintAmount" },
  logGetters: {
    to: async (provider, _iface, log) => (await getMintAndWithdrawV2(provider, log.transactionHash))?.mintRecipient,
    amount: async (provider, _iface, log) => (await getMintAndWithdrawV2(provider, log.transactionHash))?.amount,
  },
  fixedEventData: { from: bridge, token },
  isDeposit: false,
});

const oftSendParams = ({ bridge }: { bridge: string }): PartialContractEventParams => ({
  target: bridge,
  topic: "OftTokensSent(address,bytes32,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)",
  abi: [
    "event OftTokensSent(address sender, bytes32 recipient, address tokenAddress, uint256 amount, uint256 destinationChainId, uint256 receivedRelayerFeeFromGas, uint256 receivedRelayerFeeFromTokens, uint256 relayerFeeWithExtraGas, uint256 receivedRelayerFeeTokenAmount, uint256 adminFeeTokenAmount, uint256 extraGasDestinationToken)",
  ],
  logKeys,
  argKeys: { from: "sender", token: "tokenAddress", amount: "amount" },
  fixedEventData: { to: bridge },
  isDeposit: true,
});

const xReserveSendParams = ({ bridge, token }: { bridge: string; token: string }): PartialContractEventParams => ({
  target: bridge,
  topic: "XReserveTokensSent(address,bytes32,uint256,uint256,uint256,uint256)",
  abi: [
    "event XReserveTokensSent(address sender, bytes32 recipient, uint256 amount, uint256 destinationChainId, uint256 adminFeeTokenAmount, uint256 maxFee)",
  ],
  logKeys,
  argKeys: { from: "sender", amount: "amount" },
  fixedEventData: { to: bridge, token },
  isDeposit: true,
});

const constructParams = (chain: string) => {
  const { cctpV1, cctpV2, oft, xReserve } = contracts[chain];
  const eventParams: PartialContractEventParams[] = [];
  if (cctpV1) eventParams.push(cctpV1SendParams(cctpV1));
  if (cctpV2) eventParams.push(cctpV2SendParams(cctpV2), cctpV2ReceiveParams(cctpV2));
  if (oft) eventParams.push(oftSendParams(oft));
  if (xReserve) eventParams.push(xReserveSendParams(xReserve));

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs(adapterName, chain as Chain, fromBlock, toBlock, eventParams);
};

const constructTronParams = () => {
  const eventParams = [
    {
      target: tronOftBridge,
      eventName: "OftTokensSent",
      logKeys: { blockNumber: "block_number", txHash: "transaction_id" },
      argKeys: { from: "sender", token: "tokenAddress", amount: "amount" },
      argGetters: {
        amount: (log: any) => BigNumber.from(log.amount),
        from: (log: any) => fromHex(log.sender),
        token: (log: any) => fromHex(log.tokenAddress),
      },
      fixedEventData: { to: tronOftBridge },
      isDeposit: true,
    },
  ];
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromTronEventLogs(adapterName, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
  avalanche: constructParams("avax"),
  base: constructParams("base"),
  polygon: constructParams("polygon"),
  optimism: constructParams("optimism"),
  unichain: constructParams("unichain"),
  tron: constructTronParams(),
};

export default adapter;
