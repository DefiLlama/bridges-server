import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";
import { Chain } from "@defillama/sdk/build/general";
import { getTxsBlockRangeEtherscan, wait } from "../../helpers/etherscan";
import { getTxsBlockRangeMerlinScan } from "../../helpers/merlin";
import { EventData } from "../../utils/types";

const blackListedAddresses = [
  "0xa7883e0060286b7b9e3a87d8ef9f180a7c2673ce",
  "0x3f5401a9d0dd2390d1a8c7060672d4b704df6372",
  "0x0000000000000000000000000000000000008001",
  "0xd9d74a29307cc6fc8bf424ee4217f1a587fbc8dc",
  "0xbf3922a0cebbcd718e715e83d9187cc4bba23f11",
  "0xabea9132b05a70803a4e85094fd0e1800777fbef",
  "0xe7804c37c13166ff0b37f5ae0bb07a3aebb6e245",
  "0x151409521FC4aF3DBaCE6D97fd4148a44BF07300",
  "0xebe80f029b1c02862b9e8a70a7e5317c06f62cae",
  "0x44f356e8716575f2a713a3d91ae4ed1c7c054a90",
  "0xA7883E0060286B7B9e3a87d8Ef9f180a7c2673cE",
].map((a) => a.toLowerCase());

const eoaAddressErc = [
  "0xd7aa9ba6caac7b0436c91396f22ca5a7f31664fc", // erc
  "0x41d3d33156ae7c62c094aae2995003ae63f587b3", // erc
  "0x095d2918b03b2e86d68551dcf11302121fb626c9", // ??
  "0xe01a40a0894970fc4c2b06f36f5eb94e73ea502d",
];

const eoaAddressNative = [
  "0x646592183ff25a0c44f09896a384004778f831ed",
  "0x80c67432656d59144ceff962e8faf8926599bcf8", // native
  "0xe4edb277e41dc89ab076a1f049f4a3efa700bce8", // native
  "0xee73323912a4e3772b74ed0ca1595a152b0ef282", // native
  "0xe01a40a0894970fc4c2b06f36f5eb94e73ea502d", // merlin
  '0x41d3d33156ae7c62c094aae2995003ae63f587b3',
  '0xd7aa9ba6caac7b0436c91396f22ca5a7f31664fc',
  '0x0a88bc5c32b684d467b43c06d9e0899efeaf59df',
  '0x1c84daa159cf68667a54beb412cdb8b2c193fb32',
  '0x8086061cf07c03559fbb4aa58f191f9c4a5df2b2',
  '0x732efacd14b0355999aebb133585787921aba3a9',
];

const nativeTokens: Record<string, string> = {
  ethereum: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  arbitrum: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  optimism: "0x4200000000000000000000000000000000000006",
  base: "0x4200000000000000000000000000000000000006",
  linea: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f",
  blast: "0x4300000000000000000000000000000000000004",
  scroll: "0x5300000000000000000000000000000000000004",
  mode: "0x4200000000000000000000000000000000000006",
  polygon: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  manta: "0x0Dc808adcE2099A9F62AA87D9670745AbA741746",
  polygon_zkevm: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  era: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
  arbitrum_nova: "0x722E8BdD2ce80A4422E880164f2079488e115365",
  merlin: "0xF6D226f9Dc15d9bB51182815b320D3fBE324e1bA",
  zklink: "0x000000000000000000000000000000000000800A",
  btr: "0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f",
  xlayer: "0x5a77f1443d16ee5761d310e38b62f77f726bc71c",
  opbnb: '0xe7798f023fc62146e8aa1b36da45fb70855a77ea',
  bsc: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
  mantle: '0xcDA86A272531e8640cD7F1a92c01839911B90bb0',
  bouncebit: '0x7F150c293c97172C75983BD8ac084c187107eA19',
  zkfair: '0x4b21b980d0Dc7D3C0C6175b0A412694F3A1c7c6b',
  bsquared: '0x8dbf84c93727c85DB09478C83a8621e765D20eC2',
  taiko: '0xA51894664A773981C6C112C43ce576f315d5b1B6',
};

const nativeTokenTransferSignature = ["0x535741", "0x"];

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  eoaAddressErc.map((address: string) => {
    const transferWithdrawalParams: PartialContractEventParams = constructTransferParams(address, false);
    const transferDepositParams: PartialContractEventParams = constructTransferParams(address, true);
    eventParams.push(transferWithdrawalParams, transferDepositParams);
  });
  return async (fromBlock: number, toBlock: number) => {
    const eventLogData = await getTxDataFromEVMEventLogs("orbiter", chain as Chain, fromBlock, toBlock, eventParams);

    const nativeEvents = await Promise.all(
      eoaAddressNative.map(async (address: string, i: number) => {
        await wait(300 * i); // for etherscan
        let txs: any[] = [];
        if (chain === "merlin") {
          txs = await getTxsBlockRangeMerlinScan(address, fromBlock, toBlock, {
            includeSignatures: nativeTokenTransferSignature,
          });
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
            isDeposit: address === tx.to,
          };
          return event;
        });

        return eventsRes;
      })
    );
    const allEvents = [...eventLogData, ...nativeEvents.flat()];
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
  mode: constructParams("mode"),
  manta: constructParams("manta"),
  "arbitrum nova": constructParams("arbitrum_nova"),
  "polygon zkevm": constructParams("polygon_zkevm"),
  "zksync era": constructParams("era"),
  merlin: constructParams("merlin"),
  zklink: constructParams("zklink"),
  bitlayer: constructParams("btr"),
  'x layer': constructParams("xlayer"),
  opbnb: constructParams("opbnb"),
  bsc: constructParams("bsc"),
  mantle: constructParams("mantle"),
  bouncebit: constructParams("bouncebit-mainnet"),
  zkfair: constructParams("zkfair"),
  bsquared: constructParams("b2-mainnet"),
  taiko: constructParams("taiko"),
};
export default adapter;
