import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";
import { Chain } from "@defillama/sdk/build/general";
import { EventData } from "../../utils/types";
import { getTxsBlockRangeEtherscan, wait } from "../../helpers/etherscan";
import {getTxsBlockRangeMerlinScan} from "../../helpers/merlin";

export const bridgesAddress = {
    ethereum: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    arbitrum: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    avax: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    bsquared: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    btr: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    merlin: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    optimism: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    era: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    polygon_zkevm: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    base: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    linea: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    manta: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    mantle: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    metis: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    mode: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    scroll: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    blast: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    xlayer: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    taiko: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    zklink: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    op_bnb: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    bsc: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    polygon: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    telos: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
    zkfair: ["0x00000000000007736e2F9aA5630B8c812E1F3fc9"],
} as const;


const nativeTokens: Record<string, string> = {
    ethereum: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    arbitrum: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    optimism: "0x4200000000000000000000000000000000000006",
    base: "0x4200000000000000000000000000000000000006",
    linea: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f",
    blast: "0x4300000000000000000000000000000000000004",
    polygon: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    scroll: "0x5300000000000000000000000000000000000004",
    mode: "0x4200000000000000000000000000000000000006",
    manta: "0x0Dc808adcE2099A9F62AA87D9670745AbA741746",
    metis: "0x75cb093E4D61d2A2e65D8e0BBb01DE8d89b53481",
    polygon_zkevm: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    era: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
    merlin: "0xF6D226f9Dc15d9bB51182815b320D3fBE324e1bA",
    zklink: "0x000000000000000000000000000000000000800A",
    btr: "0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f",
    xlayer: "0x5a77f1443d16ee5761d310e38b62f77f726bc71c",
    op_bnb: "0xe7798f023fc62146e8aa1b36da45fb70855a77ea",
    bsc: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    mantle: "0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111",
    zkfair: "0x4b21b980d0Dc7D3C0C6175b0A412694F3A1c7c6b",
    bsquared: "0x8dbf84c93727c85DB09478C83a8621e765D20eC2",
    taiko: "0xA51894664A773981C6C112C43ce576f315d5b1B6",
    telos: "0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E",
    avax: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
};

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
            const eventLogData = await getTxDataFromEVMEventLogs("minibridge", chain as Chain, fromBlock, toBlock, eventParams);

            const nativeEvents = await Promise.all([
                ...bridgeAddress.map(async (address: string, i: number) => {
                    await wait(300 * i); // for etherscan
                    let txs: any[] = [];
                    if (chain === "merlin") {
                        txs = await getTxsBlockRangeMerlinScan(address, fromBlock, toBlock, {
                            includeSignatures: ["0x"],
                        });
                    } else {
                        txs = await getTxsBlockRangeEtherscan(chain, address, fromBlock, toBlock, {
                            includeSignatures: ["0x"],
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
            getTxDataFromEVMEventLogs("minibridge", chain as Chain, fromBlock, toBlock, eventParams);
    }
}

const adapter: BridgeAdapter = {
    ethereum: constructParams("ethereum"),
    arbitrum: constructParams("arbitrum"),
    avalanche: constructParams("avax"),
    optimism: constructParams("optimism"),
    base: constructParams("base"),
    linea: constructParams("linea"),
    blast: constructParams("blast"),
    polygon: constructParams("polygon"),
    scroll: constructParams("scroll"),
    bsc: constructParams("bsc"),
    mode: constructParams("mode"),
    manta: constructParams("manta"),
    metis: constructParams("metis"),
    mantle: constructParams("mantle"),
    zkfair: constructParams("zkfair"),
    merlin: constructParams("merlin"),
    bsquared: constructParams("bsquared"),
    bitlayer: constructParams("btr"),
    taiko: constructParams("taiko"),
    telos: constructParams("telos"),
    zklink: constructParams("zklink"),
    opbnb: constructParams("op_bnb"),
    'x layer': constructParams("xlayer"),
    "polygon zkevm": constructParams("polygon_zkevm"),
    "zksync era": constructParams("era"),
};

export default adapter;
