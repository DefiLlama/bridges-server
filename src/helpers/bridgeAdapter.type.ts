import { Chain } from "@defillama/sdk/build/general";
import { EventKeyMapping } from "../utils/types";
import { EventData } from "../utils/types";

export type BridgeAdapter = {
  [chain in Chain]?: (
    fromBlock: number,
    toBlock: number
  ) => Promise<EventData[]>;
};

export type EventLogFilter = {
  includeToken?: string[];
  includeFrom?: string[];
  includeTo?: string[];
  excludeToken?: string[];
  excludeFrom?: string[];
  excludeTo?: string[];
  includeArg?: { [key: string]: string }[];
};

export type InputDataExtraction = {
  inputDataABI: string[];
  inputDataFnName: string;
  inputDataKeys: EventKeyMapping;
};

export type ContractEventParams = {
  target: string | null;
  topic: string;
  abi: string[];
  logKeys?: EventKeyMapping;
  argKeys?: EventKeyMapping;
  topics?: (string | null)[];
  isDeposit: boolean;
  chain?: Chain; // can be used to override chain given as parameter in getEVMEventLogs
  isTransfer?: boolean;
  fixedEventData?: EventKeyMapping; // use to hard-code final values
  filter?: EventLogFilter;
  inputDataExtraction?: InputDataExtraction;
};

export type PartialContractEventParams = {
  target: string | null;
  topic?: string;
  abi?: string[];
  logKeys?: EventKeyMapping;
  argKeys?: EventKeyMapping;
  topics?: (string | null)[];
  isDeposit: boolean;
  chain?: Chain;
  isTransfer?: boolean;
  fixedEventData?: EventKeyMapping;
  filter?: EventLogFilter;
  inputDataExtraction?: InputDataExtraction;
};
