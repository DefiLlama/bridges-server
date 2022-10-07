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

*/

const contractAddresses = {
  ethereum: {
    pools: ["0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820"],
    vaults: ["0xB37D31b2A74029B5951a2778F959282E2D518595", "0x7510792A3B1969F9307F3845CE88e39578f2bAE1"],
    peggeds: ["0x16365b45EB269B5B5dACB34B4a15399Ec79b95eB", "0x52E4f244f380f8fA51816c8a10A63105dd4De084"],
  },
} as { [chain: string]: any }; // fix

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
};

export default adapter;
