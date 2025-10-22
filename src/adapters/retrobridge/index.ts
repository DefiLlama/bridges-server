import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { getTxsBlockRangeEtherscan, wait } from "../../helpers/etherscan";
import { getTxsBlockRangeMerlinScan } from "../../helpers/merlin";
import { getTxsBlockRangeBtrScan } from "../../helpers/btr";
import { EventData } from "../../utils/types";
import { ethers } from "ethers";

export const bridgesAddress = {
    arbitrum: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    arbitrum_nova: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    ethereum: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    bsc: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    polygon: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    optimism: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    era: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    polygon_zkevm: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    base: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    linea: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    manta: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    scroll: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    mantle: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    metis: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    mode: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    blast: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    merlin: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    "b2-mainnet": ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    btr: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    xlayer: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    taiko: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    zklink: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    op_bnb: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    mint: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    avax: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    zora: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    gravity: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    kroma: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
    bob: ["0x009905bf008CcA637185EEaFE8F51BB56dD2ACa7"],
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
    bob: ["0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A"],
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
    manta: "0x0000000000000000000000000000000000000000",
    mode: "0x0000000000000000000000000000000000000000",
    mint: "0x0000000000000000000000000000000000000000",
    zora: "0x0000000000000000000000000000000000000000",
    kroma: "0x0000000000000000000000000000000000000000",
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

            const allAddresses = [...bridgeAddress, ...contractAddress];
            const nativeEvents: EventData[][] = [];

            for (let i = 0; i < allAddresses.length; i++) {
                await wait(500);
                const address = allAddresses[i];
                const isBridgeAddress = i < bridgeAddress.length;

                let txs: any[] = [];
                if (chain === "merlin") {
                    txs = await getTxsBlockRangeMerlinScan(address, fromBlock, toBlock, {
                        includeSignatures: isBridgeAddress ? ["0x"] : [
                            "0x769254a71d2f67d8ac6cb44f2803c0d05cfbcf9effadb6a984f10ff9de3df6c3",
                            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                        ],
                    });
                } else if (chain === "btr") {
                    txs = await getTxsBlockRangeBtrScan(address, fromBlock, toBlock, {
                        includeSignatures: isBridgeAddress ? ["0x"] : [
                            "0x769254a71d2f67d8ac6cb44f2803c0d05cfbcf9effadb6a984f10ff9de3df6c3",
                            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                        ],
                    });
                } else {
                    txs = await getTxsBlockRangeEtherscan(chain, address, fromBlock, toBlock, {
                        includeSignatures: isBridgeAddress ? ["0x"] : [
                            "0x769254a71d2f67d8ac6cb44f2803c0d05cfbcf9effadb6a984f10ff9de3df6c3",
                            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                        ],
                    });
                }

                const filteredTxs = isBridgeAddress ? txs : txs.filter((tx: any) => String(tx.value) != "0");
                const eventsRes: EventData[] = filteredTxs.map((tx: any) => {
                    const event: EventData = {
                        txHash: tx.hash,
                        blockNumber: +tx.blockNumber,
                        from: tx.from,
                        to: tx.to,
                        token: nativeTokens[chain],
                        amount: isBridgeAddress ? tx.value : ethers.BigNumber.from(tx.value),
                        isDeposit: address.toLowerCase() === tx.to,
                    };
                    return event;
                });

                nativeEvents.push(eventsRes);
            }
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
  bob: constructParams("bob"),
  blast: constructParams("blast"),
  taiko: constructParams("taiko"),
  zklink: constructParams("zklink"),
  mode: constructParams("mode"),
};

export default adapter;
