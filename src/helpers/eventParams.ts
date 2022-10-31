import {
  PartialContractEventParams,
  EventLogFilter,
} from "./bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";

export const constructTransferParams = (
  target: string,
  isDeposit: boolean,
  filter?: EventLogFilter,
  matchFunctionSignatures?: string[],
  chain?: Chain,
) => {
  return Object.fromEntries(
    Object.entries({
      target: target,
      contractChain: chain,
      isDeposit: isDeposit,
      isTransfer: true,
      filter: filter,
      matchFunctionSignatures: matchFunctionSignatures,
    }).filter(([_k, v]) => v != null)
  ) as PartialContractEventParams;
};
