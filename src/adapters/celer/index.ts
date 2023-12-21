import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";

/*
***Ethereum***
0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820 is cBridge: V2 (pool-based)
0xB37D31b2A74029B5951a2778F959282E2D518595 is OriginalTokenVault
0x7510792A3B1969F9307F3845CE88e39578f2bAE1 is OriginalTokenVaultV2
0x16365b45EB269B5B5dACB34B4a15399Ec79b95eB is PeggedTokenBridge
0x52E4f244f380f8fA51816c8a10A63105dd4De084 is PeggedTokenBridgeV2
0x6065a982f04f759b7d2d042d2864e569fad84214 is CircleBridgeProxy

***Polygon***
0x88DCDC47D2f83a99CF0000FDF667A468bB958a78 is Celer Network: cBridge (pool-based)
0xc1a2D967DfAa6A10f3461bc21864C23C1DD51EeA is OriginalTokenVault
0x4C882ec256823eE773B25b414d36F92ef58a7c0C is OriginalTokenVaultV2
0x4d58FDC7d0Ee9b674F49a0ADE11F26C3c9426F7A is PeggedTokenBridge
0xb51541df05DE07be38dcfc4a80c05389A54502BB is PeggedTokenBridgeV2
0xB876cc05c3C3C8ECBA65dAc4CF69CaF871F2e0DD is CircleBridgeProxy

***Fantom***
0x374B8a9f3eC5eB2D97ECA84Ea27aCa45aa1C57EF is Celer Network: cBridge (pool-based)
0x7D91603E79EA89149BAf73C9038c51669D8F03E9 is OriginalTokenVault
0x38D1e20B0039bFBEEf4096be00175227F8939E51 is PeggedTokenBridge
0x30F7Aa65d04d289cE319e88193A33A8eB1857fb9 is PeggedTokenBridgeV2

***Avalanche***
0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4 is Celer Network: cBridge (pool-based)
0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820 is OriginalTokenVault
0xb51541df05DE07be38dcfc4a80c05389A54502BB is OriginalTokenVaultV2
0x88DCDC47D2f83a99CF0000FDF667A468bB958a78 is PeggedTokenBridge
0xb774C6f82d1d5dBD36894762330809e512feD195 is PeggedTokenBridgeV2
0x9744ae566c64B6B6f7F9A4dD50f7496Df6Fef990 is CircleBridgeProxy

***BSC***
0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF is Celer Network: cBridge 2.0 (pool-based)
0x78bc5Ee9F11d133A08b331C2e18fE81BE0Ed02DC is OriginalTokenVault
0x11a0c9270D88C99e221360BCA50c2f6Fda44A980 is OriginalTokenVaultV2
0xd443FE6bf23A4C9B78312391A30ff881a097580E is PeggedTokenBridge
0x26c76F7FeF00e02a5DD4B5Cc8a0f717eB61e1E4b is PeggedTokenBridgeV2

***Arbitrum***
0x1619DE6B6B20eD217a58d00f37B9d47C7663feca is Celer Network: cBridge (pool-based)
0xFe31bFc4f7C9b69246a6dc0087D91a91Cb040f76 is OriginalTokenVault
0xEA4B1b0aa3C110c55f650d28159Ce4AD43a4a58b is OriginalTokenVaultV2
0xbdd2739AE69A054895Be33A22b2D2ed71a1DE778 is PeggedTokenBridge
0x054B95b60BFFACe948Fa4548DA8eE2e212fb7C0a is CircleBridgeProxy

***Optimism***
0x9D39Fc627A6d9d9F8C831c16995b209548cc3401 is Celer Network: cBridge (pool-based)
0xbCfeF6Bb4597e724D720735d32A9249E0640aA11 is OriginalTokenVault
0x61f85fF2a2f4289Be4bb9B72Fc7010B3142B5f41 is PeggedTokenBridge
0x697aC93c9263346c5Ad0412F9356D5789a3AA687 is CircleBridgeProxy

***Gnosis***
0x3795C36e7D12A8c252A20C5a7B455f7c57b60283 is Celer Network: cBridge 2.0 (pool-based)
0xd4c058380D268d85bC7c758072f561e8f2dB5975 is PeggedTokenBridge

***Aurora***
0x841ce48F9446C8E281D3F1444cB859b4A6D0738C is Celer Network: cBridge 2.0 (pool-based)
0xbCfeF6Bb4597e724D720735d32A9249E0640aA11 is OriginalTokenVaultV2
0x4384d5a9D7354C65cE3aee411337bd40493Ad1bC is PeggedTokenBridge
0xbdd2739AE69A054895Be33A22b2D2ed71a1DE778 is PeggedTokenBridgeV2

***Celo***
0xBB7684Cc5408F4DD0921E5c2Cadd547b8f1AD573 is Celer Network: cBridge 2.0 (pool-based)
0xDA1DD66924B0470501aC7736372d4171cDd1162E is PeggedTokenBridge

***Klaytn***
0x4c882ec256823ee773b25b414d36f92ef58a7c0c is Celer Network: cBridge 2.0 (pool-based)
0xb3833Ecd19D4Ff964fA7bc3f8aC070ad5e360E56 is PeggedTokenBridgeV2

***zkSync Era***
0x54069e96C4247b37C2fbd9559CA99f08CD1CD66c is Celer Network: cBridge 2.0 (pool-based)

***Polygon zkEVM***
0xD46F8E428A06789B5884df54E029e738277388D1 is Celer Network: cBridge 2.0 (pool-based)

***Linea***
0x9B36f165baB9ebe611d491180418d8De4b8f3a1f is Celer Network: cBridge 2.0 (pool-based)

***Scroll***
0x9B36f165baB9ebe611d491180418d8De4b8f3a1f is Celer Network: cBridge 2.0 (pool-based)

***Base***
0x243b40e96c6bF21511E53d85c86F6Ec982f9a879 is CircleBridgeProxy
*/

const contractAddresses = {
  ethereum: {
    poolV2: ["0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820"],
    vaultV1: ["0xB37D31b2A74029B5951a2778F959282E2D518595"],
    vaultV2: ["0x7510792A3B1969F9307F3845CE88e39578f2bAE1"],
    peggedV1: ["0x16365b45EB269B5B5dACB34B4a15399Ec79b95eB"],
    peggedV2: ["0x52E4f244f380f8fA51816c8a10A63105dd4De084"],
    celerCCTP: ["0x6065a982f04f759b7d2d042d2864e569fad84214"],
  },
  polygon: {
    poolV1: ["0x88DCDC47D2f83a99CF0000FDF667A468bB958a78"],
    vaultV1: ["0xc1a2D967DfAa6A10f3461bc21864C23C1DD51EeA"],
    vaultV2: ["0x4C882ec256823eE773B25b414d36F92ef58a7c0C"],
    peggedV1: ["0x4d58FDC7d0Ee9b674F49a0ADE11F26C3c9426F7A"],
    peggedV2: ["0xb51541df05DE07be38dcfc4a80c05389A54502BB"],
    celerCCTP: ["0xB876cc05c3C3C8ECBA65dAc4CF69CaF871F2e0DD"],
  },
  fantom: {
    poolV1: ["0x374B8a9f3eC5eB2D97ECA84Ea27aCa45aa1C57EF"],
    vaultV1: ["0x7D91603E79EA89149BAf73C9038c51669D8F03E9"],
    peggedV1: ["0x38D1e20B0039bFBEEf4096be00175227F8939E51"],
    peggedV2: ["0x30F7Aa65d04d289cE319e88193A33A8eB1857fb9"],
  },
  avax: {
    poolV1: ["0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4"],
    vaultV1: ["0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820"],
    vaultV2: ["0xb51541df05DE07be38dcfc4a80c05389A54502BB"],
    peggedV1: ["0x88DCDC47D2f83a99CF0000FDF667A468bB958a78"],
    peggedV2: ["0xb774C6f82d1d5dBD36894762330809e512feD195"],
    celerCCTP: ["0x9744ae566c64B6B6f7F9A4dD50f7496Df6Fef990"],
  },
  bsc: {
    poolV1: ["0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF"],
    vaultV1: ["0x78bc5Ee9F11d133A08b331C2e18fE81BE0Ed02DC"],
    vaultV2: ["0x11a0c9270D88C99e221360BCA50c2f6Fda44A980"],
    peggedV1: ["0xd443FE6bf23A4C9B78312391A30ff881a097580E"],
    peggedV2: ["0x26c76F7FeF00e02a5DD4B5Cc8a0f717eB61e1E4b"],
  },
  arbitrum: {
    poolV1: ["0x1619DE6B6B20eD217a58d00f37B9d47C7663feca"],
    vaultV1: ["0xFe31bFc4f7C9b69246a6dc0087D91a91Cb040f76"],
    vaultV2: ["0xEA4B1b0aa3C110c55f650d28159Ce4AD43a4a58b"],
    peggedV1: ["0xbdd2739AE69A054895Be33A22b2D2ed71a1DE778"],
    celerCCTP: ["0x054B95b60BFFACe948Fa4548DA8eE2e212fb7C0a"],
  },
  optimism: {
    poolV1: ["0x9D39Fc627A6d9d9F8C831c16995b209548cc3401"],
    vaultV1: ["0xbCfeF6Bb4597e724D720735d32A9249E0640aA11"],
    peggedV1: ["0x61f85fF2a2f4289Be4bb9B72Fc7010B3142B5f41"],
    celerCCTP: ["0x697aC93c9263346c5Ad0412F9356D5789a3AA687"],
  },
  xdai: {
    poolV2: ["0x3795C36e7D12A8c252A20C5a7B455f7c57b60283"],
    peggedV1: ["0xd4c058380D268d85bC7c758072f561e8f2dB5975"],
  },
  aurora: {
    poolV2: ["0x841ce48F9446C8E281D3F1444cB859b4A6D0738C"],
    vaultV2: ["0xbCfeF6Bb4597e724D720735d32A9249E0640aA11"],
    peggedV1: ["0x4384d5a9D7354C65cE3aee411337bd40493Ad1bC"],
    peggedV2: ["0xbdd2739AE69A054895Be33A22b2D2ed71a1DE778"],
  },
  celo: {
    poolV2: ["0xBB7684Cc5408F4DD0921E5c2Cadd547b8f1AD573"],
    peggedV1: ["0xDA1DD66924B0470501aC7736372d4171cDd1162E"],
  },
  klaytn: {
    poolV2: ["0x4c882ec256823ee773b25b414d36f92ef58a7c0c"],
    peggedV2: ["0xb3833Ecd19D4Ff964fA7bc3f8aC070ad5e360E56"],
  },
  era: {
    poolV2: ["0x54069e96C4247b37C2fbd9559CA99f08CD1CD66c"],
  },
  polygon_zkevm: {
    poolV2: ["0xD46F8E428A06789B5884df54E029e738277388D1"],
  },
  linea: {
    poolV2: ["0x9B36f165baB9ebe611d491180418d8De4b8f3a1f"],
  },
  scroll: {
    poolV2: ["0x9B36f165baB9ebe611d491180418d8De4b8f3a1f"],
  },
  base: {
    celerCCTP: ["0x243b40e96c6bF21511E53d85c86F6Ec982f9a879"],
  }
} as {
  [chain: string]: {
    poolV1?: string[];
    poolV2?: string[];
    vaultV1?: string[];
    vaultV2?: string[];
    peggedV1?: string[];
    peggedV2?: string[];
    celerCCTP?: string[];
  };
};

const poolV1WithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "Relay(bytes32,address,address,address,uint256,uint64,bytes32)",
  abi: [
    "event Relay(bytes32 transferId, address sender, address receiver, address token, uint256 amount, uint64 srcChainId, bytes32 srcTransferId)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    amount: "amount",
    to: "receiver",
  },
  fixedEventData: {
    from: "",
  },
  isDeposit: false,
};

const poolV2WithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "Relay(bytes32,address,address,address,uint256,uint64,bytes32)",
  abi: [
    "event Relay(bytes32 transferId, address sender, address receiver, address token, uint256 amount, uint64 srcChainId, bytes32 srcTransferId)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    amount: "amount",
    to: "receiver",
  },
  fixedEventData: {
    from: "",
  },
  isDeposit: false,
};

const poolDepositParams: PartialContractEventParams = {
  target: "",
  topic: "Send(bytes32,address,address,address,uint256,uint64,uint64,uint32)",
  abi: [
    "event Send(bytes32 transferId, address sender, address receiver, address token, uint256 amount, uint64 dstChainId, uint64 nonce, uint32 maxSlippage)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    amount: "amount",
    from: "sender",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: true,
};

const tokenVaultWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "Withdrawn(bytes32,address,address,uint256,uint64,bytes32,address)",
  abi: [
    "event Withdrawn(bytes32 withdrawId, address receiver, address token, uint256 amount, uint64 refChainId, bytes32 refId, address burnAccount)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    amount: "amount",
    to: "receiver",
  },
  fixedEventData: {
    from: "",
  },
  isDeposit: false,
};

const tokenVaultV1DepositParams: PartialContractEventParams = {
  target: "",
  topic: "Deposited(bytes32,address,address,uint256,uint64,address)",
  abi: [
    "event Deposited(bytes32 depositId, address depositor, address token, uint256 amount, uint64 mintChainId, address mintAccount)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    amount: "amount",
    from: "depositor",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: true,
};

const tokenVaultV2DepositParams: PartialContractEventParams = {
  target: "",
  topic: "Deposited(bytes32,address,address,uint256,uint64,address,uint64)",
  abi: [
    "event Deposited(bytes32 depositId, address depositor, address token, uint256 amount, uint64 mintChainId, address mintAccount, uint64 nonce)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    amount: "amount",
    from: "depositor",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: true,
};

const peggedWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "Mint(bytes32,address,address,uint256,uint64,bytes32,address)",
  abi: [
    "event Mint(bytes32 mintId, address token, address account, uint256 amount, uint64 refChainId, bytes32 refId, address depositor)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    amount: "amount",
    to: "account",
  },
  fixedEventData: {
    from: "",
  },
  isDeposit: false,
};

const peggedV1DepositParams: PartialContractEventParams = {
  target: "",
  topic: "Burn(bytes32,address,address,uint256,address)",
  abi: ["event Burn(bytes32 burnId, address token, address account, uint256 amount, address withdrawAccount)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    amount: "amount",
    from: "account",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: true,
};

const peggedV2DepositParams: PartialContractEventParams = {
  target: "",
  topic: "Burn(bytes32,address,address,uint256,uint64,address,uint64)",
  abi: [
    "event Burn(bytes32 burnId, address token, address account, uint256 amount, uint64 toChainId, address toAccount, uint64 nonce)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    amount: "amount",
    from: "account",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: true,
};

// CCTP Deposit 
const cctpDepositParams: PartialContractEventParams = {
  target: "",
  topic: "Deposited(address,bytes32,uint64,uint256,uint256,uint256,uint64)",
  abi: [
    "event Deposited(address sender, bytes32 recipient, uint64 dstChid, uint256 amount, uint256 txFee, uint256 percFee, uint64 nonce)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "amount",
    from: "sender",
  },
  fixedEventData: {
    to: "",
  },
  inputDataExtraction: {
    inputDataABI: [
      "function depositForBurn(uint256 _amount, uint64 _dstChid, bytes32 _mintRecipient, address _burnToken)",
    ],
    inputDataFnName: "depositForBurn",
    inputDataKeys: {
      token: "_burnToken",
    },
  },
  isDeposit: true,
};

// TODO: needs refactoring, obviously
const constructParams = (chain: string) => {
  let eventParams = [] as any;
  const chainAddresses = contractAddresses[chain];
  if (chainAddresses.poolV1) {
    chainAddresses.poolV1.map((address: string) => {
      const finalPoolV1WithdrawalParams = {
        ...poolV1WithdrawalParams,
        target: address,
        fixedEventData: {
          from: address,
        },
      };
      const finalPoolDepositParams = {
        ...poolDepositParams,
        target: address,
        fixedEventData: {
          to: address,
        },
      };
      eventParams.push(finalPoolV1WithdrawalParams, finalPoolDepositParams);
    });
  }
  if (chainAddresses.poolV2) {
    chainAddresses.poolV2.map((address: string) => {
      const finalPoolV2WithdrawalParams = {
        ...poolV2WithdrawalParams,
        target: address,
        fixedEventData: {
          from: address,
        },
      };
      const finalPoolDepositParams = {
        ...poolDepositParams,
        target: address,
        fixedEventData: {
          to: address,
        },
      };
      eventParams.push(finalPoolV2WithdrawalParams, finalPoolDepositParams);
    });
  }
  if (chainAddresses.vaultV1) {
    chainAddresses.vaultV1.map((address: string) => {
      const finalVaultWithdrawalParams = {
        ...tokenVaultWithdrawalParams,
        target: address,
        fixedEventData: {
          from: address,
        },
      };
      const finalVaultV1DepositParams = {
        ...tokenVaultV1DepositParams,
        target: address,
        fixedEventData: {
          to: address,
        },
      };
      eventParams.push(finalVaultWithdrawalParams, finalVaultV1DepositParams);
    });
  }
  if (chainAddresses.vaultV2) {
    chainAddresses.vaultV2.map((address: string) => {
      const finalVaultWithdrawalParams = {
        ...tokenVaultWithdrawalParams,
        target: address,
        fixedEventData: {
          from: address,
        },
      };
      const finalVaultV2DepositParams = {
        ...tokenVaultV2DepositParams,
        target: address,
        fixedEventData: {
          to: address,
        },
      };
      eventParams.push(finalVaultWithdrawalParams, finalVaultV2DepositParams);
    });
  }
  if (chainAddresses.peggedV1) {
    chainAddresses.peggedV1.map((address: string) => {
      const finalPeggedWithdrawalParams = {
        ...peggedWithdrawalParams,
        target: address,
        fixedEventData: {
          from: address,
        },
      };
      const finalPeggedV1DepositParams = {
        ...peggedV1DepositParams,
        target: address,
        fixedEventData: {
          to: address,
        },
      };
      eventParams.push(finalPeggedWithdrawalParams, finalPeggedV1DepositParams);
    });
  }
  if (chainAddresses.peggedV2) {
    chainAddresses.peggedV2.map((address: string) => {
      const finalPeggedWithdrawalParams = {
        ...peggedWithdrawalParams,
        target: address,
        fixedEventData: {
          from: address,
        },
      };
      const finalPeggedV2DepositParams = {
        ...peggedV2DepositParams,
        target: address,
        fixedEventData: {
          to: address,
        },
      };
      eventParams.push(finalPeggedWithdrawalParams, finalPeggedV2DepositParams);
    });
  }
  if (chainAddresses.celerCCTP) {
    chainAddresses.celerCCTP.map((address: string) => {
      const finalCCTPDepositParams = {
        ...cctpDepositParams,
        target: address,
        fixedEventData: {
          to: address,
        },
      };
      eventParams.push(finalCCTPDepositParams);
    });
  }
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("celer", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
  gnosis: constructParams("xdai"),
  aurora: constructParams("aurora"),
  celo: constructParams("celo"),
  klaytn: constructParams("klaytn"),
  era: constructParams("era"),
  polygon_zkevm: constructParams("polygon_zkevm"),
  linea: constructParams("linea"),
  scroll: constructParams("scroll"),
  base: constructParams("base"),
};

export default adapter;
