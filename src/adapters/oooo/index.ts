import { BigNumber } from 'ethers';

import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";
import { Chain } from "@defillama/sdk/build/general";
import { EventData } from "../../utils/types";
import { getTxsBlockRangeEtherscan, wait } from "../../helpers/etherscan";
import { getTxsBlockRangeBtrScan } from "../../helpers/btr";
import { getTxsBlockRangeL2Scan } from "../../helpers/l2scan";

export const bridgesAddress = {
    arbitrum: ["0xfe07bc6cb1fc0bf79716ab35c42763e4232e96c8"],
    bsc: ["0xfe07bc6cb1fc0bf79716ab35c42763e4232e96c8"],
    merlin: ["0xfe07bc6cb1fc0bf79716ab35c42763e4232e96c8"],
    "b2-mainnet": ["0xfe07bc6cb1fc0bf79716ab35c42763e4232e96c8"],
    btr: ["0xfe07bc6cb1fc0bf79716ab35c42763e4232e96c8"],
    "rsk": ["0xfe07bc6cb1fc0bf79716ab35c42763e4232e96c8"]
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
                        txs = await getTxsBlockRangeL2Scan(chain, address, fromBlock, toBlock, {
                            includeSignatures: ["0x", "0x88d695b2"],
                        });
                    } else if(chain === "btr") {
                      txs = await getTxsBlockRangeBtrScan(address, fromBlock, toBlock, {
                        includeSignatures: ["0x", "0x88d695b2"],
                      })
                    } else {
                        txs = await getTxsBlockRangeEtherscan(chain, address, fromBlock, toBlock, {
                            includeSignatures: ["0x", "0x88d695b2"],
                        });
                    }
                    const eventsRes: EventData[] = txs.map((tx: any) => {
                        const event: EventData = {
                            txHash: tx.hash,
                            blockNumber: +tx.blockNumber,
                            from: tx.from,
                            to: tx.to,
                            token: nativeTokens[chain],
                            amount: BigNumber.from(tx.value),
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
