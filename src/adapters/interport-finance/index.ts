import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogsCustom, getTxDataFromSolana } from "./processTransactionsCustom";
import {
  CCIP_TOKEN_BRIDGE,
  NATIVE_TOKENS,
  CCIP_NATIVE_BRIDGE,
  CCIP_BACKED_TOKEN_BRIDGE,
  ACTION_EXECUTOR,
  CUSTOM_BRIDGE,
  CUSTOM_NON_EVM_BRIDGE,
  CCIP_V2_TOKEN_BRIDGE
} from "./constants";
import { Chain } from "@defillama/sdk/build/general";

const ccipDepositParams = (chain: Chain): PartialContractEventParams => {
    const ccipTokenBridge = CCIP_TOKEN_BRIDGE[chain] as string;

    return {
        target: ccipTokenBridge,
        topic: "TokenBridgeActionSource(uint256,address,address,(address,uint256)[],bytes32,uint256)",
        abi: [
            "event TokenBridgeActionSource(uint256 targetChainId, address indexed sourceSender, address targetRecipient, tuple(address token, uint256 amount)[] tokenAmounts, bytes32 indexed ccipMessageId, uint256 timestamp)"
        ],
        isDeposit: true,
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
            from: "sourceSender",
            to: "targetRecipient",
            amount: "tokenAmounts[0].amount",
            token: "tokenAmounts[0].token"
        },
    };
};

const ccipV2DepositParams = (chain: Chain): PartialContractEventParams => {
  const ccipV2TokenBridge = CCIP_V2_TOKEN_BRIDGE[chain] as string;

  return {
    target: ccipV2TokenBridge,
    topic: "TokenBridgeActionSource(uint256,address,bytes,(address,uint256)[],bytes32,uint256)",
    abi: [
      "event TokenBridgeActionSource(uint256 targetChainId, address indexed sourceSender, bytes targetRecipient, tuple(address token, uint256 amount)[] tokenAmounts, bytes32 indexed ccipMessageId, uint256 timestamp)"
    ],
    isDeposit: true,
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      from: "sourceSender",
      amount: "tokenAmounts[0].amount",
      token: "tokenAmounts[0].token"
    },
    fixedEventData: {
      to: ccipV2TokenBridge,
    },
  };
};

const ccipNativeDepositParams = (chain: Chain): PartialContractEventParams => {
    const ccipTokenBridge = CCIP_NATIVE_BRIDGE[chain] as string;

    return {
        target: ccipTokenBridge,
        topic: "NativeBridgeActionSource(uint256,uint256,address,address,bool,bool,uint256,bytes32,uint256)",
        abi: [
            "event NativeBridgeActionSource(uint256 indexed actionId, uint256 targetChainId, address indexed sourceSender, address targetRecipient, bool fromWrapped, bool toWrapped, uint256 amount, bytes32 indexed ccipMessageId, uint256 timestamp)"
        ],
        isDeposit: true,
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
            from: "sourceSender",
            to: "targetRecipient",
            amount: "amount",
        },
        fixedEventData: {
            token: NATIVE_TOKENS[chain]
        }
    };
};

const ccipBackedDepositParams = (chain: Chain): PartialContractEventParams => {
    const ccipTokenBridge = CCIP_BACKED_TOKEN_BRIDGE[chain] as string;

    return {
        target: ccipTokenBridge,
        topic: "BackedTokenBridgeActionSource(uint256,address,address,address,uint256,bytes32,uint256)",
        abi: [
            "event BackedTokenBridgeActionSource(uint256 targetChainId, address indexed sourceSender, address targetRecipient, address tokenAddress, uint256 tokenAmount, bytes32 indexed ccipMessageId, uint256 timestamp)"
        ],
        isDeposit: true,
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
            from: "sourceSender",
            to: "targetRecipient",
            amount: "tokenAmount",
            token: "tokenAddress"
        },
    };
};

const depositParams = (chain: Chain): PartialContractEventParams => {
    const actionExecutorAddress = ACTION_EXECUTOR[chain];

    return {
        target: actionExecutorAddress,
        topic: "ActionSource(uint256,uint256,address,address,uint256,uint256,uint256,(address,uint256),(address,uint256),address,uint256)",
        abi: [
            "event ActionSource(uint256 indexed actionId, uint256 indexed targetChainId, address indexed sourceSender, address targetRecipient, uint256 gatewayType, uint256 assetType, uint256 routerType, tuple(address tokenAddress, uint256 amount) inputTokenAmountData, tuple(address tokenAddress, uint256 amount) assetTokenAmountData, address targetToken, uint256 timestamp)"
        ],
        isDeposit: true,
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
            token: "inputTokenAmountData.tokenAddress",
            from: "sourceSender",
            amount: "inputTokenAmountData.amount",
            to: "targetRecipient"
        },
    };
};

const withdrawParams = (chain: Chain): PartialContractEventParams => {
    const actionExecutorAddress = ACTION_EXECUTOR[chain];

    return {
        target: actionExecutorAddress,
        topic: "ActionTarget(uint256,uint256,address,uint256,uint256,uint256,(address,uint256),(address,uint256),uint256,bool,uint256)",
        abi: [
            "event ActionTarget(uint256 indexed actionId, uint256 indexed sourceChainId, address indexed recipient, uint256 gatewayType, uint256 assetType, uint256 routerType, tuple(address tokenAddress, uint256 amount) assetTokenAmountData, tuple(address tokenAddress, uint256 amount) outputTokenAmountData, uint256 outputExtraAmount, bool isSuccess, uint256 timestamp)"
        ],
        isDeposit: false,
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
            token: "outputTokenAmountData.tokenAddress",
            to: "recipient",
            amount: "outputTokenAmountData.amount",
        },
        fixedEventData: {
            from: actionExecutorAddress,
        },
        filter: {
            includeArg: [{ isSuccess: true as unknown as string }],
        },
    };
};

const customBridgeDeposit = (chain: Chain): PartialContractEventParams => {
    const customBridgeAddress = CUSTOM_BRIDGE[chain];

    return {
        target: customBridgeAddress,
        topic: "CCTPV2BridgeActionSource(uint32,address,bytes32,address,uint256,uint256,uint256)",
        abi: [
            "event CCTPV2BridgeActionSource(uint32 destinationDomain, address indexed sourceSender, bytes32 targetRecipient, address token, uint256 amount, uint256 reserve, uint256 timestamp)"
        ],
        isDeposit: true,
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
            token: "token",
            to: "targetRecipient",
            amount: "amount",
            from: "sourceSender",
        },
    };
};

const customNonEvmBridgeDeposit = (chain: Chain): PartialContractEventParams => {
    const customBridgeAddress = CUSTOM_NON_EVM_BRIDGE[chain];

    return {
        target: customBridgeAddress,
        topic: "BridgeActionSource(uint32,address,bytes32,address,uint256,uint256,uint64,uint256)",
        abi: [
            "event BridgeActionSource(uint32 destinationDomain, address indexed sourceSender, bytes32 targetRecipient, address token, uint256 amount, uint256 reserve, uint64 indexed messageNonce, uint256 timestamp)"
        ],
        isDeposit: true,
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
            token: "token",
            amount: "amount",
            from: "sourceSender"
        },
        fixedEventData: {
            to: customBridgeAddress,
        },
    };
};


const constructParams = (chain: Chain) => {
    if(chain === 'solana') {
      return async (fromBlock: number, toBlock: number) =>
        getTxDataFromSolana(fromBlock, toBlock);
    }

    const eventParams: PartialContractEventParams[] = [];

    if(ACTION_EXECUTOR[chain]) {
        eventParams.push(depositParams(chain));
        eventParams.push(withdrawParams(chain));
    }

    if(CCIP_TOKEN_BRIDGE[chain]) {
        eventParams.push(ccipDepositParams(chain));
    }

    if(CCIP_NATIVE_BRIDGE[chain]) {
        eventParams.push(ccipNativeDepositParams(chain));
    }

    if(CCIP_BACKED_TOKEN_BRIDGE[chain]) {
        eventParams.push(ccipBackedDepositParams(chain));
    }

    if(CUSTOM_NON_EVM_BRIDGE[chain]) {
        eventParams.push(customNonEvmBridgeDeposit(chain));
    }

    if(CUSTOM_BRIDGE[chain]) {
        eventParams.push(customBridgeDeposit(chain));
    }

    if(CCIP_V2_TOKEN_BRIDGE[chain]) {
        eventParams.push(ccipV2DepositParams(chain));
    }

    return async (fromBlock: number, toBlock: number) =>
        getTxDataFromEVMEventLogsCustom("interport", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
    ethereum: constructParams("ethereum"),
    avalanche: constructParams("avax"),
    arbitrum: constructParams("arbitrum"),
    base: constructParams("base"),
    bsc: constructParams("bsc"),
    "zksync era": constructParams("era"),
    scroll: constructParams("scroll"),
    linea: constructParams("linea"),
    polygon: constructParams("polygon"),
    optimism: constructParams("optimism"),
    opbnb: constructParams("opbnb"),
    eon: constructParams("eon"),
    fantom: constructParams("fantom"),
    astar: constructParams("astar"),
    blast: constructParams("blast"),
    celo: constructParams("celo"),
    gnosis: constructParams("gnosis"),
    kroma: constructParams("kroma"),
    metis: constructParams("metis"),
    mode: constructParams("mode"),
    wemix: constructParams("wemix"),
    zircuit: constructParams("zircuit"),
    sonic: constructParams("sonic"),
    soneium: constructParams("soneium"),
    ronin: constructParams("ronin"),
    sei: constructParams("sei"),
    bob: constructParams("bob"),
    shibarium: constructParams("shibarium"),
    bsquared: constructParams("bsquared"),
    berachain: constructParams("berachain"),
    kava: constructParams("kava"),
    mantle: constructParams("mantle"),
    aurora: constructParams("aurora"),
    core: constructParams("core"),
    kaia: constructParams("kaia"),
    iota: constructParams("iota"),
    taiko: constructParams("taiko"),
    rari: constructParams("rari"),
    flare: constructParams("flare"),
    gravity: constructParams("gravity"),
    lightlink: constructParams("lightlink"),
    plume: constructParams("plume"),
    flow: constructParams("flow"),
    abstract: constructParams("abstract"),
    mind: constructParams("mind"),
    rootstock: constructParams("rootstock"),
    hemi: constructParams("hemi"),
    "world chain": constructParams("world"),
    solana: constructParams("solana"),
};

export default adapter;
