import { Chain } from "@defillama/sdk/build/general";
import { getLogs } from "@defillama/sdk/build/util/logs";
import { ethers } from "ethers";
import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { incrementGetLogsCount } from "../../utils/cache";
import { EventData } from "../../utils/types";

type ChainCfg = { contract: string };

const chainConfig: Record<string, ChainCfg> = {
    ethereum: { contract: "0x0736bdc975af0675b9a045384efed91360d25479" },
    base: { contract: "0xc6868edf1d2a7a8b759856cb8afa333210dfeda6" },
    arbitrum: { contract: "0xc6868edf1d2a7a8b759856cb8afa333210dfeda6" },
    optimism: { contract: "0xc6868edf1d2a7a8b759856cb8afa333210dfeda6" },
    plasma: { contract: "0xffe691a6ddb5d2645321e0a920c2e7bdd00dd3d8" },
    bsc: { contract: "0xffe691a6ddb5d2645321e0a920c2e7bdd00dd3d8" },
    monad: { contract: "0xffe691a6ddb5d2645321e0a920c2e7bdd00dd3d8" },
    stable: { contract: "0xffe691a6ddb5d2645321e0a920c2e7bdd00dd3d8" },
    megaeth: { contract: "0xffe691a6ddb5d2645321e0a920c2e7bdd00dd3d8" },
};

const DEPOSIT_EVENT_ABI =
    "event Deposit(bytes32 indexed orderId, tuple(uint128 inputAmount, uint128 outputAmount, address inputToken, address outputToken, uint32 startTime, uint32 endTime, uint32 srcEid, uint32 dstEid, address offerer, address recipient) order)";

const WITHDRAW_EVENT_ABI =
    "event Withdraw(address indexed holder, address indexed token, uint256 amount)";

const depositIface = new ethers.utils.Interface([DEPOSIT_EVENT_ABI]);
const withdrawIface = new ethers.utils.Interface([WITHDRAW_EVENT_ABI]);

function flattenLogs(logs: any): any[] {
    return Array.isArray(logs?.[0]) ? (logs as any[][]).flat() : (logs as any[]);
}

const constructParams = (chain: string) => {
    const cfg = chainConfig[chain];
    if (!cfg) throw new Error(`aori: unknown chain key "${chain}"`);

    return async (fromBlock: number, toBlock: number): Promise<EventData[]> => {
        const out: EventData[] = [];

        incrementGetLogsCount("aori", chain);
        const depositLogs = await getLogs({
            target: cfg.contract,
            eventAbi: DEPOSIT_EVENT_ABI,
            fromBlock,
            toBlock,
            chain: chain as Chain,
            entireLog: true,
        });
        for (const txLog of flattenLogs(depositLogs)) {
                const parsed = depositIface.parseLog({ topics: txLog.topics, data: txLog.data });
                const order = parsed.args.order;
                const { inputAmount, inputToken, offerer, recipient } = order;
                out.push({
                    blockNumber: Number(txLog.blockNumber),
                    txHash: txLog.transactionHash,
                    from: offerer,
                    to: recipient,
                    token: inputToken,
                    amount: ethers.BigNumber.from(inputAmount),
                    isDeposit: true,
                });
        }

        incrementGetLogsCount("aori", chain);
        const withdrawLogs = await getLogs({
            target: cfg.contract,
            eventAbi: WITHDRAW_EVENT_ABI,
            fromBlock,
            toBlock,
            chain: chain as Chain,
            entireLog: true,
        });
        for (const txLog of flattenLogs(withdrawLogs)) {
            const parsed = withdrawIface.parseLog({ topics: txLog.topics, data: txLog.data });
            const holder = parsed.args.holder as string;
            const token = parsed.args.token as string;
            const amount = parsed.args.amount;
            out.push({
                blockNumber: Number(txLog.blockNumber),
                txHash: txLog.transactionHash,
                from: txLog.address,
                to: holder,
                token,
                amount: ethers.BigNumber.from(amount),
                isDeposit: false,
            });

        }

        return out;
    };
};

const adapter: BridgeAdapter = {
    ethereum: constructParams("ethereum"),
    base: constructParams("base"),
    arbitrum: constructParams("arbitrum"),
    optimism: constructParams("optimism"),
    plasma: constructParams("plasma"),
    bsc: constructParams("bsc"),
    monad: constructParams("monad"),
    stable: constructParams("stable"),
    megaeth: constructParams("megaeth"),
};

export default adapter;
