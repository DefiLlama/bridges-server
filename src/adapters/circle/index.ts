import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

/*
https://developers.circle.com/stablecoins/docs/evm-smart-contracts
*/

const contracts = {
  ethereum: { TokenMessenger: "0xBd3fa81B58Ba92a82136038B25aDec7066af3155" },
  optimism: { TokenMessenger: "0x2B4069517957735bE00ceE0fadAE88a26365528f" },
  polygon: { TokenMessenger: "0x9daF8c91AEFAE50b9c0E69629D3F6Ca40cA3B3FE" },
  base: { TokenMessenger: "0x1682Ae6375C4E4A97e4B583BC394c861A46D8962" },
  arbitrum: { TokenMessenger: "0x19330d10D9Cc8751218eaf51E8885D058642E08A" },
  avalanche: { TokenMessenger: "0x6B25532e1060CE10cc3B0A99e5683b91BFDe6982" },
} as const;
type SupportedChains = keyof typeof contracts;

const depositParams: PartialContractEventParams = {
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

const withdrawParams: PartialContractEventParams = {
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

const constructParams = (chain: Chain) => {

  const chainConfig = contracts[chain as SupportedChains];

  const eventParams: PartialContractEventParams[] = [
    { ...depositParams, target: chainConfig.TokenMessenger },
    { ...withdrawParams, target: chainConfig.TokenMessenger }
  ];

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("circle", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  optimism: constructParams("optimism"),
  polygon: constructParams("polygon"),
  base: constructParams("base"),
  arbitrum: constructParams("arbitrum"),
  avalanche: constructParams("avalanche")
};

export default adapter;
