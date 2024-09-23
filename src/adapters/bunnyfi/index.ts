import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";
import { Chain } from "@defillama/sdk/build/general";
import { EventData } from "../../utils/types";
import { getTxsBlockRangeEtherscan, wait } from "../../helpers/etherscan";
import { getTxsBlockRangeBtrScan } from "../../helpers/btr";
import { getTxsBlockRangeL2Scan } from "../../helpers/l2scan";

export const bridgesAddress = {
    arbitrum: ["0x0000000000D310F8802cC91F198d14bC2303230B"],
    ethereum: ["0x0000000000D310F8802cC91F198d14bC2303230B"],
    bsc: ["0x0000000000D310F8802cC91F198d14bC2303230B"],
    optimism: ["0x0000000000D310F8802cC91F198d14bC2303230B"],
    era: ["0x0000000000D310F8802cC91F198d14bC2303230B"],
    polygon_zkevm: ["0x0000000000D310F8802cC91F198d14bC2303230B"],
    base: ["0x0000000000D310F8802cC91F198d14bC2303230B"],
    linea: ["0x0000000000D310F8802cC91F198d14bC2303230B"],
    manta: ["0x0000000000D310F8802cC91F198d14bC2303230B"],
    scroll: ["0x0000000000D310F8802cC91F198d14bC2303230B"],
    mode: ["0x0000000000D310F8802cC91F198d14bC2303230B"],
    blast: ["0x0000000000D310F8802cC91F198d14bC2303230B"],
    merlin: ["0x0000000000D310F8802cC91F198d14bC2303230B"],
    zkfair: ["0x0000000000D310F8802cC91F198d14bC2303230B"],
    "b2-mainnet": ["0x0000000000D310F8802cC91F198d14bC2303230B"],
    btr: ["0x0000000000D310F8802cC91F198d14bC2303230B"],
    xlayer: ["0x0000000000D310F8802cC91F198d14bC2303230B"],
    taiko: ["0x0000000000D310F8802cC91F198d14bC2303230B"],
    zklink: ["0x0000000000D310F8802cC91F198d14bC2303230B"],
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
            const eventLogData = await getTxDataFromEVMEventLogs("bunnyfi", chain as Chain, fromBlock, toBlock, eventParams);

            const nativeEvents = await Promise.all([
                ...bridgeAddress.map(async (address: string, i: number) => {
                    await wait(300 * i); // for etherscan
                    let txs: any[] = [];
                    if (chain === "merlin" || chain === "b2-mainnet") {
                        txs = await getTxsBlockRangeL2Scan(chain, address, fromBlock, toBlock, {
                            includeSignatures: ["0x", "0x88d695b2"],
                        });
                    } else if(chain === "btr") {
                      txs = await getTxsBlockRangeBtrScan(address, fromBlock, toBlock, {
                        includeSignatures: ["0x", "0x88d695b2"],
                      })
                    } else {
                        txs = await getTxsBlockRangeEtherscan(chain, address, fromBlock, toBlock, {
                            includeSignatures: nativeTokenTransferSignature,
                        });
                    }
                    const eventsRes: EventData[] = txs.map((tx: any) => {
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
                }),
            ]
            );
            const allEvents = [...eventLogData, ...nativeEvents.flat()];
            return allEvents;
        };
    } else {
        return async (fromBlock: number, toBlock: number) =>
            getTxDataFromEVMEventLogs("bunnyfi", chain as Chain, fromBlock, toBlock, eventParams);
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
    mode: constructParams("mode"),
    manta: constructParams("manta"),
    zkfair: constructParams("zkfair"),
    merlin: constructParams("merlin"),
    bsquared: constructParams("b2-mainnet"),
    bitlayer: constructParams("btr"),
    taiko: constructParams("taiko"),
    zklink: constructParams("zklink"),

    'x layer': constructParams("xlayer"),
    "polygon zkevm": constructParams("polygon_zkevm"),
    "zksync era": constructParams("era"),
};

export default adapter;
