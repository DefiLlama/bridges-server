import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { Contract, providers, utils, BigNumber } from "ethers";

// ---------- CONFIG ----------

const CHAIN_RPC: Record<string, string> = {
    kasplex: "https://evmrpc.kasplex.org",
    bsc: "https://bsc-rpc.publicnode.com",
};

const MAILBOX: Record<string, string> = {
    kasplex: "0x01e6A1a37942b51b08B047DdfDf345507A818d4d",
    bsc: "0x5f297B3A1e8154c4D58702F7a880b7631bBf5340",
};

// Minimal ABI for Dispatch / Process events
const MAILBOX_ABI = [
    "event Dispatch(bytes32 indexed id, uint32 indexed destinationDomain, bytes32 recipientAddress, bytes messageBody)",
    "event Process(bytes32 indexed id, bool success)",
];

// ---------- TYPES ----------

export interface KasplexEvent {
    txHash: string;
    blockNumber: number;
    from: string;
    to: string;
    token: string;
    isDeposit: boolean;
    amount: BigNumber;
}

// ---------- HELPERS ----------

function decodeMessageBody(messageBody: string) {
    try {
        const abiCoder = new utils.AbiCoder();
        const decoded = abiCoder.decode(["address", "address", "address", "uint256"], messageBody);
        return {
            from: decoded[0] as string,
            to: decoded[1] as string,
            token: decoded[2] as string,
            amount: BigNumber.from(decoded[3] as BigNumber),
        };
    } catch (e) {
        console.error("Failed to decode messageBody:", e);
        return {
            from: "0x0000000000000000000000000000000000000000",
            to: "0x0000000000000000000000000000000000000000",
            token: "0x0000000000000000000000000000000000000000",
            amount: BigNumber.from(0),
        };
    }
}

// ---------- MAIN ADAPTER FUNCTION ----------

const BLOCK_CHUNK = 2_000;

export const getKaspaBridgeEvents =
    (chain: string) =>
        async (fromBlock: number, toBlock: number): Promise<KasplexEvent[]> => {
            const rpcUrl = CHAIN_RPC[chain];
            const mailboxAddress = MAILBOX[chain];
            if (!rpcUrl || !mailboxAddress) {
                throw new Error(`Missing kaspabridge config for chain ${chain}`);
            }

            const provider = new providers.JsonRpcProvider(rpcUrl);
            const mailbox = new Contract(mailboxAddress, MAILBOX_ABI, provider);
            const events: KasplexEvent[] = [];

            for (let start = fromBlock; start <= toBlock; start += BLOCK_CHUNK) {
                const end = Math.min(start + BLOCK_CHUNK - 1, toBlock);

                const [dispatchLogs, processLogs] = await Promise.all([
                    provider.getLogs({ ...mailbox.filters.Dispatch(), fromBlock: start, toBlock: end }),
                    provider.getLogs({ ...mailbox.filters.Process(), fromBlock: start, toBlock: end }),
                ]);

                for (const log of dispatchLogs) {
                    const parsed = mailbox.interface.parseLog(log);
                    const decoded = decodeMessageBody(parsed.args["messageBody"] as string);

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

                for (const log of processLogs) {
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
            }

            return events;
        };

// ---------- BRIDGE ADAPTER ----------

export async function setUp(): Promise<string[]> {
    return Object.keys(CHAIN_RPC);
}

export async function build(): Promise<BridgeAdapter> {
    const adapter: BridgeAdapter = {};
    const chains = await setUp();

    for (const chain of chains) {
        adapter[chain] = getKaspaBridgeEvents(chain);
    }

    return adapter;
}

export default { isAsync: true, build };
