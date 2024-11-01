import { Chain } from "@defillama/sdk/build/general";
import { EventKeyMapping } from "../utils/types";
import { EventData } from "../utils/types";

type AdapterChainFnV2ParamsOptional = (fromBlock: number, toBlock: number, v2Params?: AdapterV2Params) => Promise<EventData[]>
type AdapterChainFnV2ParamsMandatory = (fromBlock: number, toBlock: number, v2Params: AdapterV2Params) => Promise<EventData[]>

export type BridgeAdapter = {
  [chain: string]: AdapterChainFnV2ParamsMandatory | AdapterChainFnV2ParamsOptional;
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

export type FunctionSignatureFilter = {
  includeSignatures?: string[]; // require initial 8 characters of input data be one of those supplied in array (this is incorrect, should be changed to be 10 characters)
  excludeSignatures?: string[];
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
  argGetters?: Partial<Record<keyof EventKeyMapping, (log: any) => any>>;
  txKeys?: EventKeyMapping; // retrieve data from transaction referenced in event log
  topics?: (string | null)[];
  isDeposit: boolean;
  chain?: Chain; // override chain given as parameter in getTxDataFromEVMEventLogs
  isTransfer?: boolean;
  fixedEventData?: EventKeyMapping; // hard-code any final values
  inputDataExtraction?: InputDataExtraction; // retrieve data from event log's input data field
  selectIndexesFromArrays?: EventKeyMapping; // extract data returned as an array by specifying the index of element
  functionSignatureFilter?: FunctionSignatureFilter;
  filter?: EventLogFilter;
  mapTokens?: { [token: string]: string }; // can expand to map other keys if needed
  getTokenFromReceipt?: {
    token: boolean;
    amount?: boolean;
    native?: string; // if provided native token address, will return amount of native token transferred if there are no ercs transferred
  }; // attempt to get the token transferred from the tx receipt data, only use if only 1 token is transferred per tx
};

export type PartialContractEventParams = {
  target: string | null;
  topic?: string;
  abi?: string[];
  logKeys?: EventKeyMapping;
  argKeys?: EventKeyMapping;
  argGetters?: Partial<Record<keyof EventKeyMapping, (log: any) => any>>;
  txKeys?: EventKeyMapping;
  topics?: (string | null)[];
  isDeposit: boolean;
  chain?: Chain;
  isTransfer?: boolean;
  fixedEventData?: EventKeyMapping;
  inputDataExtraction?: InputDataExtraction;
  selectIndexesFromArrays?: EventKeyMapping;
  functionSignatureFilter?: FunctionSignatureFilter;
  filter?: EventLogFilter;
  mapTokens?: { [token: string]: string };
  getTokenFromReceipt?: {
    token: boolean;
    amount?: boolean;
    native?: string;
  };
};

export enum Erc20TransferType {
  TRANSFER = "erc20Transfer",
  TRANSFER_FROM = "erc20TransferFrom",
  TRANSFER_TO = "erc20TransferTo",
}

export type ContractEventParamsV2 = {
  target?: string;
  targets?: string[];
  topic?: string;
  abi?: string[]|string;
  logKeys?: EventKeyMapping;
  argKeys?: EventKeyMapping;
  isDeposit?: boolean;
  fixedEventData?: EventKeyMapping;
  transformLog?: Function;
  filter?: Function;
  eventLogType?: Erc20TransferType; 
};

export type AdapterV2Params = {
  fromBlock: number;
  toBlock: number;
  chain: Chain;
  getLogs: Function;
}