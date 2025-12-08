import * as sdk from "@defillama/sdk";
import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { BigNumber, utils } from "ethers";

const MAILBOX_BSC = "0x5f297B3A1e8154c4D58702F7a880b7631bBf5340";

// ABI for Dispatch and Process events
const ABI = [
    "event Dispatch(bytes32 indexed id, uint32 indexed destinationDomain, bytes32 recipientAddress, bytes messageBody)",
    "event Process(bytes32 indexed id, bool success)"
];

const iface = new utils.Interface(ABI);

// Helper function to decode the message body of the Dispatch event
function decodeMessageBody(body: string) {
    try {
        const abiCoder = new utils.AbiCoder();
        const [from, to, token, amount] = abiCoder.decode(
            ["address", "address", "address", "uint256"],
            body
        );
        return { from, to, token, amount: BigNumber.from(amount) };
    } catch {
        return {
            from: "0x0000000000000000000000000000000000000000",
            to: "0x0000000000000000000000000000000000000000",
            token: "0x0000000000000000000000000000000000000000",
            amount: BigNumber.from(0),
        };
    }
}

// Function to fetch Kaspa Bridge events
async function getKaspaBridgeEvents(fromBlock: number, toBlock: number) {
    const events = [];

    // Map to store Dispatch event data for correlation with Process events
    const dispatchMap = new Map();

    // Fetch Dispatch logs
    const dispatch = await sdk.api.util.getLogs({
        target: MAILBOX_BSC,
        topic: "Dispatch(bytes32,uint32,bytes32,bytes)",
        keys: [],
        fromBlock,
        toBlock,
        chain: "bsc",
    });

    // Process Dispatch events
    for (const log of dispatch.output) {
        const parsed = iface.parseLog({
            data: log.data,
            //@ts-ignore
            topics: log.topics,
        });
        const decoded = decodeMessageBody(parsed.args.messageBody);

        // Store Dispatch event data in the map for use with Process events
        dispatchMap.set(log.transactionHash, {
            from: decoded.from,
            to: decoded.to,
            token: decoded.token,
            amount: decoded.amount,
        });

        // Add the Dispatch event to the events list
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

    // Fetch Process logs
    const process = await sdk.api.util.getLogs({
        target: MAILBOX_BSC,
        topic: "Process(bytes32,bool)",
        keys: [],
        fromBlock,
        toBlock,
        chain: "bsc",
    });

    // Process Process events and correlate with Dispatch events
    for (const log of process.output) {
        const dispatchData = dispatchMap.get(log.transactionHash);

        // Here, we ensure we don't use hardcoded zero addresses and instead use null if no matching Dispatch event was found
        events.push({
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            from: dispatchData ? dispatchData.from : null, // Use Dispatch data for 'from' if available
            to: dispatchData ? dispatchData.to : null,     // Use Dispatch data for 'to' if available
            token: dispatchData ? dispatchData.token : null, // Use Dispatch data for 'token' if available
            isDeposit: false,
            amount: dispatchData ? dispatchData.amount : BigNumber.from(0),
        });
    }

    return events;
}

// Build function to return the BridgeAdapter object
export async function build(): Promise<BridgeAdapter> {
    return {
        bsc: getKaspaBridgeEvents, // Use the getKaspaBridgeEvents function for the BSC chain
    };
}

// Default export
export default {
    isAsync: true,
    build,
};
