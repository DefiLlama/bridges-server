import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const gatewayAddresses = {
  arbitrum: "0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613",
  wanchain: "0xe85b0d89cbc670733d6a40a9450d8788be13da47",
  ethereum: "0xfceaaaeb8d564a9d0e71ef36f027b9d162bc334e",
  avalanche: "0x74e121a34a66d54c33f3291f2cdf26b1cd037c3a",
  moonbeam: "0x6372aec6263aa93eacedc994d38aa9117b6b95b5",
  moonriver: "0xde1ae3c465354f01189150f3836c7c15a1d6671d",
  functionX: "0xdf935552fac687123c642f589296762b632a9aaf",
  telos: "0x201e5de97dfc46aace142b2009332c524c9d8d82",
  polygon: "0x2216072a246a84f7b9ce0f1415dd239c9bf201ab",
  okexchain: "0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613",
  optimism: "0xc6ae1db6c66d909f7bfeeeb24f9adb8620bf9dbf",
  xdc: "0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613",
  bsc: "0xc3711bdbe7e3063bf6c22e7fed42f782ac82baee",
  astar: "0x592de30bebff484b5a43a6e8e3ec1a814902e0b6",
  metis: "0xc6ae1db6c66d909f7bfeeeb24f9adb8620bf9dbf",
  horizen: "0x97e0883493e8bb7a119a1e36e53ee9e7a2d3ca7b",
  fantom: "0xccffe9d337f3c1b16bd271d109e691246fd69ee3",
  clover: "0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613",
  gather: "0xc6ae1db6c66d909f7bfeeeb24f9adb8620bf9dbf",
  tron: "0xfe464ebd5bb5d95731f90aa7b9e39df920a61c97",
  vinuchain: "0x72ccf64ee5e2c7629ee4eee3e6ad6990289178ae",
} as {
  [chain: string]: string;
};

const nullAddress = "0x0000000000000000000000000000000000000000";

const constructParams = (chain: string) => {
  let eventParams = [] as PartialContractEventParams[];
  const addy = gatewayAddresses[chain];

  const userLock = constructTransferParams(addy, true, {
    excludeFrom: [addy, nullAddress],
    excludeTo: [nullAddress],
    includeTo: [addy],
  });

  const smgRelease = constructTransferParams(addy, false, {
    excludeFrom: [nullAddress],
    excludeTo: [nullAddress, addy],
    includeFrom: [addy],
  });

  eventParams.push(userLock, smgRelease);

  return async (fromBlock: number, toBlock: number) =>
    await getTxDataFromEVMEventLogs("wanbridge", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  polygon: constructParams("polygon"),
  arbitrum: constructParams("arbitrum"),
  bsc: constructParams("bsc"),
  ethereum: constructParams("ethereum"),
  avalanche: constructParams("avalanche"),
  moonbeam: constructParams("moonbeam"),
  moonriver: constructParams("moonriver"),
  functionX: constructParams("functionX"),
  telos: constructParams("telos"),
  okexchain: constructParams("okexchain"),
  optimism: constructParams("optimism"),
  xdc: constructParams("xdc"),
  astar: constructParams("astar"),
  metis: constructParams("metis"),
  horizen: constructParams("horizen"),
  fantom: constructParams("fantom"),
  clover: constructParams("clover"),
  gather: constructParams("gather"),
  tron: constructParams("tron"),
  vinuchain: constructParams("vinuchain"),
  wanchain: constructParams("wanchain"),
};

export default adapter;
