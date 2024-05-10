import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const contractAddress = "0x25aB3Efd52e6470681CE037cD546Dc60726948D3";

const constructParams = (chain: string) => {
  let eventParams = [] as PartialContractEventParams[];
  const depositParams = constructTransferParams(contractAddress, true, {
    excludeFrom: [contractAddress],
  });
  const withdrawalParams = constructTransferParams(contractAddress, false, {
    excludeTo: [contractAddress],
  });
  eventParams.push(depositParams, withdrawalParams);
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("meson", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
  aurora: constructParams("aurora"),
  "zksync era": constructParams("era"),
  kava: constructParams("kava"),
  moonbeam: constructParams("moonbeam"),
  moonriver: constructParams("moonriver"),
  cronos: constructParams("cronos"),
  "polygon zkevm": constructParams("polygon_zkevm"),
  linea: constructParams("linea"),
  base: constructParams("base"),
  metis: constructParams("metis"),
  manta: constructParams("manta"),
  mantle: constructParams("mantle"),
  scroll: constructParams("scroll"),
  celo: constructParams("celo"),
  gnosis: constructParams("xdai"),
  merlin: constructParams("merlin"),
  bsquared: constructParams("bsquared"),
  zkfair: constructParams("zkfair"),

  // conflux-espace
  // eos-evm
  // tron
  // solana
  // aptos
  // sui
  // SKALE Europa
  // SKALE Nebula
  // Nautilus
  // opbnb
};

export default adapter;
