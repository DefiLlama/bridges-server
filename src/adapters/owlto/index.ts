import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";
import { Chain } from "@defillama/sdk/build/general";
import { getProvider } from "../../utils/provider";
import { EventData } from "../../utils/types";
import { PromisePool } from "@supercharge/promise-pool";

const retry = require("async-retry");

export const bridgesAddress = {
    arbitrum: ["0x45A318273749d6eb00f5F6cA3bC7cD3De26D642A", "0x5e809A85Aa182A9921EDD10a4163745bb3e36284"],
    arbitrum_nova: ["0x45A318273749d6eb00f5F6cA3bC7cD3De26D642A", "0x5e809A85Aa182A9921EDD10a4163745bb3e36284"],
    ethereum: ["0x45A318273749d6eb00f5F6cA3bC7cD3De26D642A", "0x5e809A85Aa182A9921EDD10a4163745bb3e36284"],
    bsc: ["0x45A318273749d6eb00f5F6cA3bC7cD3De26D642A", "0x5e809A85Aa182A9921EDD10a4163745bb3e36284"],
    polygon: ["0x45A318273749d6eb00f5F6cA3bC7cD3De26D642A", "0x5e809A85Aa182A9921EDD10a4163745bb3e36284"],
    optimism: ["0x45A318273749d6eb00f5F6cA3bC7cD3De26D642A", "0x5e809A85Aa182A9921EDD10a4163745bb3e36284"],
    era: ["0x45A318273749d6eb00f5F6cA3bC7cD3De26D642A", "0x5e809A85Aa182A9921EDD10a4163745bb3e36284"],
    polygon_zkevm: ["0x45A318273749d6eb00f5F6cA3bC7cD3De26D642A", "0x5e809A85Aa182A9921EDD10a4163745bb3e36284"],

    base: ["0x45A318273749d6eb00f5F6cA3bC7cD3De26D642A", "0x5e809A85Aa182A9921EDD10a4163745bb3e36284"],
    linea: ["0x45A318273749d6eb00f5F6cA3bC7cD3De26D642A", "0x5e809A85Aa182A9921EDD10a4163745bb3e36284"],
    manta: ["0x45A318273749d6eb00f5F6cA3bC7cD3De26D642A", "0x5e809A85Aa182A9921EDD10a4163745bb3e36284"],
    scroll: ["0x45A318273749d6eb00f5F6cA3bC7cD3De26D642A", "0x5e809A85Aa182A9921EDD10a4163745bb3e36284"],
    mantle: ["0x45A318273749d6eb00f5F6cA3bC7cD3De26D642A", "0x5e809A85Aa182A9921EDD10a4163745bb3e36284"],

    metis: ["0x45A318273749d6eb00f5F6cA3bC7cD3De26D642A", "0x5e809A85Aa182A9921EDD10a4163745bb3e36284"],
    mode: ["0x45A318273749d6eb00f5F6cA3bC7cD3De26D642A", "0x5e809A85Aa182A9921EDD10a4163745bb3e36284"]

} as const;

type SupportedChains = keyof typeof bridgesAddress;

export const getNativeTokenTransfersFromHash = async (
    chain: Chain,
    hashes: string[],
    address_old: string,
    address_new: string,
    nativeToken: string
) => {
    const provider = getProvider(chain) as any;
    const transactions = (
        await Promise.all(
            hashes.map(async (hash) => {
                // TODO: add timeout
                const tx = await provider.getTransaction(hash);
                if (!tx) {
                    return;
                }
                const { blockNumber, from, to, value } = tx;
                if (value <= 0) {
                    return;
                }
                if (!(address_old === from || address_old === to || address_new === from || address_new === to)) {
                    return;
                }
                const isDeposit = (address_old === to || address_new == to);
                return {
                    blockNumber: blockNumber,
                    txHash: hash,
                    from: from,
                    to: to,
                    token: nativeToken,
                    amount: value,
                    isDeposit: isDeposit,
                } as EventData;
            })
        )
    ).filter((tx) => tx) as EventData[];
    return transactions;
};

const constructParams = (chain: SupportedChains) => {
    let eventParams = [] as PartialContractEventParams[];
    const bridgeAddress = bridgesAddress[chain];

    const oldDepositParams = constructTransferParams(bridgeAddress[0], true, {}, {}, chain);
    const oldWithdrawParams = constructTransferParams(bridgeAddress[0], false, {}, {}, chain);

    const newDepositParams = constructTransferParams(bridgeAddress[1], true, {}, {}, chain);
    const newWithdrawParams = constructTransferParams(bridgeAddress[1], false, {}, {}, chain);

    eventParams = [oldDepositParams, oldWithdrawParams, newDepositParams, newWithdrawParams];

    return async (fromBlock: number, toBlock: number) => {
        const provider = getProvider(chain) as any;
        const results: EventData[] = [];
        const data = {} as any;
        const blocknums = []
        for (let i = fromBlock; i <= toBlock; i++) {
            blocknums.push(i);
        }

        await PromisePool.withConcurrency(10)
            .for(blocknums)
            .process(async (blocknum) => {
                const block = await retry(async () => provider.getBlock(blocknum), { retries: 3 });
                const r = await getNativeTokenTransfersFromHash(chain as Chain, block.transactions, bridgeAddress[0], bridgeAddress[1], "0x0000000000000000000000000000000000000000")
                data[blocknum] = r;
            });
        const eventDatas = Object.values(data) as EventData[][];
        for (const eventData of eventDatas) {
            results.push(...eventData);
        }
        const r = await getTxDataFromEVMEventLogs("owlto", chain as Chain, fromBlock, toBlock, eventParams);
        results.push(...r);
        return results;
    };
}


const adapter: BridgeAdapter = {
    arbitrum: constructParams("arbitrum"),
    "arbitrum nova": constructParams("arbitrum_nova"),
    ethereum: constructParams("ethereum"),
    optimism: constructParams("optimism"),
    metis: constructParams("metis"),
    polygon: constructParams("polygon"),
    "polygon zkevm": constructParams("polygon_zkevm"),
    "zksync era": constructParams("era"),
    bsc: constructParams("bsc"),

    base: constructParams("base"),
    linea: constructParams("linea"),
    scroll: constructParams("scroll"),
    mantle: constructParams("mantle"),
    manta: constructParams("manta"),
};

export default adapter;
