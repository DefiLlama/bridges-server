import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const BRIDGE = "0x3AC7A6635d99F376c3c05442f7Eef62d349C3A55";

const depositParams: PartialContractEventParams = {
    target: BRIDGE,
    topic: "Sent(bytes4,bytes32,address,bytes32,uint256,uint128,bytes4)",
    abi: [
        "event Sent(bytes4 tokenSource, bytes32 tokenSourceAddress, address sender, bytes32 indexed recipient, uint256 amount, uint128 indexed lockId, bytes4 destination)",
    ],
    logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
    },
    argKeys: {
        from: "sender",
        amount: "amount",
    },
    fixedEventData: {
        to: BRIDGE,
    },
    isDeposit: true,
    getTokenFromReceipt: {
        token: true,
        amount: false,
    },
};

const withdrawalParams: PartialContractEventParams = {
    target: BRIDGE,
    topic: "Received(address,address,uint256,uint128,bytes4)",
    abi: [
        "event Received(address indexed recipient, address token, uint256 amount, uint128 indexed lockId, bytes4 source)",
    ],
    logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
    },
    argKeys: {
        to: "recipient",
        token: "token",
        amount: "amount",
    },
    fixedEventData: {
        from: BRIDGE,
    },
    isDeposit: false,
};

const constructParams = (chain: string) => {
    return async (fromBlock: number, toBlock: number) =>
        getTxDataFromEVMEventLogs("wavesbridge", chain as Chain, fromBlock, toBlock, [
            depositParams,
            withdrawalParams,
        ]);
};

const adapter: BridgeAdapter = {
    ethereum: constructParams("ethereum"),
    bsc: constructParams("bsc"),
};

export default adapter;
