import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { BigNumber } from "ethers";
import { getTxDataFromEVMEventLogsCustom } from "./processTransactionsCustom";
import {
    ACTION_EXECUTOR_ADDRESSES,
    VAULT_TYPE_USDC,
    VAULT_TYPE_USDT,
    VAULT_ASSET_ADDRESSES,
    CCIP_TOKEN_BRIDGE,
    NATIVE_TOKENS,
    CCIP_NATIVE_BRIDGE,
    CCTP_ACTION_EXECUTOR
} from "./constants";

type SupportedChains = keyof typeof ACTION_EXECUTOR_ADDRESSES;

const ccipDepositParams = (chain: SupportedChains): PartialContractEventParams => {
    const ccipTokenBridge = CCIP_TOKEN_BRIDGE[chain] as string;

    return {
        target: ccipTokenBridge,
        topic: "TokenBridgeActionSource(uint256,address,address,(address,uint256)[],uint256,bytes32,uint256)",
        abi: [
            "event TokenBridgeActionSource(uint256 targetChainId, address indexed sourceSender, address targetRecipient, tuple(address token, uint256 amount)[] tokenAmounts, uint256 reserve, bytes32 indexed ccipMessageId, uint256 timestamp)"
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

const ccipNativeDepositParams = (chain: SupportedChains): PartialContractEventParams => {
    const ccipTokenBridge = CCIP_NATIVE_BRIDGE[chain] as string;

    return {
        target: ccipTokenBridge,
        topic: "NativeBridgeActionSource(uint256,uint256,address,address,bool,bool,uint256,uint256,bytes32,uint256)",
        abi: [
            "event NativeBridgeActionSource(uint256 indexed actionId, uint256 targetChainId, address indexed sourceSender, address targetRecipient, bool fromWrapped, bool toWrapped, uint256 amount, uint256 reserve, bytes32 indexed ccipMessageId, uint256 timestamp)"
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

const cctpDepositParams = (chain: SupportedChains): PartialContractEventParams => {
    const cctpActionExecutor = CCTP_ACTION_EXECUTOR[chain] as string;

    return {
        target: cctpActionExecutor,
        topic: "SourceProcessed(uint256,bool,address,uint256,address,address,uint256,uint256)",
        abi: [
            "event SourceProcessed(uint256 indexed actionId, bool indexed isLocal, address indexed sender, uint256 routerType, address fromTokenAddress, address toTokenAddress, uint256 fromAmount, uint256 resultAmount)"
        ],
        isDeposit: true,
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
            from: "sender",
            amount: "fromAmount",
            token: "fromTokenAddress"
        },
        fixedEventData: {
            to: cctpActionExecutor
        },
        filter: {
            includeArg: [{ isLocal: false as unknown as string }],
        },
    };
};

const cctpWithdrawParams = (chain: SupportedChains): PartialContractEventParams => {
    const cctpActionExecutor = CCTP_ACTION_EXECUTOR[chain] as string;

    return {
        target: cctpActionExecutor,
        topic: "TargetProcessed(uint256,address,uint256,address,address,uint256,uint256)",
        abi: [
            "event TargetProcessed(uint256 indexed actionId, address indexed recipient, uint256 routerType, address fromTokenAddress, address toTokenAddress, uint256 fromAmount, uint256 resultAmount)"
        ],
        isDeposit: false,
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
            token: "fromTokenAddress",
            to: "recipient",
            amount: "fromAmount",
        },
        fixedEventData: {
            from: cctpActionExecutor
        }
    };
};

const depositParams = (chain: SupportedChains): PartialContractEventParams => {
    const actionExecutorAddress = ACTION_EXECUTOR_ADDRESSES[chain];

    return {
        target: actionExecutorAddress,
        topic: "SourceProcessed(uint256,bool,address,uint256,address,address,uint256,uint256)",
        abi: [
            "event SourceProcessed(uint256 indexed actionId, bool indexed isLocal, address indexed sender, uint256 routerType, address fromTokenAddress, address toTokenAddress, uint256 fromAmount, uint256 resultAmount)"
        ],
        isDeposit: true,
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
            token: "toTokenAddress",
            from: "sender",
            amount: "resultAmount",
        },
        fixedEventData: {
            to: actionExecutorAddress,
        },
        filter: {
            includeArg: [{ isLocal: false as unknown as string }],
        },
    };
};

const withdrawParams = (chain: SupportedChains): PartialContractEventParams => {
    const actionExecutorAddress = ACTION_EXECUTOR_ADDRESSES[chain];

    return {
        target: actionExecutorAddress,
        topic: "TargetProcessed(uint256,address,uint256,address,address,uint256,uint256)",
        abi: [
            "event TargetProcessed(uint256 indexed actionId, address indexed recipient, uint256 routerType, address fromTokenAddress, address toTokenAddress, uint256 fromAmount, uint256 resultAmount)"
        ],
        isDeposit: false,
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
            token: "fromTokenAddress",
            to: "recipient",
            amount: "fromAmount",
        },
        fixedEventData: {
            from: actionExecutorAddress,
        },
    };
};

const variableBalanceUsdcParams = (chain: SupportedChains): PartialContractEventParams => {
    const actionExecutorAddress = ACTION_EXECUTOR_ADDRESSES[chain];

    return {
        target: actionExecutorAddress,
        topic: "VariableBalanceAllocated(uint256,address,uint256,uint256)",
        abi: [
            "event VariableBalanceAllocated(uint256 indexed actionId, address indexed recipient, uint256 vaultType, uint256 amount)"
        ],
        isDeposit: false,
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
            amount: "amount",
            to: "recipient",
        },
        fixedEventData: {
            token: VAULT_ASSET_ADDRESSES[VAULT_TYPE_USDC][chain],
            from: actionExecutorAddress,
        },
        filter: {
            includeArg: [{ vaultType: BigNumber.from(VAULT_TYPE_USDC) as unknown as string }],
        },
    };
};

const variableBalanceUsdtParams = (chain: SupportedChains): PartialContractEventParams => {
    const actionExecutorAddress = ACTION_EXECUTOR_ADDRESSES[chain];

    return {
        target: actionExecutorAddress,
        topic: "VariableBalanceAllocated(uint256,address,uint256,uint256)",
        abi: [
            "event VariableBalanceAllocated(uint256 indexed actionId, address indexed recipient, uint256 vaultType, uint256 amount)"
        ],
        isDeposit: false,
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
            amount: "amount",
            to: "recipient",
        },
        fixedEventData: {
            token: VAULT_ASSET_ADDRESSES[VAULT_TYPE_USDT][chain],
            from: actionExecutorAddress,
        },
        filter: {
            includeArg: [{ vaultType: BigNumber.from(VAULT_TYPE_USDT) as unknown as string }],
        },
    };
};


const constructParams = (chain: SupportedChains) => {
    const eventParams = [depositParams(chain), withdrawParams(chain)];

    if (VAULT_ASSET_ADDRESSES[VAULT_TYPE_USDC][chain]) {
        eventParams.push(variableBalanceUsdcParams(chain));
    }

    if (VAULT_ASSET_ADDRESSES[VAULT_TYPE_USDT][chain]) {
        eventParams.push(variableBalanceUsdtParams(chain));
    }

    if(CCIP_TOKEN_BRIDGE[chain]) {
        eventParams.push(ccipDepositParams(chain));
    }

    if(CCIP_NATIVE_BRIDGE[chain]) {
        eventParams.push(ccipNativeDepositParams(chain));
    }

    if(CCTP_ACTION_EXECUTOR[chain]) {
        eventParams.push(cctpDepositParams(chain));
        eventParams.push(cctpWithdrawParams(chain));
    }

    return async (fromBlock: number, toBlock: number) =>
        getTxDataFromEVMEventLogsCustom("interport", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
    ethereum: constructParams("ethereum"),
    arbitrum: constructParams("arbitrum"),
    bsc: constructParams("bsc"),
    "zksync era": constructParams("era"),
    base: constructParams("base"),
    scroll: constructParams("scroll"),
    linea: constructParams("linea"),
    polygon: constructParams("polygon"),
    "polygon zkevm": constructParams("polygon_zkevm"),
    optimism: constructParams("optimism"),
    opbnb: constructParams("opbnb"),
    avalanche: constructParams("avax"),
    eon: constructParams("eon"),
    fantom: constructParams("fantom"),
};

export default adapter;
