import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

export const bridgesAddress = {
  ethereum: "0x20A41749545eB0C6266838257aDeA7b86d5369Ac",
  optimism: "0x0C4F10259c8b5Ed7238B76A0a6EfEf82cd2908Bf",
  arbitrum: "0x97450C9B5fC6D1b86bF87EFDCbB137f26F8b497e",
  scroll: "0xcAebc3309bFe45313922BFBa1a36C4458937E2A2",
  base: "0x8A7Ee008B18DF025bc778B034Dbd7ad507221e10",
  linea: "0xbe7F97E4B54747B75B8aaF84ecafE876BaCA9198",
  taiko: "0x7a651Ef5A53B128d406c9093feA2650e8A6156b5",
  morph: "0x56DE23ed536b2Bf8D398F2E1703Ce9aDb48B09F4",
  era: "0xaFDaD3F10c7c906434422F229bCfB120bcE51C6c",
  unichain: "0x81505846153403EBd6Cf5e89dD9f3eF2277fe374",
  megaeth: "0x554590DC69830507248Ebc7AD3Bc9d6fA94488d2",
} as const;

type SupportedBridgeChains = keyof typeof bridgesAddress;

export const cctpBridgeAddress = {
  ethereum: {
    bridge: "0x2dC80114D923dA07327b7096226359D785F32e3F",
    tokenMessanger: "0xBd3fa81B58Ba92a82136038B25aDec7066af3155"
  },
  optimism: {
    bridge: "0xe8105d442EaD594fb05D6bE20d9813c8b7b974bD",
    tokenMessanger: "0x2B4069517957735bE00ceE0fadAE88a26365528f"
  },
  arbitrum: {
    bridge: "0xBc0E277204f85d3924577FF2b0E50e67051B3E62",
    tokenMessanger: "0x19330d10D9Cc8751218eaf51E8885D058642E08A"
  },
  base: {
    bridge: "0xE33Bf689B53ae461bd253617B60408227182362b",
    tokenMessanger: "0x1682Ae6375C4E4A97e4B583BC394c861A46D8962"
  },
  unichain: {
    bridge: "0x9476A404191a52aD48C0F486584fA8FdAD6f5cae",
    tokenMessanger: "0x8ed94B8dAd2Dc5453862ea5e316A8e71AAed9782"
  },
} as const;

type SupportedCctpBridgeChains = keyof typeof cctpBridgeAddress;

export const swapsAddress = {
  arbitrum: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  aurora: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  avax: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  base: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  blast: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  bsc: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  boba: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  celo: "0x7956c6EaEA7cAb8cd6C3221aBE3425c7e07133d9",
  cronos: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  ethereum: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  fantom: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  filecoin: "f410f7sogw3qnalvn4n5mrnwftzyyc4taovuwgxnypuq",
  fraxtal: "0x7956c6EaEA7cAb8cd6C3221aBE3425c7e07133d9",
  xdai: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  gravity: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  immutable_zkevm: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  kava: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  linea: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  lisk: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  mantle: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  metis: "0x7956c6EaEA7cAb8cd6C3221aBE3425c7e07133d9",
  mode: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  moonbeam: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  moonriver: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  optimism: "0x7956c6EaEA7cAb8cd6C3221aBE3425c7e07133d9",
  polygon: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  polygon_zkevm: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  scroll: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  sei: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  taiko: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
  wc: "0xfC9C6B6e0D02EaDE37aC8b6c59e7181726075696",
} as const;

type SupportedSwapChains = keyof typeof swapsAddress;

const RELAYER_ADDRESS = '0x1650683e50e075EFC778Be4D1A6bE929F3831719';

const bridgeNewTradeDepositParams = (chain: SupportedBridgeChains) => {
  const bridgeAddress = bridgesAddress[chain];

  // from user to bridge
  return {
    target: bridgeAddress,
    topic: "NewTrade(address,uint256,address,uint256,address)",
    abi: ["event NewTrade(address indexed userAddress, uint256 index, address to, uint256 amount, address token)"],
    isDeposit: true,
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      from: "userAddress",
      amount: "amount",
    },
    fixedEventData: {
      to: bridgeAddress,
    },
  };
};

const bridgeWithdrawParams = (chain: SupportedBridgeChains): PartialContractEventParams => {
  const bridgeAddress = bridgesAddress[chain];

  // from bridge to relayer
  return {
    target: bridgeAddress,
    topic: "Withdraw(address,bytes32,uint256,address,uint256,address)",
    abi: ["event Withdraw(address indexed userAddress,bytes32 indexed txHash,uint256 index,address to,uint256 amount,address token)"],
    isDeposit: false,
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      amount: "amount",
    },
    fixedEventData: {
      from: bridgeAddress,
      to: RELAYER_ADDRESS,
    },
  };
};

const bridgeAcceptDepositParams = (chain: SupportedBridgeChains): PartialContractEventParams => {
  const bridgeAddress = bridgesAddress[chain];

  // from relayer to bridge
  return {
    target: bridgeAddress,
    topic: "Accept(address,uint256,address,uint256,address)",
    abi: [
      "event Accept(address indexed userAddress, bytes32 indexed txHash, uint256 index,address to,uint256 amount,address token)",
    ],
    isDeposit: true,
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      amount: "amount",
    },
    fixedEventData: {
      to: bridgeAddress,
      from: RELAYER_ADDRESS,
    },
  };
};

const bridgeAcceptWithdrawParams = (chain: SupportedBridgeChains): PartialContractEventParams => {
  const bridgeAddress = bridgesAddress[chain];

  // from bridge to to user
  return {
    target: bridgeAddress,
    topic: "Accept(address,uint256,address,uint256,address)",
    abi: [
      "event Accept(address indexed userAddress, bytes32 indexed txHash, uint256 index,address to,uint256 amount,address token)",
    ],
    isDeposit: false,
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      to: "to",
      amount: "amount",
    },
    fixedEventData: {
      from: bridgeAddress,
    },
  };
};

const cctpDepositParams = (chain: SupportedCctpBridgeChains): PartialContractEventParams => {
  const bridgeAddress = cctpBridgeAddress[chain].bridge;


  // from user to bridge child
  return {
    target: bridgeAddress,
    topic: "DepositForBurnCalled(address,bytes32,uint32,uint256,uint256,address)",
    abi: ["event DepositForBurnCalled(address indexed sender,bytes32 indexed recipient,uint32 indexed destinationDomain,uint256 index,uint256 amount,address token)"],
    isDeposit: true,
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      from: "sender",
      amount: "amount",
    },
    fixedEventData: {
      to: bridgeAddress,
    },
  };
};

const cctpWithdrawParams = (chain: SupportedCctpBridgeChains): PartialContractEventParams => {
  const bridgeAddress = cctpBridgeAddress[chain].bridge;
  const tokenMessanger = cctpBridgeAddress[chain].tokenMessanger;

  // from bridge child to tokenMessanger
  return {
    target: bridgeAddress,
    topic: "DepositForBurnCalled(address,bytes32,uint32,uint256,uint256,address)",
    abi: ["event DepositForBurnCalled(address indexed sender,bytes32 indexed recipient,uint32 indexed destinationDomain,uint256 index,uint256 amount,address token)"],
    isDeposit: false,
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      amount: "amount",
    },
    fixedEventData: {
      from: bridgeAddress,
      to: tokenMessanger,
    },
  };
};

const swapDepositParams = (chain: SupportedSwapChains): PartialContractEventParams => {
  const swapAddress = swapsAddress[chain];

  // from user to PheasantSwap contract
  return {
    target: swapAddress,
    topic: "SwapNewTrade(address,address,(string,uint16,address,address,uint256,uint256,uint256))",
    abi: [
      "event SwapNewTrade(address indexed userAddress, address indexed token, tuple(string toChainId, uint16 swapToolIndex, address toolContract, address toToken, uint256 amount, uint256 relayerFee, uint256 timestamp) trade)",
    ],
    isDeposit: true,
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      from: "userAddress",
      amount: "trade.amount",
    },
    fixedEventData: {
      to: swapAddress,
    },
  };
};

const swapWithdrawParams = (chain: SupportedSwapChains): PartialContractEventParams => {
  const swapAddress = swapsAddress[chain];

  // from PheasantSwap contract to aggregator contract
  return {
    target: swapAddress,
    topic: "SwapNewTrade(address,address,(string,uint16,address,address,uint256,uint256,uint256))",
    abi: [
      "event SwapNewTrade(address indexed userAddress, address indexed token, tuple(string toChainId, uint16 swapToolIndex, address toolContract, address toToken, uint256 amount, uint256 relayerFee, uint256 timestamp) trade)",
    ],
    isDeposit: false,
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      amount: "trade.amount",
      to: "trade.toolContract",
    },
    fixedEventData: {
      from: swapAddress
    },
  };
};

const constructParams = (chain: string) => {
  //   const eventParams = [bridgeDepositParams(chain), bridgeWithdrawParams(chain)];
  const eventParams: PartialContractEventParams[] = [];

  if (chain in bridgesAddress) {
    eventParams.push(
      // L2<->L2 / L2->L1
      bridgeNewTradeDepositParams(chain as SupportedBridgeChains),
      bridgeWithdrawParams(chain as SupportedBridgeChains),
      // L1->L2
      bridgeAcceptDepositParams(chain as SupportedBridgeChains),
      bridgeAcceptWithdrawParams(chain as SupportedBridgeChains)
    );
  }

  if (chain in cctpBridgeAddress) {
    eventParams.push(
      cctpDepositParams(chain as SupportedCctpBridgeChains),
      cctpWithdrawParams(chain as SupportedCctpBridgeChains)
    );
  }

  if (chain in swapsAddress) {
    eventParams.push(
      swapDepositParams(chain as SupportedSwapChains),
      swapWithdrawParams(chain as SupportedSwapChains)
    );
  }

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("pheasant-network", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  // optimism: constructParams("optimism"),
  arbitrum: constructParams("arbitrum"),
  aurora: constructParams("aurora"),
  avalanche: constructParams("avax"),
  base: constructParams("base"),
  blast: constructParams("blast"),
  bsc: constructParams("bsc"),
  boba: constructParams("boba"),
  celo: constructParams("celo"),
  cronos: constructParams("cronos"),
  ethereum: constructParams("ethereum"),
  fantom: constructParams("fantom"),
  filecoin: constructParams("filecoin"),
  fraxtal: constructParams("fraxtal"),
  gnosis: constructParams("xdai"),
  gravity: constructParams("gravity"),
  "immutable zkevm": constructParams("imx"),
  kava: constructParams("kava"),
  linea: constructParams("linea"),
  lisk: constructParams("lisk"),
  mantle: constructParams("mantle"),
  megaeth: constructParams("megaeth"),
  metis: constructParams("metis"),
  mode: constructParams("mode"),
  moonbeam: constructParams("moonbeam"),
  moonriver: constructParams("moonriver"),
  morph: constructParams("morph"),
  optimism: constructParams("optimism"),
  polygon: constructParams("polygon"),
  "polygon zkevm": constructParams("polygon_zkevm"),
  scroll: constructParams("scroll"),
  sei: constructParams("sei"),
  taiko: constructParams("taiko"),
  unichain: constructParams("unichain"),
  "World Chain": constructParams("wc"),
  "zksync era": constructParams("era"),
};

export default adapter;
