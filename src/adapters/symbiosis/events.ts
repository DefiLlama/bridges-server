import {PartialContractEventParams} from "../../helpers/bridgeAdapter.type";

type Events = {
    synthesizeRequestParams: PartialContractEventParams
    synthesizeCompletedParams: PartialContractEventParams
    burnRequestParams: PartialContractEventParams
    burnCompletedParams: PartialContractEventParams
}
export const events: Events = {
    synthesizeRequestParams: {
        target: "",
        topic: "SynthesizeRequest(bytes32,address,uint256,address,address,uint256,address)",
        abi: [
            "event SynthesizeRequest(bytes32 id,address indexed from,uint256 indexed chainID,address indexed revertableAddress,address to,uint256 amount,address token)",
        ],
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
            amount: "amount",
            to: "to",
            from: "from",
            token: "token",
        },
        isDeposit: true,
    },
    synthesizeCompletedParams: {
        target: "",
        topic: "SynthesizeCompleted(bytes32,address,uint256,uint256,address)",
        abi: [
            "event SynthesizeCompleted(bytes32 indexed id,address indexed to,uint256 amount,uint256 bridgingFee,address token)",
        ],
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
            amount: "amount",
            to: "to",
            from: "to",
            token: "token",
        },
        isDeposit: true,
    },
    burnRequestParams: {
        target: "",
        topic: "BurnRequest(bytes32,address,uint256,address,address,uint256,address)",
        abi: [
            "event BurnRequest(bytes32 id,address indexed from,uint256 indexed chainID,address indexed revertableAddress,address to,uint256 amount,address token)",
        ],
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
            amount: "amount",
            to: "to",
            from: "from",
            token: "token",
        },
        isDeposit: false,
    },
    burnCompletedParams: {
        target: "",
        topic: "BurnCompleted(bytes32,address,uint256,uint256,address)",
        abi: [
            "event BurnCompleted(bytes32 indexed id,address indexed to,uint256 amount,uint256 bridgingFee,address token)",
        ],
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
            amount: "amount",
            to: "to",
            from: "to",
            token: "token",
        },
        isDeposit: false,
    },
}