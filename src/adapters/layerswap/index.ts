import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";
import { Chain } from "@defillama/sdk/build/general";
import { getTxsBlockRangeEtherscan, wait } from "../../helpers/etherscan";
import { getTxsBlockRangeMerlinScan } from "../../helpers/merlin";
import { EventData } from "../../utils/types";
import { BigNumber } from "ethers";
import { getTxsBlockRangeBtrScan } from "../../helpers/btr";

const blackListedAddresses = ["0xe2e1808ed4cc4a6f701696086838f511ee187d57"].map((a) => a.toLowerCase());

const solverAddressesEOA = ["0x2fc617e933a52713247ce25730f6695920b3befe"];

const solverAddressesEOAerc = [
  "0x2fc617e933a52713247ce25730f6695920b3befe",
  "0x08b00ceee2fb66029b53d76110b19eeaabfd1e65",
];

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
  arbitrum_nova: "0x722E8BdD2ce80A4422E880164f2079488e115365",
  polygon_zkevm: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  era: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
  merlin: "0xF6D226f9Dc15d9bB51182815b320D3fBE324e1bA",
  zklink: "0x000000000000000000000000000000000000800A",
  btr: "0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f",
  xlayer: "0x5a77f1443d16ee5761d310e38b62f77f726bc71c",
  op_bnb: "0xe7798f023fc62146e8aa1b36da45fb70855a77ea",
  bsc: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
  mantle: "0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111",
  bouncebit: "0x7F150c293c97172C75983BD8ac084c187107eA19",
  zkfair: "0x4b21b980d0Dc7D3C0C6175b0A412694F3A1c7c6b",
  bsquared: "0x8dbf84c93727c85DB09478C83a8621e765D20eC2",
  taiko: "0xA51894664A773981C6C112C43ce576f315d5b1B6",
  abstract: "0x3439153eb7af838ad19d56e1571fbd09333c2809",
  ancient8: "0x4200000000000000000000000000000000000006",
  astar: "0x81ecac0d6be0550a00ff064a4f9dd2400585fe9c",
  avax: "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab",
  berachain: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
  bob: "0x4200000000000000000000000000000000000006",
  celo: "0x66803FB87aBd4aaC3cbB3fAd7C3aa01f6F3FB207",
  fraxtal: "0xfc00000000000000000000000000000000000006",
  fuse: "0xa722c13135930332eb3d749b2f0906559d2c5b99",
  gnosis: "0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1",
  gravity: "0xf6f832466cd6c21967e0d954109403f36bc8ceaa",
  immutable_zkevm: "0x52A6c53869Ce09a731CD772f245b97A4401d3348",
  kcc: "0xf55af137a98607f7ed2efefa4cd2dfe70e4253b1",
  kroma: "0x4200000000000000000000000000000000000001",
  lisk: "0x4200000000000000000000000000000000000006",
  mint: "0x4200000000000000000000000000000000000006",
  morph: "0x5300000000000000000000000000000000000011",
  redstone: "0x4200000000000000000000000000000000000006",
  ronin: "0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5",
  sei: "0x160345fc359604fc6e70e3c5facbde5f7a9342d8",
  soneium: "0x4200000000000000000000000000000000000006",
  superseed: "0x4200000000000000000000000000000000000006",
  unichain: "0x4200000000000000000000000000000000000006",
  wc: "0x4200000000000000000000000000000000000006",
  zetachain: "0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891",
  zircuit: "0x4200000000000000000000000000000000000006",
  zora: "0x4200000000000000000000000000000000000006",
  // fuel: "0x4ea6ccef1215d9479f1024dff70fc055ca538215d2c8c348beddffd54583d0e8",
};

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  solverAddressesEOAerc.map((address: string) => {
    const transferWithdrawalParams: PartialContractEventParams = constructTransferParams(address, false);
    const transferDepositParams: PartialContractEventParams = constructTransferParams(address, true);
    eventParams.push(transferWithdrawalParams, transferDepositParams);
  });

  return async (fromBlock: number, toBlock: number) => {
    const eventLogData = await getTxDataFromEVMEventLogs("layerswap", chain as Chain, fromBlock, toBlock, eventParams);

    const nativeEvents = await Promise.all(
      solverAddressesEOA.map(async (address: string, i: number) => {
        await wait(500 * i); // for etherscan
        let txs: any[] = [];
        if (chain === "merlin") {
          txs = await getTxsBlockRangeMerlinScan(address, fromBlock, toBlock, {});
        } else if (chain === "btr") {
          txs = await getTxsBlockRangeBtrScan(address, fromBlock, toBlock, {});
        } else {
          txs = await getTxsBlockRangeEtherscan(chain, address, fromBlock, toBlock, {});
        }
        const eventsRes: EventData[] = txs.map((tx: any) => {
          const event: EventData = {
            txHash: tx.hash,
            blockNumber: +tx.blockNumber,
            from: tx.from,
            to: tx.to,
            token: nativeTokens[chain],
            amount: BigNumber.from(tx.value),
            isDeposit: address === tx.to,
          };
          return event;
        });

        return eventsRes;
      })
    );

    const allEvents: EventData[] = [...nativeEvents.flat(), ...eventLogData];
    const filteredEvents = allEvents.filter(
      (event) =>
        !blackListedAddresses.includes(event?.from?.toLowerCase()) &&
        !blackListedAddresses.includes(event?.to?.toLowerCase())
    );
    return filteredEvents;
  };
};

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
  taiko: constructParams("taiko"),
  opbnb: constructParams("op_bnb"),
  bouncebit: constructParams("bouncebit-mainnet"),
  mint: constructParams("mint"),
  "x layer": constructParams("xlayer"),
  "arbitrum nova": constructParams("arbitrum_nova"),
  "polygon zkevm": constructParams("polygon_zkevm"),
  "zksync era": constructParams("era"),
  gnosis: constructParams("xdai"),
  avalanche: constructParams("avax"),
  gravity: constructParams("gravity"),
  bob: constructParams("bob"),
  zora: constructParams("zora"),
  kroma: constructParams("kroma"),
  fraxtal: constructParams("fraxtal"),
  kcc: constructParams("kcc"),
  astar: constructParams("astar"),
  fuse: constructParams("fuse"),
  ancient8: constructParams("ancient8"),
  celo: constructParams("celo"),
  "immutable zkevm": constructParams("immutable_zkevm"),
  kaia: constructParams("klaytn"),
  lisk: constructParams("lisk"),
  "okxchain mainnet": constructParams("okx"),
  paradex: constructParams("paradex"),
  "PGN (Public Goods Network)": constructParams("pgn"),
  rari: constructParams("rari"),
  redstone: constructParams("redstone"),
  rollux: constructParams("rollux"),
  ronin: constructParams("ronin"),
  sei: constructParams("sei"),
  shape: constructParams("shape"),
  superseed: constructParams("superseed"),
  "World Chain": constructParams("wc"),
  xai: constructParams("xai"),
  zetachain: constructParams("zeta"),
  zircuit: constructParams("zircuit"),
  // sophon: constructParams("sophon"),
  // abstract: constructParams("abstract"),
  // soneium: constructParams("soneium"),
  // unichain: constructParams("unichain"),
  // berachain: constructParams("berachain"),
  // morph: constructParams("morph"),
  // fuel: constructParams("fuel"),
  // ton: constructParams("ton"),
  // tron: constructParams("tron"),
  // starknet: constructParams("starknet"),
};
export default adapter;
