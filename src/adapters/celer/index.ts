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

***Polygon***
0x88DCDC47D2f83a99CF0000FDF667A468bB958a78 is Celer Network: cBridge (pool-based)
0xc1a2D967DfAa6A10f3461bc21864C23C1DD51EeA is OriginalTokenVault
0x4C882ec256823eE773B25b414d36F92ef58a7c0C is OriginalTokenVaultV2
0x4d58FDC7d0Ee9b674F49a0ADE11F26C3c9426F7A is PeggedTokenBridge
0xb51541df05DE07be38dcfc4a80c05389A54502BB is PeggedTokenBridgeV2

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

***Optimism***
0x9D39Fc627A6d9d9F8C831c16995b209548cc3401 is Celer Network: cBridge (pool-based)
0xbCfeF6Bb4597e724D720735d32A9249E0640aA11 is OriginalTokenVault
0x61f85fF2a2f4289Be4bb9B72Fc7010B3142B5f41 is PeggedTokenBridge
*/

const contractAddresses = {
  ethereum: {
    poolV2: ["0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820"],
    vaultV1: ["0xB37D31b2A74029B5951a2778F959282E2D518595"],
    vaultV2: ["0x7510792A3B1969F9307F3845CE88e39578f2bAE1"],
    peggedV1: ["0x16365b45EB269B5B5dACB34B4a15399Ec79b95eB"],
    peggedV2: ["0x52E4f244f380f8fA51816c8a10A63105dd4De084"],
  },
  polygon: {
    poolV1: ["0x88DCDC47D2f83a99CF0000FDF667A468bB958a78"],
    vaultV1: ["0xc1a2D967DfAa6A10f3461bc21864C23C1DD51EeA"],
    vaultV2: ["0x4C882ec256823eE773B25b414d36F92ef58a7c0C"],
    peggedV1: ["0x4d58FDC7d0Ee9b674F49a0ADE11F26C3c9426F7A"],
    peggedV2: ["0xb51541df05DE07be38dcfc4a80c05389A54502BB"],
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
  },
  optimism: {
    poolV1: ["0x9D39Fc627A6d9d9F8C831c16995b209548cc3401"],
    vaultV1: ["0xbCfeF6Bb4597e724D720735d32A9249E0640aA11"],
    peggedV1: ["0x61f85fF2a2f4289Be4bb9B72Fc7010B3142B5f41"],
  },
} as {
  [chain: string]: {
    poolV1?: string[];
    poolV2?: string[];
    vaultV1?: string[];
    vaultV2?: string[];
    peggedV1?: string[];
    peggedV2?: string[];
  };
};

const poolV1WithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "WithdrawDone(bytes32,uint64,address,address,uint256,bytes32)",
  abi: [
    "event WithdrawDone(bytes32 withdrawId, uint64 seqnum, address receiver, address token, uint256 amount, bytes32 refid)",
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
};

export default adapter;
