import { BridgeAdapter, ContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const PROJECT_NAME = "pepeteam-bridge";

enum Chain {
  Ethereum = "ethereum",
  BSC = "bsc",
  Polygon = "polygon",
}

const contractAddresses = {
  [Chain.Ethereum]: {
    coin: "0x882260324AD5A87bF5007904B4A8EF87023c856A",
    erc20: "0x0de7b091A21BD439bdB2DfbB63146D9cEa21Ea83",
  },
  [Chain.BSC]: {
    coin: "0xF1632012f6679Fcf464721433AFAAe9c11ad9e03",
    erc20: "0x8DF12786EC0E34e60D4c52f9052ba4e536e9367a",
  },
  [Chain.Polygon]: {
    coin: "0xEa3cc73165748AD1Ca76b4d1bA9ebC43fb399018",
    erc20: "0xF57dB884606a0ed589c06320d9004FBeD4f81e4A",
  },
};

const coinPriceAddresses = {
  [Chain.Ethereum]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  [Chain.BSC]: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
  [Chain.Polygon]: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
}

const lockCoinEVMEventParams = (chain: Chain): ContractEventParams => {
  return {
    target: contractAddresses[chain].coin,
    topic: "LockTokens(uint16,uint256,string,uint256,string,uint256,uint256)",
    abi: ["event LockTokens(uint16 feeChainId, uint256 amount, string recipient, uint256 gaslessReward, string referrer, uint256 referrerFee, uint256 fee)"],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      to: "recipient",
      amount: "amount",
    },
    fixedEventData: {
      from: "",
      token: coinPriceAddresses[chain]
    },
    isDeposit: true,
  };
};

const releaseCoinEVMEventParams = (chain: Chain): ContractEventParams => {
  return {
    target: contractAddresses[chain].coin,
    topic: "ReleaseTokens(uint256,address,uint256,address)",
    abi: ["event ReleaseTokens(uint256 amount, address recipient, uint256 gaslessReward, address caller)"],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      to: "recipient",
      amount: "amount",
    },
    fixedEventData: {
      from: "",
      token: coinPriceAddresses[chain]
    },
    isDeposit: false,
  };
};

const lockERC20EVMEventParams = (chain: Chain): ContractEventParams => {
  return {
    target: contractAddresses[chain].erc20,
    topic: "LockTokens(uint16,address,uint256,string,uint256,string,uint256,uint256)",
    abi: ["event LockTokens(uint16 feeChainId, address token, uint256 amount, string recipient, uint256 gaslessReward, string referrer, uint256 referrerFee, uint256 fee)"],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      to: "recipient",
      amount: "amount",
      token: "token",
    },
    fixedEventData: {
      from: "",
    },
    isDeposit: true,
  };
};

const releaseERC20EVMEventParams = (chain: Chain): ContractEventParams => {
  return {
    target: contractAddresses[chain].erc20,
    topic: "ReleaseTokens(address,uint256,address,uint256,address)",
    abi: ["event ReleaseTokens(address token, uint256 amount, address recipient, uint256 gaslessReward, address caller)"],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      to: "recipient",
      amount: "amount",
      token: "token",
    },
    fixedEventData: {
      from: "",
    },
    isDeposit: false,
  };
};

const constructEvmParams = (chain: Chain): ContractEventParams[] => [lockCoinEVMEventParams(chain), releaseCoinEVMEventParams(chain), lockERC20EVMEventParams(chain), releaseERC20EVMEventParams(chain)]

const constructParams = (chain: Chain) => {
  let eventParams: ContractEventParams[] = constructEvmParams(chain);

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs(PROJECT_NAME, chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  [Chain.Ethereum]: constructParams(Chain.Ethereum),
  [Chain.BSC]: constructParams(Chain.BSC),
  [Chain.Polygon]: constructParams(Chain.Polygon),
};

export default adapter;
