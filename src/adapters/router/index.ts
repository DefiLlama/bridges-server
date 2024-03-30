import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { ethers } from "ethers";
import assetForwarderAbi from "./assetForwarder.json"
import { getTxsBlockRangeEtherscan } from "../../helpers/etherscan";
import { EventData } from "../../utils/types";

const bridgeAddresses = {
    ethereum: "0xc21e4ebd1d92036cb467b53fe3258f219d909eb9",
    avax: "0xf9f4c3dc7ba8f56737a92d74fd67230c38af51f2",
    bsc: "0x260687ebc6c55dadd578264260f9f6e968f7b2a5",
    fantom: "0xc21e4ebd1d92036cb467b53fe3258f219d909eb9",
    polygon: "0x1396f41d89b96eaf29a7ef9ee01ad36e452235ae",
    linea: "0x8c4acd74ff4385f3b7911432fa6787aa14406f8b",
    scroll: "0x01b4ce0d48ce91eb6bcaf5db33870c65d641b894",
    base: "0x0fa205c0446cd9eedcc7538c9e24bc55ad08207f",
    arbitrum: "0xef300fb4243a0ff3b90c8ccfa1264d78182adaa4",
    aurora: "0xc21e4ebd1d92036cb467b53fe3258f219d909eb9",
    tron: "0x9d25b8289c0f3789237c1b3a88264882eed6c610",
    polygonzkevm: "0xc21e4ebd1d92036cb467b53fe3258f219d909eb9",
    zksync: "0x8b6f1c18c866f37e6ea98aa539e0c117e70178a2",
    manta: "0x21c1e74caadf990e237920d5515955a024031109",
    mantle: "0xc21e4ebd1d92036cb467b53fe3258f219d909eb9",
    rsk: "0xc21e4ebd1d92036cb467b53fe3258f219d909eb9",
    optimism: "0x8201c02d4ab2214471e8c3ad6475c8b0cd9f2d06",
} as { [chain: string]: string };


const signatures: { [key: string]: string } = {
    "0x64778c1f": "iRelay",
    "0x6fb003da": "iRelayMessage"
};

interface Transaction {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    nonce: string;
    blockHash: string;
    transactionIndex: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    isError: string;
    txreceipt_status: string;
    input: string;
    contractAddress: string;
    cumulativeGasUsed: string;
    gasUsed: string;
    confirmations: string;
    methodId: string;
    functionName: string;
}


const constructParams = (chain: string) => {
    let eventParams = [] as PartialContractEventParams[];
    const bridgeAddress = bridgeAddresses[chain];
    // const withdrawParamsTransfer = {
    //     target: bridgeAddress,
    //     topic: "FundsPaid(bytes32,address,uint256)",
    //     abi: [
    //         "event FundsPaid (bytes32 messageHash, address forwarder, uint256 nonce)",
    //     ],
    //     logKeys: {
    //         blockNumber: "blockNumber",
    //         txHash: "transactionHash",
    //     },
    //     argKeys: {
    //     },
    //     fixedEventData: {
    //         from: bridgeAddress,
    //     },
    //     isDeposit: false,
    // };

    const depositParamsTransfer = {
        target: bridgeAddress,
        topic: "FundsDeposited(uint256,uint256,bytes32,uint256,uint256,address,address,bytes,bytes)",
        abi: [
            "event FundsDeposited (uint256 partnerId, uint256 amount, bytes32 destChainIdBytes, uint256 destAmount, uint256 depositId, address srcToken, address depositor, bytes recipient, bytes destToken)",
        ],
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
            amount: "destAmount",
            token: "srcToken",
            to: "recipient",
            from: "depositor"
        },
        fixedEventData: {
            from: bridgeAddress,
        },
        isDeposit: true,
    };

    // const withdrawParamsSwap = {
    //     target: bridgeAddress,
    //     topic: "FundsPaidWithMessage(bytes32,address,uint256,bool,bytes)",
    //     abi: [
    //         "event FundsPaidWithMessage (bytes32 messageHash, address forwarder, uint256 nonce, bool execFlag, bytes execData)",
    //     ],
    //     logKeys: {
    //         blockNumber: "blockNumber",
    //         txHash: "transactionHash",
    //     },
    //     argKeys: {
    //     },
    //     fixedEventData: {
    //         from: bridgeAddress,
    //     },
    //     isDeposit: false,
    // };

    const depositParamsSwap = {
        target: bridgeAddress,
        topic: "FundsDeposited (uint256 partnerId, uint256 amount, bytes32 destChainIdBytes, uint256 destAmount, uint256 depositId, address srcToken, address depositor, bytes recipient, bytes destToken)",
        abi: [
            "event FundsDeposited(uint256, uint256, bytes32, uint256, uint256, address, address, bytes, bytes)",
        ],
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
            amount: "destAmount",
            token: "srcToken",
            to: "recipient"
        },
        fixedEventData: {
            from: bridgeAddress,
        },
        isDeposit: true,
    };



    eventParams.push(depositParamsTransfer, depositParamsSwap);

    return async (fromBlock: number, toBlock: number) => {
        const eventLogData = (await getTxDataFromEVMEventLogs(
            "router",
            chain as Chain,
            fromBlock,
            toBlock,
            eventParams
        )) as EventData[];
        let withdrawalEventData: EventData[] = [];
        const txs: Transaction[] = await getTxsBlockRangeEtherscan(chain, bridgeAddresses[chain], fromBlock, toBlock, {
            includeSignatures: Object.keys(signatures),
        });
        if (txs.length) {
            // @todo handle internal txs as well
            withdrawalEventData = txs.map((tx: any) => txnsDetailsToEventData(tx));
        }
        return [...eventLogData, ...withdrawalEventData]; // @todo to be concatenated with txs
    }
};

const adapter: BridgeAdapter = {
    ethereum: constructParams("ethereum"),
    polygon: constructParams("polygon"),
    avalanche: constructParams("avax"),
    bsc: constructParams("bsc"),
    fantom: constructParams("fantom"),
    arbitrum: constructParams("arbitrum"),
    optimism: constructParams("optimism"),
    aurora: constructParams("aurora"),
    linea: constructParams("linea"),
    scroll: constructParams("scroll"),
    base: constructParams("base"),
    tron: constructParams("tron"),
    "polygon zkevm": constructParams("polygonzkevm"),
    "zksync era": constructParams("era"),
    // manta: constructParams("manta"),
    mantle: constructParams("mantle"),
    // rootstock: constructParams("rsk")
};

export default adapter;


// const methodId = "iRelay";

// converts calldata string to params using abi
const txnsDetailsToEventData = (txn: Transaction): EventData => {
    const abi = assetForwarderAbi;
    const methodAbi = new ethers.utils.Interface(abi);
    const methodId = txn.input.slice(0, 10);
    const decoded = methodAbi.decodeFunctionData(signatures[methodId], txn.input)[0];
    // console.log(decoded["amount"], decoded["recipient"]);
    return {
        blockNumber: Number(txn.blockNumber),
        txHash: txn.hash,
        from: txn.from,
        isDeposit: false,
        amount: decoded["amount"],
        to: decoded["recipient"],
        token: decoded["destToken"]
    };
}

// const tryouts = async () => {
//     console.log("tryouts");
//     const some = await getTxsBlockRangeEtherscan(
//         "optimism",
//         "0x8201c02d4ab2214471e8c3ad6475c8b0cd9f2d06",
//         117402264,
//         117402266,
//         {
//             includeSignatures: Object.keys(signatures),
//         }
//     )
//     console.log(some);

//     some.forEach((tx: any) => {
//         txnsDetailsToEventData(tx);
//     });
// }

// tryouts();


