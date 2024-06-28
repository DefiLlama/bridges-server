import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";
import { Chain } from "@defillama/sdk/build/general";
import { EventData } from "../../utils/types";
import { getTxsBlockRangeEtherscan, wait } from "../../helpers/etherscan";

export const bridgesAddress = {
    ethereum: ["0x623777cc098c6058a46cf7530f45150ff6a8459d"],
    arbitrum: ["0x623777cc098c6058a46cf7530f45150ff6a8459d"],
    optimism: ["0x623777cc098c6058a46cf7530f45150ff6a8459d"],
    era: ["0x623777cc098c6058a46cf7530f45150ff6a8459d"],
    polygon_zkevm: ["0x623777cc098c6058a46cf7530f45150ff6a8459d"],
    base: ["0x623777cc098c6058a46cf7530f45150ff6a8459d"],
    linea: ["0x623777cc098c6058a46cf7530f45150ff6a8459d"],
    scroll: ["0x623777cc098c6058a46cf7530f45150ff6a8459d"],
    blast: ["0x623777cc098c6058a46cf7530f45150ff6a8459d"],
    xlayer: ["0x623777cc098c6058a46cf7530f45150ff6a8459d"],
    taiko: ["0x623777cc098c6058a46cf7530f45150ff6a8459d"],
    zklink: ["0x623777cc098c6058a46cf7530f45150ff6a8459d"],
    op_bnb: ["0x623777cc098c6058a46cf7530f45150ff6a8459d"],
    bsc: ["0x623777cc098c6058a46cf7530f45150ff6a8459d"],
    polygon: ["0x623777cc098c6058a46cf7530f45150ff6a8459d"],
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
    polygon_zkevm: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    era: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
    arbitrum_nova: "0x722E8BdD2ce80A4422E880164f2079488e115365",
};
const nativeTokenTransferSignature = ["0x535741", "0x"];

type SupportedChains = keyof typeof bridgesAddress;

const constructParams = (chain: SupportedChains) => {
    const bridgeAddress = bridgesAddress[chain];

    let eventParams = [] as any;
    bridgeAddress.map((address: string) => {
        const transferWithdrawalParams: PartialContractEventParams = constructTransferParams(address, false);
        const transferDepositParams: PartialContractEventParams = constructTransferParams(address, true);
        eventParams.push(transferWithdrawalParams, transferDepositParams);
    });

    if (nativeTokens.hasOwnProperty(chain)) {
        return async (fromBlock: number, toBlock: number) => {
            const eventLogData = await getTxDataFromEVMEventLogs("memebridge", chain as Chain, fromBlock, toBlock, eventParams);

            const nativeEvents = await Promise.all([
                ...bridgeAddress.map(async (address: string, i: number) => {
                    await wait(300 * i); // for etherscan
                    let txs: any[] = [];
                        txs = await getTxsBlockRangeEtherscan(chain, address, fromBlock, toBlock, {
                            includeSignatures: nativeTokenTransferSignature,
                        });
            
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
            ]
            );
            const allEvents = [...eventLogData, ...nativeEvents.flat()];
            return allEvents;
        };
    } else {
        return async (fromBlock: number, toBlock: number) =>
            getTxDataFromEVMEventLogs("memebridge", chain as Chain, fromBlock, toBlock, eventParams);
    }
}


const adapter: BridgeAdapter = {
    ethereum: constructParams("ethereum"),
    arbitrum: constructParams("arbitrum"),
    optimism: constructParams("optimism"),
    base: constructParams("base"),
    linea: constructParams("linea"),
    blast: constructParams("blast"),
    polygon: constructParams("polygon"),
    scroll: constructParams("scroll"),
    bsc: constructParams("bsc"),
    taiko: constructParams("taiko"),
    zklink: constructParams("zklink"),
    opbnb: constructParams("op_bnb"),

    'x layer': constructParams("xlayer"),
    "polygon zkevm": constructParams("polygon_zkevm"),
    "zksync era": constructParams("era"),
};

export default adapter;
