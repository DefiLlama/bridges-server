import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const MAILBOX = "0x5f297B3A1e8154c4D58702F7a880b7631bBf5340";

const withdrawalParams: PartialContractEventParams = {
    target: MAILBOX,
    topic: "Process(uint32,bytes32,address)",
    abi: ["event Process(uint32 indexed origin, bytes32 indexed sender, address indexed recipient)"],
    logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
    },
    argKeys: {
        to: "recipient",
    },
    fixedEventData: {
        from: MAILBOX,
    },
    isDeposit: false,
    getTokenFromReceipt: {
        token: true,
        amount: true,
    },
};

const depositParams: PartialContractEventParams = {
    target: MAILBOX,
    topic: "Dispatch(address,uint32,bytes32,bytes)",
    abi: ["event Dispatch(address indexed sender, uint32 indexed destination, bytes32 indexed recipient, bytes message)"],
    logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
    },
    argKeys: {
        from: "sender",
    },
    fixedEventData: {
        to: MAILBOX,
    },
    isDeposit: true,
    getTokenFromReceipt: {
        token: true,
        amount: true,
    },
};

const constructParams = (chain: string) => {
    return async (fromBlock: number, toBlock: number) =>
        getTxDataFromEVMEventLogs("kaspabridge", chain as Chain, fromBlock, toBlock, [depositParams, withdrawalParams]);
};

const adapter: BridgeAdapter = {
    bsc: constructParams("bsc"),
};

export default adapter;
