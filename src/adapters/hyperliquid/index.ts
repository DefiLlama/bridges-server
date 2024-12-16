import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const HYPERLIQUID_BRIDGE_ADDRESS = "0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7";

const erc20WithdrawalEventParams: PartialContractEventParams = constructTransferParams(
  HYPERLIQUID_BRIDGE_ADDRESS,
  false
);

const erc20DepositEventParams: PartialContractEventParams = constructTransferParams(HYPERLIQUID_BRIDGE_ADDRESS, true);

const constructParams = (chain: string) => {
  let eventParams = [] as PartialContractEventParams[];
  eventParams.push(erc20WithdrawalEventParams, erc20DepositEventParams);
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("hyperliquid", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  arbitrum: constructParams("arbitrum"),
};

export default adapter;
