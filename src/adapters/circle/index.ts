import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

/*
https://developers.circle.com/stablecoins/docs/evm-smart-contracts
*/

const contractsV1 = {
  ethereum: { TokenMessenger: "0xBd3fa81B58Ba92a82136038B25aDec7066af3155" },
  optimism: { TokenMessenger: "0x2B4069517957735bE00ceE0fadAE88a26365528f" },
  polygon: { TokenMessenger: "0x9daF8c91AEFAE50b9c0E69629D3F6Ca40cA3B3FE" },
  base: { TokenMessenger: "0x1682Ae6375C4E4A97e4B583BC394c861A46D8962" },
  arbitrum: { TokenMessenger: "0x19330d10D9Cc8751218eaf51E8885D058642E08A" },
  avax: { TokenMessenger: "0x6B25532e1060CE10cc3B0A99e5683b91BFDe6982" },
} as const;
const contractsV2 = {
  ethereum: { TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" },
  avax: { TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" },
  op: { TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" },
  arbitrum: { TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" },
  base: { TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" },
  polygon: { TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" },
  unichain: { TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" },
  linea: { TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" },
  codex: { TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" },
  sonic: { TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" },
  wc: { TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" },
  monad: { TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" },
  sei: { TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" },
  xdc: { TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" },
  hyperliquid: { TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" },
  ink: { TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" },
} as const;
type SupportedChainsV1 = keyof typeof contractsV1;
type SupportedChainsV2 = keyof typeof contractsV2;

const depositParamsV1: PartialContractEventParams = {
  target: "",
  topic: "DepositForBurn(uint64,address,uint256,address,bytes32,uint32,bytes32,bytes32)",
  abi: [
    "event DepositForBurn(uint64 indexed nonce, address indexed burnToken, uint256 amount, address indexed depositor, bytes32 mintRecipient, uint32 destinationDomain, bytes32 destinationTokenMessenger, bytes32 destinationCaller)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "amount",
    from: "depositor",
    to: "mintRecipient",
    token: "burnToken",
  },
  isDeposit: true,
};

const withdrawParamsV1: PartialContractEventParams = {
  target: "",
  topic: "MintAndWithdraw(address,uint256,address)",
  abi: [
    "event MintAndWithdraw(address indexed mintRecipient, uint256 amount, address indexed mintToken)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "amount",
    to: "mintRecipient",
    from: "mintRecipient",
    token: "mintToken",
  },
  isDeposit: false,
};

const depositParamsV2: PartialContractEventParams = {
  target: "",
  topic: "DepositForBurn(address,uint256,address,bytes32,uint32,bytes32,bytes32,uint256,uint32,bytes)",
  abi: [
    "event DepositForBurn(address indexed burnToken, uint256 amount, address indexed depositor, bytes32 mintRecipient, uint32 destinationDomain, bytes32 destinationTokenMessenger, bytes32 destinationCaller, uint256 maxFee, uint32 indexed minFinalityThreshold, bytes hookData)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "amount",
    from: "depositor",
    to: "mintRecipient",
    token: "burnToken",
  },
  isDeposit: true,
};

const withdrawParamsV2: PartialContractEventParams = {
  target: "",
  topic: "MintAndWithdraw(address,uint256,address,uint256)",
  abi: [
    "event MintAndWithdraw(address indexed mintRecipient, uint256 amount, address indexed mintToken, uint256 feeCollected)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "amount",
    to: "mintRecipient",
    from: "mintRecipient",
    token: "mintToken",
  },
  isDeposit: false,
};


const constructParams = (chain: Chain) => {
  const eventParams: PartialContractEventParams[] = [];

  const chainConfigV1 = contractsV1[chain as SupportedChainsV1];
  if (chainConfigV1) {
    eventParams.push({ ...depositParamsV1, target: chainConfigV1.TokenMessenger });
    eventParams.push({ ...withdrawParamsV1, target: chainConfigV1.TokenMessenger });
  }

  const chainConfigV2 = contractsV2[chain as SupportedChainsV2];
  if (chainConfigV2) {
    eventParams.push({ ...depositParamsV2, target: chainConfigV2.TokenMessengerV2 });
    eventParams.push({ ...withdrawParamsV2, target: chainConfigV2.TokenMessengerV2 });
  }

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("circle", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  optimism: constructParams("optimism"),
  polygon: constructParams("polygon"),
  base: constructParams("base"),
  arbitrum: constructParams("arbitrum"),
  avalanche: constructParams("avax"),
  monad: constructParams("monad"),
  unichain: constructParams("unichain"),
  linea: constructParams("linea"),
  codex: constructParams("codex"),
  sonic: constructParams("sonic"),
  wc: constructParams("wc"),
  sei: constructParams("sei"),
  xdc: constructParams("xdc"),
  hyperliquid: constructParams("hyperliquid"),
  ink: constructParams("ink"),
};

export default adapter;
