import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";
import { Chain } from "@defillama/sdk/build/general";
import { EventData } from "../../utils/types";
import { getTxsBlockRangeEtherscan, wait } from "../../helpers/etherscan";
import { getTxsBlockRangeMerlinScan } from "../../helpers/merlin";

export const bridgesAddress = {
    ethereum: ["0xB50Ac92D6d8748AC42721c25A3e2C84637385A6b"],
    arbitrum: ["0xB50Ac92D6d8748AC42721c25A3e2C84637385A6b"],
    optimism: ["0xB50Ac92D6d8748AC42721c25A3e2C84637385A6b"],
    era: ["0xB50Ac92D6d8748AC42721c25A3e2C84637385A6b"],
    base: ["0xB50Ac92D6d8748AC42721c25A3e2C84637385A6b"],
    linea: ["0xB50Ac92D6d8748AC42721c25A3e2C84637385A6b"],
    scroll: ["0xB50Ac92D6d8748AC42721c25A3e2C84637385A6b"],
    blast: ["0xB50Ac92D6d8748AC42721c25A3e2C84637385A6b"],
    xlayer: ["0xB50Ac92D6d8748AC42721c25A3e2C84637385A6b"],
    taiko: ["0xB50Ac92D6d8748AC42721c25A3e2C84637385A6b"],
    zklink: ["0xB50Ac92D6d8748AC42721c25A3e2C84637385A6b"],
    bsc: ["0xB50Ac92D6d8748AC42721c25A3e2C84637385A6b"],
    mode: ["0xB50Ac92D6d8748AC42721c25A3e2C84637385A6b"],
    merlin: ["0xB50Ac92D6d8748AC42721c25A3e2C84637385A6b"],
    manta: ["0xB50Ac92D6d8748AC42721c25A3e2C84637385A6b"],
    "b2-mainnet": ["0xB50Ac92D6d8748AC42721c25A3e2C84637385A6b"],
} as const;

export const contractsAddress = {
    ethereum: ["0x0fbCf4a62036E96C4F6770B38a9B536Aa14d1846"],
    arbitrum: ["0x0fbCf4a62036E96C4F6770B38a9B536Aa14d1846"],
    optimism: ["0x0fbCf4a62036E96C4F6770B38a9B536Aa14d1846"],
    era: ["0xA151d87100352089e52a70Ca8D52983cC9b39D47"],
    base: ["0x0fbCf4a62036E96C4F6770B38a9B536Aa14d1846"],
    linea: ["0x0fbCf4a62036E96C4F6770B38a9B536Aa14d1846"],
    scroll: ["0x0fbCf4a62036E96C4F6770B38a9B536Aa14d1846"],
    blast: ["0x0fbCf4a62036E96C4F6770B38a9B536Aa14d1846"],
    xlayer: ["0x0fbCf4a62036E96C4F6770B38a9B536Aa14d1846"],
    taiko: ["0x0fbCf4a62036E96C4F6770B38a9B536Aa14d1846"],
    zklink: ["0xA151d87100352089e52a70Ca8D52983cC9b39D47"],
    bsc: ["0x0fbCf4a62036E96C4F6770B38a9B536Aa14d1846"],
    mode: ["0x0fbCf4a62036E96C4F6770B38a9B536Aa14d1846"],
    merlin: ["0x0fbCf4a62036E96C4F6770B38a9B536Aa14d1846"],
    manta: ["0x0fbCf4a62036E96C4F6770B38a9B536Aa14d1846"],
    "b2-mainnet": ["0x0fbCf4a62036E96C4F6770B38a9B536Aa14d1846"],
} as const;

const nativeTokens: Record<string, string> = {
    ethereum: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    arbitrum: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    optimism: "0x4200000000000000000000000000000000000006",
    base: "0x4200000000000000000000000000000000000006",
    linea: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f",
    blast: "0x4300000000000000000000000000000000000004",
    scroll: "0x5300000000000000000000000000000000000004",
    polygon: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    bsc: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    era: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
    merlin: "0xF6D226f9Dc15d9bB51182815b320D3fBE324e1bA",
};
const nativeTokenTransferSignature = ["0x535741", "0x"];

type SupportedChains = keyof typeof bridgesAddress;

const constructParams = (chain: SupportedChains) => {
    const bridgeAddress = bridgesAddress[chain];
    const contractAddress = contractsAddress[chain];

    let eventParams = [] as any;
    bridgeAddress.map((address: string) => {
        const transferWithdrawalParams: PartialContractEventParams = constructTransferParams(address, false);
        const transferDepositParams: PartialContractEventParams = constructTransferParams(address, true);
        eventParams.push(transferWithdrawalParams, transferDepositParams);
    });

    if (nativeTokens.hasOwnProperty(chain)) {
        return async (fromBlock: number, toBlock: number) => {
            const eventLogData = await getTxDataFromEVMEventLogs("comet", chain as Chain, fromBlock, toBlock, eventParams);
            const nativeEvents = await Promise.all([
                ...bridgeAddress.map(async (address: string, i: number) => {
                    await wait(300 * i); // for etherscan
                    let txs: any[] = [];
                        txs = await getTxsBlockRangeEtherscan(chain, address, fromBlock, toBlock);
            
                    const eventsRes: EventData[] = txs.map((tx: any) => {
                        const event: EventData = {
                            txHash: tx.hash,
                            blockNumber: +tx.blockNumber,
                            from: tx.from,
                            to: tx.to,
                            token: nativeTokens[chain],
                            amount: tx.value,
                            isDeposit: address === tx.to,
                        };
                        return event;
                    });

                    return eventsRes;
                }),
                ...contractAddress.map(async (address: string, i: number) => {
                    await wait(300 * i); // for etherscan
                    let txs: any[] = [];
                    if (chain === "merlin") {
                        txs = await getTxsBlockRangeMerlinScan(address, fromBlock, toBlock);
                    } else {
                        txs = await getTxsBlockRangeEtherscan(chain, address, fromBlock, toBlock);
                    }
                    const eventsRes: EventData[] = txs.filter((tx: any) => String(tx.value) != "0").map((tx: any) => {
                        const event: EventData = {
                            txHash: tx.hash,
                            blockNumber: +tx.blockNumber,
                            from: tx.from,
                            to: tx.to,
                            token: nativeTokens[chain],
                            amount: tx.value,
                            isDeposit: address.toLowerCase() === tx.to,
                        };
                        return event;
                    });

                    return eventsRes;
                })
            ]
            );
            const allEvents = [...eventLogData, ...nativeEvents.flat()];
            return allEvents;
        };
    } else {
        return async (fromBlock: number, toBlock: number) =>
            getTxDataFromEVMEventLogs("comet", chain as Chain, fromBlock, toBlock, eventParams);
    }
}


const adapter: BridgeAdapter = {
    ethereum: constructParams("ethereum"),
    arbitrum: constructParams("arbitrum"),
    optimism: constructParams("optimism"),
    base: constructParams("base"),
    linea: constructParams("linea"),
    blast: constructParams("blast"),
    scroll: constructParams("scroll"),
    bsc: constructParams("bsc"),
    taiko: constructParams("taiko"),
    zklink: constructParams("zklink"),
    manta: constructParams("manta"),

    'x layer': constructParams("xlayer"),
    "zksync era": constructParams("era"),
};

export default adapter;
