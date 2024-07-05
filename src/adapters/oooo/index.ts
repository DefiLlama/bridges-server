import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";
import { Chain } from "@defillama/sdk/build/general";
import { EventData } from "../../utils/types";
import { getTxsBlockRangeEtherscan, wait } from "../../helpers/etherscan";
import { getTxsBlockRangeMerlinScan } from "../../helpers/merlin";
import { getTxsBlockRangeBtrScan } from "../../helpers/btr";

export const bridgesAddress = {
    arbitrum: ["0xfe07bc6cb1fc0bf79716ab35c42763e4232e96c8", "0xf5e3E5D96a12470b2DAdb91FFBA89fDD6e07907B", "0x09c9df7b4745443422ee0919121a3ab329e03a7a", "0xf793e143f36beb4ed902328484fba5a2630948b3", "0xcd6421ae52eb8c8dc1bf077be5988f7328785df8"],
    bsc: ["0xfe07bc6cb1fc0bf79716ab35c42763e4232e96c8", "0xf5e3E5D96a12470b2DAdb91FFBA89fDD6e07907B", "0x09c9df7b4745443422ee0919121a3ab329e03a7a", "0xf793e143f36beb4ed902328484fba5a2630948b3", "0xcd6421ae52eb8c8dc1bf077be5988f7328785df8"],
    merlin: ["0xfe07bc6cb1fc0bf79716ab35c42763e4232e96c8", "0xf5e3E5D96a12470b2DAdb91FFBA89fDD6e07907B", "0x09c9df7b4745443422ee0919121a3ab329e03a7a", "0xf793e143f36beb4ed902328484fba5a2630948b3", "0xcd6421ae52eb8c8dc1bf077be5988f7328785df8"],
    "b2-mainnet": ["0xfe07bc6cb1fc0bf79716ab35c42763e4232e96c8", "0xd3be6713f9dfa3cecd6e71aaf69e98977aa3f79b", "0x09c9df7b4745443422ee0919121a3ab329e03a7a", "0xf793e143f36beb4ed902328484fba5a2630948b3", "0xcd6421ae52eb8c8dc1bf077be5988f7328785df8"],
    btr: ["0xfe07bc6cb1fc0bf79716ab35c42763e4232e96c8", "0x44a263c4efec6e4ea38ffb36acc8dc84574c9015", "0x09c9df7b4745443422ee0919121a3ab329e03a7a", "0xf793e143f36beb4ed902328484fba5a2630948b3", "0xcd6421ae52eb8c8dc1bf077be5988f7328785df8"],
    "rsk": ["0xfe07bc6cb1fc0bf79716ab35c42763e4232e96c8", "0xf0d865194a1b6636a4df7a0a2fa58eb03967e29e", "0x09c9df7b4745443422ee0919121a3ab329e03a7a", "0xf793e143f36beb4ed902328484fba5a2630948b3", "0xcd6421ae52eb8c8dc1bf077be5988f7328785df8"]
} as const;

const nativeTokens: Record<string, string> = {
    arbitrum: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    bsc: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    merlin: "0xF6D226f9Dc15d9bB51182815b320D3fBE324e1bA",
    "b2-mainnet": "0x8dbf84c93727c85DB09478C83a8621e765D20eC2",
    btr: "0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f",
    "rsk": "0x542FDA317318eBf1d3DeAF76E0B632741a7e677d",
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
            const eventLogData = await getTxDataFromEVMEventLogs("oooo", chain as Chain, fromBlock, toBlock, eventParams);

            const nativeEvents = await Promise.all([
                ...bridgeAddress.map(async (address: string, i: number) => {
                    await wait(300 * i); // for etherscan
                    let txs: any[] = [];
                    if (chain === "merlin" || chain === "b2-mainnet") {
                        txs = await getTxsBlockRangeMerlinScan(address, fromBlock, toBlock, {
                            includeSignatures: ["0x"],
                        });
                    } else if(chain === "btr") {
                      txs = await getTxsBlockRangeBtrScan(address, fromBlock, toBlock, {
                        includeSignatures: ["0x"],
                      })
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
              ]
            );


            const allEvents = [...eventLogData, ...nativeEvents.flat()];
            return allEvents;
        };
    } else {
        return async (fromBlock: number, toBlock: number) =>
            getTxDataFromEVMEventLogs("oooo", chain as Chain, fromBlock, toBlock, eventParams);
    }
}

const adapter: BridgeAdapter = {
    arbitrum: constructParams("arbitrum"),
    bsc: constructParams("bsc"),
    merlin: constructParams("merlin"),
    bsquared: constructParams("b2-mainnet"),
    bitlayer: constructParams("btr"),
    // rootstock: constructParams("rsk"),
    // bevm
    // bevm_canary
    // btc
    // bob
    // alienx
};

export default adapter;
