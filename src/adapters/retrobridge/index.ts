import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { getTxsBlockRangeEtherscan, wait } from "../../helpers/etherscan";
import { getTxsBlockRangeMerlinScan } from "../../helpers/merlin";
import { getTxsBlockRangeBtrScan } from "../../helpers/btr";
import { EventData } from "../../utils/types";

export const bridgesAddress = {
    arbitrum: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    arbitrum_nova: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    ethereum: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    bsc: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    polygon: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    optimism: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    era: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    polygon_zkevm: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    base: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    linea: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    manta: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    scroll: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    mantle: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    metis: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    mode: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    blast: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    merlin: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    "b2-mainnet": ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    btr: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    xlayer: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    taiko: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    zklink: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    op_bnb: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    mint: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    avax: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    kroma: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    zora: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    gravity: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    zircuit: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    bob: ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    "rari_chain": ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
    "zeta_chain": ["0x817564ded16b378B0998a1880Cbb2B68c7886192"],
} as const;

export const contractsAddress = {
    arbitrum: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    arbitrum_nova: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    ethereum: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    bsc: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    polygon: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    optimism: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    era: ["0x22158e226D68D91378f30Ae42b6F6a039bcCACf8"],
    polygon_zkevm: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    base: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    linea: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    manta: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    scroll: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    mantle: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    metis: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    mode: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    blast: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    merlin: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    "b2-mainnet": ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    btr: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    xlayer: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    taiko: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    zklink: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    op_bnb: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    mint: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    avax: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    kroma: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    zora: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    gravity: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    zircuit: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    bob: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    "rari_chain": ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
    "zeta_chain": ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
} as const;

const nativeTokens: Record<string, string> = {
    ethereum: "0x0000000000000000000000000000000000000000",
    arbitrum: "0x0000000000000000000000000000000000000000",
    optimism: "0x0000000000000000000000000000000000000000",
    base: "0x0000000000000000000000000000000000000000",
    linea: "0x0000000000000000000000000000000000000000",
    blast: "0x0000000000000000000000000000000000000000",
    scroll: "0x0000000000000000000000000000000000000000",
    polygon: "0x0000000000000000000000000000000000000000",
    bsc: "0x0000000000000000000000000000000000000000",
    polygon_zkevm: "0x0000000000000000000000000000000000000000",
    era: "0x0000000000000000000000000000000000000000",
    arbitrum_nova: "0x0000000000000000000000000000000000000000",
    merlin: "0x0000000000000000000000000000000000000000",
    taiko: "0x0000000000000000000000000000000000000000",
    btr: "0x0000000000000000000000000000000000000000",
    zklink: "0x0000000000000000000000000000000000000000",
};

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
            const eventLogData = await getTxDataFromEVMEventLogs("retrobridge", chain as Chain, fromBlock, toBlock, eventParams);

            const nativeEvents = await Promise.all([
                ...bridgeAddress.map(async (address: string, i: number) => {
                    await wait(300 * i); // for etherscan
                    let txs: any[] = [];
                    if (chain === "merlin") {
                        txs = await getTxsBlockRangeMerlinScan(address, fromBlock, toBlock, {
                            includeSignatures: ["0x"],
                        });
                    } else if (chain === "btr") {
                        txs = await getTxsBlockRangeBtrScan(address, fromBlock, toBlock, {
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
                            isDeposit: address.toLowerCase() === tx.to,
                        };
                        return event;
                    });

                    return eventsRes;
                }),
                ...contractAddress.map(async (address: string, i: number) => {
                    await wait(300 * i); // for etherscan
                    let txs: any[] = [];
                    if (chain === "merlin") {
                        txs = await getTxsBlockRangeMerlinScan(address, fromBlock, toBlock, {
                            includeSignatures: ["0xddf252ad"],
                        });
                    } else if (chain === "btr") {
                        txs = await getTxsBlockRangeBtrScan(address, fromBlock, toBlock, {
                            includeSignatures: ["0xddf252ad"],
                        });
                    } else {
                        txs = await getTxsBlockRangeEtherscan(chain, address, fromBlock, toBlock, {
                            includeSignatures: ["0xddf252ad"],
                        });
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
            getTxDataFromEVMEventLogs("retrobridge", chain as Chain, fromBlock, toBlock, eventParams);
    }
}

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
  "zksync era": constructParams("era"),
  "polygon zkevm": constructParams("polygon_zkevm"),
  "arbitrum nova": constructParams("arbitrum_nova"),
  "x layer": constructParams("xlayer"),
  opbnb: constructParams("op_bnb"),
  linea: constructParams("linea"),
  base: constructParams("base"),
  metis: constructParams("metis"),
  manta: constructParams("manta"),
  mantle: constructParams("mantle"),
  scroll: constructParams("scroll"),
  merlin: constructParams("merlin"),
  bsquared: constructParams("b2-mainnet"),
  bitlayer: constructParams("btr"),
  mint: constructParams("mint"),
  kroma: constructParams("kroma"),
  zora: constructParams("zora"),
  gravity: constructParams("gravity"),
  zircuit: constructParams("zircuit"),
  bob: constructParams("bob"),
  "rari chain": constructParams("rari_chain"),
  "zeta chain": constructParams("zeta_chain"),
  blast: constructParams("blast"),
  taiko: constructParams("taiko"),
  zklink: constructParams("zklink"),
  mode: constructParams("mode"),
};

export default adapter;
