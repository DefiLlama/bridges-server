import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

enum Chains {
  ethereum = "ethereum",
  bsc = "bsc",
}

const vaultContractAddresses = {
  [Chains.ethereum]: ["0xe396757ec7e6ac7c8e5abe7285dde47b98f22db8", "0x112334f50cb6efcff4e35ae51a022dbe41a48135"],
  [Chains.bsc]: ["0x76c96b2b3cf96ee305c759a7cd985eaa67634dfc"],
};

const getPeginParams = (_vault: string) => constructTransferParams(_vault, true);

const getPegoutParams = (_vault: string) => constructTransferParams(_vault, false);

const getParamsForVault = (_vault: string) => [getPeginParams(_vault), getPegoutParams(_vault)];

const constructParams = (chain: Chains) => {
  const vaults = vaultContractAddresses[chain];
  const eventParams = [...vaults.map(getParamsForVault).flat()];
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("pnetwork", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  bsc: constructParams(Chains.bsc),
  ethereum: constructParams(Chains.ethereum),
};

export default adapter;
