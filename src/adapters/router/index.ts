import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

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
    rootstock: "0xc21e4ebd1d92036cb467b53fe3258f219d909eb9"
  } as { [chain: string]: string };

  
const constructParams = (chain: string) => {
    let eventParams = [] as PartialContractEventParams[];
    const bridgeAddress = bridgeAddresses[chain];
    const depositParams = {
        target: bridgeAddress,
        topic: "FundsPaid(bytes32,address,uint256)",
        abi: [
            "event FundsPaid (bytes32 messageHash, address forwarder, uint256 nonce)",
        ],
        logKeys: {
            blockNumber: "blockNumber",
            txHash: "transactionHash",
        },
        argKeys: {
        },
        fixedEventData: {
            from: bridgeAddress,
        },
        isDeposit: true,
    };

    const withdrawParams = {
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
            amount: "amount",
            token: "srcToken",
            to: "recipient"
        },
        fixedEventData: {
            from: bridgeAddress,
        },
        isDeposit: false,
    };

    eventParams.push(depositParams, withdrawParams);

    return async (fromBlock: number, toBlock: number) =>
        getTxDataFromEVMEventLogs("router", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
    ethereum: constructParams("ethereum"),
    avax: constructParams("avax"),
    bsc: constructParams("bsc"),
    fantom: constructParams("fantom"),
    polygon: constructParams("polygon"),
    linea: constructParams("linea"),
    scroll: constructParams("scroll"),
    base: constructParams("base"),
    arbitrum: constructParams("arbitrum"),
    aurora: constructParams("aurora"),
    tron: constructParams("tron"),
    "polygon zkevm": constructParams("polygonzkevm"),
    "zksync era": constructParams("zksync"),
    manta: constructParams("manta"),
    mantle: constructParams("mantle"),
    rootstock: constructParams("rootstock")
};

export default adapter;