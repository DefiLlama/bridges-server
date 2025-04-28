import { Chain } from "@defillama/sdk/build/general";
import { PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const BRIDGE_ADDRESS = "0x3B4D794a66304F130a4Db8F2551B0070dfCf5ca7";

const erc20DepositEventParams: PartialContractEventParams = constructTransferParams(BRIDGE_ADDRESS, true);

const erc20WithdrawalEventParams: PartialContractEventParams = constructTransferParams(BRIDGE_ADDRESS, false);

export const lighterEventParams = [erc20DepositEventParams, erc20WithdrawalEventParams];

const constructParams = (chain: string) => {
  return async (fromBlock: number, toBlock: number) => {
    return await getTxDataFromEVMEventLogs("lighter", chain as Chain, fromBlock, toBlock, lighterEventParams);
  };
};

const adapter = {
  ethereum: constructParams("ethereum"),
};

export default adapter;
