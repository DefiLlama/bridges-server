import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { BigNumber } from "ethers";
import { getTxDataFromEVMEventLogsCustom } from "./processTransactionsCustom";
import {
    ACTION_EXECUTOR_ADDRESSES,
    ACTION_EXECUTOR_CCTP_ADDRESSES,
    VAULT_TYPE_USDC,
    VAULT_TYPE_USDT,
    VAULT_TYPE_CIRCLE_CCTP,
    VAULT_ASSET_ADDRESSES
} from "./constants";

type SupportedChains = keyof typeof ACTION_EXECUTOR_ADDRESSES;

const depositParams = (chain: SupportedChains, isCCTP = false): PartialContractEventParams => {
    const actionExecutorAddress =
        isCCTP ?
            ACTION_EXECUTOR_CCTP_ADDRESSES[chain] :
            ACTION_EXECUTOR_ADDRESSES[chain];

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

const withdrawParams = (chain: SupportedChains, isCCTP = false): PartialContractEventParams => {
    const actionExecutorAddress =
        isCCTP ?
            ACTION_EXECUTOR_CCTP_ADDRESSES[chain] :
            ACTION_EXECUTOR_ADDRESSES[chain];

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

const variableBalanceCctpParams = (chain: SupportedChains): PartialContractEventParams => {
    const actionExecutorAddress = ACTION_EXECUTOR_CCTP_ADDRESSES[chain];

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
            token: VAULT_ASSET_ADDRESSES[VAULT_TYPE_CIRCLE_CCTP][chain],
            from: actionExecutorAddress,
        },
        filter: {
            includeArg: [{ vaultType: BigNumber.from(VAULT_TYPE_CIRCLE_CCTP) as unknown as string }],
        },
    };
};

const constructParams = (chain: SupportedChains) => {
    const eventParams = [depositParams(chain), withdrawParams(chain)];

    if (ACTION_EXECUTOR_CCTP_ADDRESSES[chain]) {
        eventParams.push(depositParams(chain, true));
        eventParams.push(withdrawParams(chain, true));
    }

    if (VAULT_ASSET_ADDRESSES[VAULT_TYPE_USDC][chain]) {
        eventParams.push(variableBalanceUsdcParams(chain));
    }

    if (VAULT_ASSET_ADDRESSES[VAULT_TYPE_USDT][chain]) {
        eventParams.push(variableBalanceUsdtParams(chain));
    }

    if (VAULT_ASSET_ADDRESSES[VAULT_TYPE_CIRCLE_CCTP][chain]) {
        eventParams.push(variableBalanceCctpParams(chain));
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
