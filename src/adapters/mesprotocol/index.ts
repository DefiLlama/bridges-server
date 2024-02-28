import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const bridgeAddresses = {
  ethereum: "0xbfc0e7E964F9445Aab8E3F76101FfBdEF3EDDd96",
  manta: "0x052848c0E8F73BBCf53001496b2C78b02efE933b",
  optimism: "0x052848c0E8F73BBCf53001496b2C78b02efE933b",
  zksync: "0xCD0E8Fb86fb6FC5591Bc0801490d33d515Ba613F",
  arbitrum: "0x052848c0E8F73BBCf53001496b2C78b02efE933b",
  base: "0x052848c0E8F73BBCf53001496b2C78b02efE933b",
  linea: "0x052848c0E8F73BBCf53001496b2C78b02efE933b",
} as { [chain: string]: string };

const constructParams = (chain: string) => {
  let eventParams = [] as PartialContractEventParams[];
  const bridgeAddress = bridgeAddresses[chain];

  const depositParams = constructTransferParams(bridgeAddress, true, {
    excludeFrom: [bridgeAddress],
  });

  const withdrawParams = constructTransferParams(bridgeAddress, false, {
    excludeTo: [bridgeAddress],
  });

  eventParams.push(depositParams, withdrawParams);
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("mesprotocol", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  optimism: constructParams("optimism"),
  zksync: constructParams("zksync era"),
  arbitrum: constructParams("arbitrum"),
  base: constructParams("base"),
  linea: constructParams("linea"),
  manta: constructParams("manta"),
};

export default adapter;

