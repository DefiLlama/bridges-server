import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getEVMEventLogs } from "../../helpers/eventLogs";
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
    pools: ["0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820"],
    vaults: ["0xB37D31b2A74029B5951a2778F959282E2D518595", "0x7510792A3B1969F9307F3845CE88e39578f2bAE1"],
    peggeds: ["0x16365b45EB269B5B5dACB34B4a15399Ec79b95eB", "0x52E4f244f380f8fA51816c8a10A63105dd4De084"],
  },
  polygon: {
    pools: ["0x88DCDC47D2f83a99CF0000FDF667A468bB958a78"],
    vaults: ["0xc1a2D967DfAa6A10f3461bc21864C23C1DD51EeA", "0x4C882ec256823eE773B25b414d36F92ef58a7c0C"],
    peggeds: ["0x4d58FDC7d0Ee9b674F49a0ADE11F26C3c9426F7A", "0xb51541df05DE07be38dcfc4a80c05389A54502BB"],
  },
  fantom: {
    pools: ["0x374B8a9f3eC5eB2D97ECA84Ea27aCa45aa1C57EF"],
    vaults: ["0x7D91603E79EA89149BAf73C9038c51669D8F03E9"],
    peggeds: ["0x38D1e20B0039bFBEEf4096be00175227F8939E51", "0x30F7Aa65d04d289cE319e88193A33A8eB1857fb9"],
  },
  avalanche: {
    pools: ["0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4"],
    vaults: ["0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820", "0xb51541df05DE07be38dcfc4a80c05389A54502BB"],
    peggeds: ["0x88DCDC47D2f83a99CF0000FDF667A468bB958a78", "0xb774C6f82d1d5dBD36894762330809e512feD195"],
  },
  bsc: {
    pools: ["0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF"],
    vaults: ["0x78bc5Ee9F11d133A08b331C2e18fE81BE0Ed02DC", "0x11a0c9270D88C99e221360BCA50c2f6Fda44A980"],
    peggeds: ["0xd443FE6bf23A4C9B78312391A30ff881a097580E", "0x26c76F7FeF00e02a5DD4B5Cc8a0f717eB61e1E4b"],
  },
  arbitrum: {
    pools: ["0x1619DE6B6B20eD217a58d00f37B9d47C7663feca"],
    vaults: ["0xFe31bFc4f7C9b69246a6dc0087D91a91Cb040f76", "0xEA4B1b0aa3C110c55f650d28159Ce4AD43a4a58b"],
    peggeds: ["0xbdd2739AE69A054895Be33A22b2D2ed71a1DE778"],
  },
  optimism: {
    pools: ["0x9D39Fc627A6d9d9F8C831c16995b209548cc3401"],
    vaults: ["0xbCfeF6Bb4597e724D720735d32A9249E0640aA11"],
    peggeds: ["0x61f85fF2a2f4289Be4bb9B72Fc7010B3142B5f41"],
  },
} as { [chain: string]: {
  pools: string[],
  vaults: string[],
  peggeds: string[]
} }; 

const poolWithdrawalParams: PartialContractEventParams = {
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

const tokenVaultDepositParams: PartialContractEventParams = {
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

const peggedDepositParams: PartialContractEventParams = {
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

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  const chainAddresses = contractAddresses[chain];
  if (chainAddresses.pools) {
    chainAddresses.pools.map((address: string) => {
      const finalPoolWithdrawalParams = {
        ...poolWithdrawalParams,
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
      eventParams.push(finalPoolWithdrawalParams, finalPoolDepositParams);
    });
  }
  if (chainAddresses.vaults) {
    chainAddresses.vaults.map((address: string) => {
      const finalVaultWithdrawalParams = {
        ...tokenVaultWithdrawalParams,
        target: address,
        fixedEventData: {
          from: address,
        },
      };
      const finalVaultDepositParams = {
        ...tokenVaultDepositParams,
        target: address,
        fixedEventData: {
          to: address,
        },
      };
      eventParams.push(finalVaultWithdrawalParams, finalVaultDepositParams);
    });
  }
  if (chainAddresses.peggeds) {
    chainAddresses.peggeds.map((address: string) => {
      const finalPeggedWithdrawalParams = {
        ...peggedWithdrawalParams,
        target: address,
        fixedEventData: {
          from: address,
        },
      };
      const finalPeggedDepositParams = {
        ...peggedDepositParams,
        target: address,
        fixedEventData: {
          to: address,
        },
      };
      eventParams.push(finalPeggedWithdrawalParams, finalPeggedDepositParams);
    });
  }
  return async (fromBlock: number, toBlock: number) =>
    getEVMEventLogs("celer", chain as Chain, fromBlock, toBlock, eventParams);
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
