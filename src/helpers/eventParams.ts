import {
  PartialContractEventParams,
  EventLogFilter,
  FunctionSignatureFilter
} from "./bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";

export const constructTransferParams = (
  target: string,
  isDeposit: boolean,
  filter?: EventLogFilter,
  functionSignatureFilter?: FunctionSignatureFilter,
  chain?: Chain,
) => {
  return Object.fromEntries(
    Object.entries({
      target: target,
      contractChain: chain,
      isDeposit: isDeposit,
      isTransfer: true,
      filter: filter,
      functionSignatureFilter: functionSignatureFilter,
    }).filter(([_k, v]) => v != null)
  ) as PartialContractEventParams;
};
