import {
  BridgeAdapter,
  PartialContractEventParams
} from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";
import { Chain } from "@defillama/sdk/build/general";

const eoaAddress = [
  "0x646592183ff25a0c44f09896a384004778f831ed",
  "0x80c67432656d59144ceff962e8faf8926599bcf8",
  "0xe4edb277e41dc89ab076a1f049f4a3efa700bce8",
  "0xd7aa9ba6caac7b0436c91396f22ca5a7f31664fc",
  "0x41d3d33156ae7c62c094aae2995003ae63f587b3",
  "0x095d2918b03b2e86d68551dcf11302121fb626c9",
  "0xee73323912a4e3772b74ed0ca1595a152b0ef282",
]
const constructParams = (chain: string) => {
  let eventParams = [] as any;
  if(eoaAddress){
    eoaAddress.map((address: string) => {
        const transferWithdrawalParams: PartialContractEventParams = constructTransferParams(address, false);
        const transferDepositParams: PartialContractEventParams = constructTransferParams(address, true);
        eventParams.push(transferWithdrawalParams, transferDepositParams);
      });
  }
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("orbiter", chain as Chain, fromBlock, toBlock, eventParams);
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
};
export default adapter;
