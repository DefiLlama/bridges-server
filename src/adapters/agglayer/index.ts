import { BridgeAdapter, PartialContractEventParams, ContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";

const AGGLAYER_UNIFIED_BRIDGE_ADDRESS = "0x2a3dd3eb832af982ec71669e178424b10dca2ede";

const depositEvent: ContractEventParams = {
    target: AGGLAYER_UNIFIED_BRIDGE_ADDRESS,
    topic: "ClaimEvent(uint256,uint32,address,address,uint256)",
    abi: [
        "event ClaimEvent(uint256 globalIndex, uint32 originNetwork, address originAddress, address destinationAddress, uint256 amount)"
    ],
    argKeys: {
        token: "originAddress",
        amount: "amount",
        to: "destinationAddress",
    },
    logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
    },
    txKeys: {
        from: "from",
        amount: "value",
    },
    isDeposit: true,
}

const withdrawalEvent: ContractEventParams = {
    target: AGGLAYER_UNIFIED_BRIDGE_ADDRESS,
    topic: "BridgeEvent(uint8,uint32,address,uint32,address,uint256,bytes,uint32)",
    abi: [
        "event BridgeEvent(uint8 leafType, uint32 originNetwork, address originAddress, uint32 destinationNetwork, address destinationAddress, uint256 amount, bytes metadata, uint32 depositCount)"
    ],
    argKeys: {
        token: "originAddress", // technically, it's embedded in the metadata... this is gonna be the "original" token address
        amount: "amount",
        to: "destinationAddress",
    },
    logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
    },
    txKeys: {
        from: "from",
        amount: "value",
    },
    isDeposit: false,
}

const constructParams = (chain: string) => {
    const eventParams = [
        depositEvent,
        withdrawalEvent,
    ];
    return async (fromBlock: number, toBlock: number) =>
        getTxDataFromEVMEventLogs("agglayer", chain, fromBlock, toBlock, eventParams);
};


const adapter: BridgeAdapter = {
    ethereum: constructParams("ethereum"),
    katana: constructParams("katana"),
    "polygon zkevm": constructParams("polygon_zkevm"),
    ternoa: constructParams("ternoa"),
    "x layer": constructParams("xlayer"),
};

export default adapter;
