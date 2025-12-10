import * as sdk from "@defillama/sdk";
import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { BigNumber, utils } from "ethers";

const MAILBOX_BSC = "0x5f297B3A1e8154c4D58702F7a880b7631bBf5340";

const ABI = [
    "event Dispatch(bytes32 indexed id, uint32 indexed destinationDomain, bytes32 recipientAddress, bytes messageBody)",
    "event Process(bytes32 indexed id, bool success)"
];

const iface = new utils.Interface(ABI);

function decodeMessageBody(body: string) {
    try {
        const coder = new utils.AbiCoder();
        const [from, to, token, amount] = coder.decode(
            ["address", "address", "address", "uint256"],
            body
        );
        return { from, to, token, amount: BigNumber.from(amount) };
    } catch {
        return null; // Important: return null to indicate failure
    }
}

async function getKaspaBridgeEvents(fromBlock: number, toBlock: number) {
    const events: any[] = [];

    const dispatchMap = new Map<
        string,
        { from: string; to: string; token: string; amount: BigNumber }
    >();

    // ---------------------- FETCH DISPATCH EVENTS ----------------------
    const dispatch = await sdk.api.util.getLogs({
        target: MAILBOX_BSC,
        topic: "Dispatch(bytes32,uint32,bytes32,bytes)",
        keys: [],
        fromBlock,
        toBlock,
        chain: "bsc",
    });

    for (const log of dispatch.output) {
        const parsed = iface.parseLog({
            data: log.data,
            // @ts-ignore
            topics: log.topics,
        });

        const decoded = decodeMessageBody(parsed.args.messageBody);
        if (!decoded) continue; // Skip invalid message bodies

        dispatchMap.set(log.transactionHash, decoded);

        events.push({
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            from: decoded.from,
            to: decoded.to,
            token: decoded.token,
            isDeposit: true,
            amount: decoded.amount,
        });
    }

    // ---------------------- FETCH PROCESS EVENTS ----------------------
    const process = await sdk.api.util.getLogs({
        target: MAILBOX_BSC,
        topic: "Process(bytes32,bool)",
        keys: [],
        fromBlock,
        toBlock,
        chain: "bsc",
    });

    for (const log of process.output) {
        const dispatchData = dispatchMap.get(log.transactionHash);

        // >>> Maintainer request: SKIP events without dispatch data
        if (!dispatchData) continue;

        events.push({
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            from: dispatchData.from,
            to: dispatchData.to,
            token: dispatchData.token,
            isDeposit: false,
            amount: dispatchData.amount,
        });
    }

    return events;
}

export async function build(): Promise<BridgeAdapter> {
    return {
        bsc: getKaspaBridgeEvents,
    };
}

export default {
    isAsync: true,
    build,
};
