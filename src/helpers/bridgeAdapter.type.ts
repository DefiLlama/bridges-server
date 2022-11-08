import { Chain } from "@defillama/sdk/build/general";
import { EventKeyMapping } from "../utils/types";
import { EventData } from "../utils/types";

export type BridgeAdapter = {
  [chain: string]: (fromBlock: number, toBlock: number) => Promise<EventData[]>;
};

export type EventLogFilter = {
  includeToken?: string[];
  includeFrom?: string[];
  includeTo?: string[];
  excludeToken?: string[];
  excludeFrom?: string[];
  excludeTo?: string[];
  includeArg?: { [key: string]: string }[];
  excludeArg?: { [key: string]: string }[];
  includeTxData?: { [key: string]: string }[];
};

type InputDataExtraction = {
  inputDataABI: string[];
  inputDataFnName?: string;
  inputDataKeys: EventKeyMapping;
  useDefaultAbiEncoder?: boolean;
};

export type ContractEventParams = {
  target: string | null;
  topic: string;
  abi: string[];
  logKeys?: EventKeyMapping; // retrieve data from event log
  argKeys?: EventKeyMapping; // retrieve data from parsed event log
  txKeys?: EventKeyMapping; // retrieve data from transaction referenced in event log
  topics?: (string | null)[];
  isDeposit: boolean;
  chain?: Chain; // override chain given as parameter in getTxDataFromEVMEventLogs
  isTransfer?: boolean;
  fixedEventData?: EventKeyMapping; // hard-code any final values
  inputDataExtraction?: InputDataExtraction; // retrieve data from event log's input data field
  selectIndexesFromArrays?: EventKeyMapping; // extract data returned as an array by specifying the index of element
  matchFunctionSignatures?: string[]; // require initial 8 characters of input data be one of those supplied in array
  filter?: EventLogFilter;
  mapTokens?: { [token: string]: string }; // can expand to map other keys if needed
  getTokenFromReceipt?: {
    token: boolean,
    amount?: boolean
  }; // attempt to get the token transferred from the tx receipt data, only use if only 1 token is transferred per tx
};

export type PartialContractEventParams = {
  target: string | null;
  topic?: string;
  abi?: string[];
  logKeys?: EventKeyMapping;
  argKeys?: EventKeyMapping;
  txKeys?: EventKeyMapping;
  topics?: (string | null)[];
  isDeposit: boolean;
  chain?: Chain;
  isTransfer?: boolean;
  fixedEventData?: EventKeyMapping;
  inputDataExtraction?: InputDataExtraction;
  selectIndexesFromArrays?: EventKeyMapping;
  matchFunctionSignatures?: string[];
  filter?: EventLogFilter;
  mapTokens?: { [token: string]: string };
  getTokenFromReceipt?: {
    token: boolean,
    amount?: boolean
  }
};
