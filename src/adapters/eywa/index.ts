import { BridgeAdapter, ContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

enum Chains {
  arbitrum = "arbitrum",
  bsc = "bsc",
  polygon = "polygon",
  avax = "avax",
  fantom = "fantom",
  ethereum = "ethereum",
  optimism = "optimism",
}

const contractAddresses = {
  [Chains.arbitrum]: {
    portal: "0xBf0b5D561b986809924f88099c4FF0e6BccE60c9",
    synthesis: "0x530aF883f135F135BE12A69DC33296fb8149f593",
  },
  [Chains.bsc]: {
    portal: "0xBf0b5D561b986809924f88099c4FF0e6BccE60c9",
    synthesis: "0x530aF883f135F135BE12A69DC33296fb8149f593",
  },
  [Chains.polygon]: {
    portal: "0xBf0b5D561b986809924f88099c4FF0e6BccE60c9",
    synthesis: "0x530aF883f135F135BE12A69DC33296fb8149f593",
  },
  [Chains.avax]: {
    portal: "0xBf0b5D561b986809924f88099c4FF0e6BccE60c9",
    synthesis: "0x530aF883f135F135BE12A69DC33296fb8149f593",
  },
  [Chains.fantom]: {
    portal: "0xBf0b5D561b986809924f88099c4FF0e6BccE60c9",
    synthesis: "0x530aF883f135F135BE12A69DC33296fb8149f593",
  },
  [Chains.ethereum]: {
    portal: "0xBf0b5D561b986809924f88099c4FF0e6BccE60c9",
    synthesis: "0x530aF883f135F135BE12A69DC33296fb8149f593",
  },
  [Chains.optimism]: {
    portal: "0xBf0b5D561b986809924f88099c4FF0e6BccE60c9",
    synthesis: "0x530aF883f135F135BE12A69DC33296fb8149f593",
  },
};

const depositPortalEventParams: ContractEventParams = {
  target: "",
  topic: "Locked(address,uint256,uint256,address)",
  abi: ["event Locked(address token, uint256 amount, address from, address to)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "from",
    amount: "amount",
    token: "token",
  },
  isDeposit: true,
};

const withdrawalPortalEventParams: ContractEventParams = {
  target: "",
  topic: "Unlocked(address,uint256,address,address)",
  abi: ["event Unlocked(address token, uint256 amount, address from, address to)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "to",
    amount: "amount",
    token: "token",
  },
  isDeposit: false,
};

const burnSynthesisEventParams: ContractEventParams = {
  target: "",
  topic: "Burn(address,uint256,address,address)",
  abi: ["event Burn(address token, uint256 amount, address from, address to)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "from",
    to: "to",
    amount: "amount",
    token: "token",
  },
  isDeposit: true,
};

const moveSynthesisEventParams: ContractEventParams = {
  target: "",
  topic: "Move(address,uint256,address,address,uint64)",
  abi: ["event Move(address token, uint256 amount, address from, address to, uint64 chainIdTo)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "from",
    to: "to",
    amount: "amount",
    token: "token",
  },
  isDeposit: true,
};

const mintSynthesisEventParams: ContractEventParams = {
  target: "",
  topic: "Synthesized(address,uint256,address,address)",
  abi: ["event Synthesized(address token, uint256 amount, address from, address to)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "from",
    to: "to",
    amount: "amount",
    token: "token",
  },
  isDeposit: false,
};

const constructParams = (chain: Chains) => {
  const { portal, synthesis } = contractAddresses[chain];
  const eventParams: ContractEventParams[] = [
    {
      ...depositPortalEventParams,
      target: portal,
      fixedEventData: {
        to: portal,
      },
    },
    {
      ...withdrawalPortalEventParams,
      target: portal,
      fixedEventData: {
        from: portal,
      },
    },
    {
      ...burnSynthesisEventParams,
      target: synthesis,
    },
    {
      ...moveSynthesisEventParams,
      target: synthesis,
    },
    {
      ...mintSynthesisEventParams,
      target: synthesis,
    },
  ];
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("eywa", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  [Chains.arbitrum]: constructParams(Chains.arbitrum),
  [Chains.bsc]: constructParams(Chains.bsc),
  [Chains.polygon]: constructParams(Chains.polygon),
  [Chains.fantom]: constructParams(Chains.fantom),
  [Chains.ethereum]: constructParams(Chains.ethereum),
  [Chains.optimism]: constructParams(Chains.optimism),
  avalanche: constructParams(Chains.avax),
};

export default adapter;
