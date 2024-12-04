import { BridgeAdapter, ContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const contracts = {
  ethereum: "0x3762A79B34DfB6774CFd45dBf5FD9A2780873783",
  arbitrum: "0x5f77b1Fe53ba406B0ac3EF10c007A7b16e9F04F6",
  optimism: "0x5535df3a1f2b2Ce2Eb3b6673638833420bc79CAd",
  base: "0x73791161B3D3A6FEdF2b17Fb79810b277C5ce517",
  bsc: "0x9cEA88Ee39b6cc09C478942Bbf83bfa77d87B5f3",
  polygon: "0xDE5af64Abc426d63C3BcF13D8f672948227A745a",
  avax: "0xDE5af64Abc426d63C3BcF13D8f672948227A745a",
  linea: "0xDE5af64Abc426d63C3BcF13D8f672948227A745a",
  merlin: "0xDE5af64Abc426d63C3BcF13D8f672948227A745a",
  blast: "0xDE5af64Abc426d63C3BcF13D8f672948227A745a",
  manta: "0xDE5af64Abc426d63C3BcF13D8f672948227A745a",
  mode: "0xDE5af64Abc426d63C3BcF13D8f672948227A745a",
  // "solana": "BuuP1rJXnVs5GHSPoUxLqeQzV4nBXQ7RFAJ7j4rt6jEk",
};

type SupportedChains = keyof typeof contracts;

const depositEventParams: ContractEventParams = {
  target: "",
  topic: "Deposited(address,uint256,address)",
  abi: ["event Deposited(address indexed user, uint256 amount, address tokenAddress)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "user",
    amount: "amount",
    token: "tokenAddress",
  },
  isDeposit: true,
};

const releaseEventParams: ContractEventParams = {
  target: "",
  topic: "Released(address,uint256,address)",
  abi: ["event Released(address indexed recipient, uint256 amount, address tokenAddress)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "recipient",
    amount: "amount",
    token: "tokenAddress",
  },
  isDeposit: false,
};

const refundEventParams: ContractEventParams = {
  target: "",
  topic: "Refunded(address,uint256,address)",
  abi: ["event Refunded(address indexed recipient, uint256 amount, address tokenAddress)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "recipient",
    amount: "amount",
    token: "tokenAddress",
  },
  isDeposit: false,
};

const constructParams = (chain: SupportedChains) => {
  const eventParams: ContractEventParams[] = [
    {
      ...depositEventParams,
      target: contracts[chain],
      fixedEventData: {
        to: contracts[chain],
      },
    },
    { ...releaseEventParams, target: contracts[chain], fixedEventData: { from: contracts[chain] } },
    { ...refundEventParams, target: contracts[chain], fixedEventData: { from: contracts[chain] } },
  ];

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("universalx", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
  base: constructParams("base"),
  bsc: constructParams("bsc"),
  polygon: constructParams("polygon"),
  avalanche: constructParams("avax"),
  linea: constructParams("linea"),
  merlin: constructParams("merlin"),
  blast: constructParams("blast"),
  manta: constructParams("manta"),
  mode: constructParams("mode"),
};

export default adapter;
