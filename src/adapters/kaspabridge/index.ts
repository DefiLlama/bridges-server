import * as sdk from "@defillama/sdk";
import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { BigNumber, utils } from "ethers";

// ---------- CONFIG ----------
// KaspaBridge contract address on BSC
const MAILBOX_BSC = "0x5f297B3A1e8154c4D58702F7a880b7631bBf5340";

// ABI for events
const ABI = [
    "event Dispatch(bytes32 indexed id, uint32 indexed destinationDomain, bytes32 recipientAddress, bytes messageBody)",
    "event Process(bytes32 indexed id, bool success)",
];

const iface = new utils.Interface(ABI);

// Helper function to decode the message body from Dispatch events
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

// Utility function to delay between retries (for exponential backoff)
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry logic to fetch logs with multiple RPC providers
async function getLogsWithRetry(rpcUrls: string[], fromBlock: number, toBlock: number, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
        for (const url of rpcUrls) {
            try {
                const logs = await sdk.api.util.getLogs({
                    target: MAILBOX_BSC,
                    topic: "Dispatch(bytes32,uint32,bytes32,bytes)",
                    keys: [],
                    fromBlock,
                    toBlock,
                    chain: "bsc",
                    //@ts-ignore
                    rpcUrl: url, // Optional: Pass different RPC URL for load balancing
                });
                return logs;
            } catch (error) {
                console.error(`Error with RPC URL ${url}: ${error}`);
            }
        }

        const delayTime = Math.pow(2, attempt) * 1000; // Exponential backoff (1s, 2s, 4s, ...)
        console.log(`Retrying in ${delayTime / 1000}s...`);
        await delay(delayTime);
    }
    throw new Error("All retries failed with all RPC providers");
}

// Main function to get KaspaBridge events (both Dispatch and Process)
async function getKaspaBridgeEvents(fromBlock: number, toBlock: number) {
    const events = [];

    // List of RPC URLs to try in case one hits rate limits or fails
    const rpcUrls = [
        "https://bsc-dataseed.binance.org",
        "https://bsc.meowrpc.com",
        "https://endpoints.omniatech.io/v1/bsc/mainnet/public",
        "https://rpc.poolz.finance/bsc",
        "https://bsc-dataseed.bnbchain.org",
        "https://bsc-dataseed2.ninicoin.io",
        "https://bsc-dataseed4.ninicoin.io"
    ];

    // Fetch Dispatch (deposit) logs with retry
    const dispatch = await getLogsWithRetry(rpcUrls, fromBlock, toBlock);
    for (const log of dispatch.output) {
        const parsed = iface.parseLog({
            data: log.data,
            //@ts-ignore
            topics: log.topics,
        });
        const decoded = decodeMessageBody(parsed.args.messageBody);

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

    // Fetch Process (withdrawal) logs with retry
    const process = await getLogsWithRetry(rpcUrls, fromBlock, toBlock);
    for (const log of process.output) {
        events.push({
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            from: "0x0000000000000000000000000000000000000000",
            to: "0x0000000000000000000000000000000000000000",
            token: "0x0000000000000000000000000000000000000000",
            isDeposit: false,
            amount: BigNumber.from(0),
        });
    }

    return events;
}

// Bridge adapter construction function
export async function build(): Promise<BridgeAdapter> {
    return {
        bsc: getKaspaBridgeEvents,
    };
}

// Default export with async flag
export default {
    isAsync: true,
    build,
};
