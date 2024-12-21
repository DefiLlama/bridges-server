import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";
import { Chain } from "@defillama/sdk/build/general";
import { EventData } from "../../utils/types";
import { getTxsBlockRangeEtherscan, wait } from "../../helpers/etherscan";
import { getTxsBlockRangeMerlinScan } from "../../helpers/merlin";
import { getTxsBlockRangeBtrScan } from "../../helpers/btr";

const retry = require("async-retry");


export const contractsAddress = {
    arbitrum: ["0x0e83DEd9f80e1C92549615D96842F5cB64A08762"],
    arbitrum_nova: ["0x0e83DEd9f80e1C92549615D96842F5cB64A08762"],
    ethereum: ["0x0e83DEd9f80e1C92549615D96842F5cB64A08762"],
    bsc: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    polygon: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    optimism: ["0x0e83DEd9f80e1C92549615D96842F5cB64A08762"],
    era: ["0x95cDd9632C924d2cb5586168Cf0Ba7640dF30598"],
    polygon_zkevm: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    base: ["0xB5CeDAF172425BdeA4c186f6fCF30b367273DA19", "0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    linea: ["0xA562e2510ECDACAa1DB482fd287454AD2B979fa6", "0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    manta: ["0x936223FA057a7c852d5E7462e7E77DBDb137bff8", "0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    scroll: ["0x575Dbe0023d2602515a73d4f0B5Ee857E8EbA805", "0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    mantle: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    metis: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    mode: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    blast: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    merlin: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    zkfair: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    bsquared: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    btr: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    xlayer: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    taiko: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    zklink: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    op_bnb: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    bouncebit: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    mint: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    avax: ["0x3F0F0E6411F859Da1A1BbF8bD6217cA93820Bb98"],
    xdai: ["0x0e38371051912e49Ee139798a93f36b51Ab1D469"],
    morph: ["0x3F0F0E6411F859Da1A1BbF8bD6217cA93820Bb98"],
    bob: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    gravity: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    zora: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    kroma: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    zeta: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    astrzk: ["0x7CFE8Aa0d8E92CCbBDfB12b95AEB7a54ec40f0F5"],
    zircuit: ["0x7CFE8Aa0d8E92CCbBDfB12b95AEB7a54ec40f0F5"],
    lisk: ["0x3F0F0E6411F859Da1A1BbF8bD6217cA93820Bb98"],
    cyeth: ["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    fantom:["0x7CFE8Aa0d8E92CCbBDfB12b95AEB7a54ec40f0F5"],
    fuse:["0x7CFE8Aa0d8E92CCbBDfB12b95AEB7a54ec40f0F5"],
    klaytn:["0x7CFE8Aa0d8E92CCbBDfB12b95AEB7a54ec40f0F5"],
    cronos_zkevm:["0x7CFE8Aa0d8E92CCbBDfB12b95AEB7a54ec40f0F5"],
    wc: ["0x5b9d8AdCf93557E95902D1d91Bf73d12Becd2cC9"],
    rari:["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    ink:["0x7CFE8Aa0d8E92CCbBDfB12b95AEB7a54ec40f0F5"],
    matchain:["0x3F0F0E6411F859Da1A1BbF8bD6217cA93820Bb98"],
    fraxtal:["0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7"],
    shape:["0x7CFE8Aa0d8E92CCbBDfB12b95AEB7a54ec40f0F5"],
} as const;

const nativeTokens: Record<string, string> = {
    ethereum: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    polygon: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    bsc: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    avax:"0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    fantom:"0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
    arbitrum: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    optimism: "0x4200000000000000000000000000000000000006",
    base: "0x4200000000000000000000000000000000000006",
    linea: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f",
    blast: "0x4300000000000000000000000000000000000004",
    scroll: "0x5300000000000000000000000000000000000004",
    arbitrum_nova: "0x722E8BdD2ce80A4422E880164f2079488e115365",
    polygon_zkevm: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    era: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
    zklink: "0x8280a4e7D5B3B658ec4580d3Bc30f5e50454F169",
    taiko: "0xA51894664A773981C6C112C43ce576f315d5b1B6",
    mantle:"0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8",
    merlin: "0xF6D226f9Dc15d9bB51182815b320D3fBE324e1bA",
    btr: "0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f",
};

const depositParams: PartialContractEventParams = {
    target: "",
    topic: "Deposit(address,address,address,string,uint256,uint256,uint256,uint256)",
    abi: [
      "event Deposit(address user, address token, address maker, string target, uint256 amount, uint256 destination, uint256 channel, uint256 timestamp)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      amount: "amount",
      to: "maker",
      from: "user",
      token: "token",
    },
    isDeposit: true,
  };

  
type SupportedChains = keyof typeof contractsAddress;

const constructParams = (chain: SupportedChains) => {
    const bridgeAddress = ["0x5e809A85Aa182A9921EDD10a4163745bb3e36284"]
    const contractAddress = contractsAddress[chain];

    let eventParams = [] as any;
    bridgeAddress.map((address: string) => {
        const transferWithdrawalParams: PartialContractEventParams = constructTransferParams(address, false);
        const transferDepositParams: PartialContractEventParams = constructTransferParams(address, true);
        eventParams.push(transferWithdrawalParams, transferDepositParams, depositParams);
    });

    if (nativeTokens.hasOwnProperty(chain)) {
        return async (fromBlock: number, toBlock: number) => {
            const eventLogData = await getTxDataFromEVMEventLogs("owlto", chain as Chain, fromBlock, toBlock, eventParams);

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
                            includeSignatures: ["0xfc180638"],
                        });
                    } else if (chain === "btr") {
                        txs = await getTxsBlockRangeBtrScan(address, fromBlock, toBlock, {
                            includeSignatures: ["0xfc180638"],
                        });
                    } else {
                        txs = await getTxsBlockRangeEtherscan(chain, address, fromBlock, toBlock, {
                            includeSignatures: ["0xfc180638"],
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
            getTxDataFromEVMEventLogs("owlto", chain as Chain, fromBlock, toBlock, eventParams);
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
    mode: constructParams("mode"),
    manta: constructParams("manta"),
    metis: constructParams("metis"),
    mantle: constructParams("mantle"),
    zkfair: constructParams("zkfair"),
    merlin: constructParams("merlin"),
    bsquared: constructParams("bsquared"),
    bitlayer: constructParams("btr"),
    taiko: constructParams("taiko"),
    opbnb: constructParams("op_bnb"),
    bouncebit: constructParams("bouncebit"),
    mint: constructParams("mint"),
    avalanche: constructParams("avax"),
    gnosis: constructParams("xdai"),
    morph: constructParams("morph"),
    bob: constructParams("bob"),
    gravity: constructParams("gravity"),
    zora: constructParams("zora"),
    kroma: constructParams("kroma"),
    zetachain: constructParams("zeta"),
    zircuit: constructParams("zircuit"),
    lisk: constructParams("lisk"),
    cyber: constructParams("cyeth"),
    fantom:constructParams("fantom"),
    fuse:constructParams("fuse"),
    kaia:constructParams("klaytn"),
    rari:constructParams("rari"),
    ink:constructParams("ink"),
    matchain:constructParams("matchain"),
    shape:constructParams("shape"),
    fraxtal:constructParams("fraxtal"),   
    "cronos zkevm": constructParams("cronos_zkevm"),
    'x layer': constructParams("xlayer"),
    "arbitrum nova": constructParams("arbitrum_nova"),
    "polygon zkevm": constructParams("polygon_zkevm"),
    "zksync era": constructParams("era"),
    "astar zkevm": constructParams("astrzk"),
    "zklink nova": constructParams("zklink"),
    "world chain":constructParams("wc"),   
};

export default adapter;
