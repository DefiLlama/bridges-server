import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import fetch from "node-fetch";
import { EventData } from "../../utils/types";
import { RelayRequestsResponse } from "./type";
const retry = require("async-retry");

/**
 * Relay is a cross-chain payments system that enables low cost instant bridging and cross-chain execution.
 * Contract addresses: https://docs.relay.link/resources/contract-addresses
 *
 *
 */

const startingBlocks: Record<string, number> = {
  1: 18976112,
  10: 114647896,
  56: 39739873,
  100: 33619680,
  137: 55172593,
  185: 3417903,
  288: 2353048,
  324: 25006838,
  360: 2691201,
  480: 3466510,
  690: 254553,
  1101: 12491343,
  1135: 761002,
  1329: 118912096,
  2741: 4116,
  2911: 2136055,
  4321: 138647,
  5000: 72911632,
  5112: 1462668,
  7560: 896262,
  8333: 144055,
  8453: 9046270,
  17071: 58343,
  33139: 636958,
  33979: 238923,
  34443: 7297896,
  42161: 169028419,
  42170: 38963884,
  43114: 44583244,
  55244: 30,
  57073: 275058,
  59144: 1814719,
  60808: 275964,
  70700: 19,
  70701: 1543,
  81457: 216675,
  534352: 5560094,
  543210: 1282,
  660279: 4759873,
  984122: 2655107,
  7777777: 9094029,
  8253038: 865885,
  9286185: 17617195,
  666666666: 1310814,
  792703809: 279758248,
  888888888: 1278785,
  1380012617: 205727,
};

const convertRequestToEvent = (
  request: NonNullable<RelayRequestsResponse["requests"]>["0"]
): { deposit?: EventData; withdraw?: EventData; depositChainId?: number; withdrawChainId?: number } => {
  const deposit = request.data?.metadata?.currencyIn;
  const withdraw = request.data?.metadata?.currencyOut;

  const depositTx = request.data?.inTxs?.[0];
  const withdrawTx = request.data?.outTxs?.[0];

  return {
    depositChainId: depositTx?.chainId,
    deposit:
      depositTx && depositTx.data && deposit
        ? {
            blockNumber: depositTx.block!,
            txHash: depositTx.hash as string,
            from: (depositTx.data as any).to,
            to: (depositTx.data as any).from,
            token: deposit?.currency?.address!,
            amount: deposit?.amountUsd as any,
            isDeposit: true,
            isUSDVolume: true,
          }
        : undefined,
    withdrawChainId: withdrawTx?.chainId,
    withdraw:
      withdrawTx && withdrawTx.data && withdraw
        ? {
            blockNumber: withdrawTx.block!,
            txHash: withdrawTx.hash!,
            from: (withdrawTx.data as unknown as any).from,
            to: (withdrawTx.data as unknown as any).to,
            token: withdraw?.currency?.address!,
            amount: withdraw?.amountUsd as any,
            isDeposit: false,
            isUSDVolume: true,
          }
        : undefined,
  };
};

const fetchRequests = async (
  chainId: number,
  fromBlock: number,
  toBlock: number,
  continuation?: string
): Promise<RelayRequestsResponse> => {
  let url = `https://api.relay.link/requests/v2?chainId=${chainId}&startBlock=${fromBlock}&endBlock=${toBlock}`;

  if (continuation) {
    url = `${url}&continuation=${continuation}`;
  }
  return retry(() => fetch(url).then((res) => res.json()));
};

const fetchAllRequests = async (
  chainId: number,
  fromBlock: number,
  toBlock: number
): Promise<RelayRequestsResponse["requests"]> => {
  let allRequests: RelayRequestsResponse["requests"] = [];
  const response = await fetchRequests(chainId, fromBlock, toBlock);
  allRequests = [...(response.requests ?? [])];
  let continuation = response.continuation;
  let maxRequests = 10000;
  let requestCount = 0;
  while (continuation !== undefined && requestCount < maxRequests) {
    const response = await fetchRequests(chainId, fromBlock, toBlock, continuation);
    continuation = response.continuation;
    allRequests = [...allRequests, ...(response.requests ?? [])];
  }
  return allRequests;
};

const constructParams = (chainId: number) => {
  return async (fromBlock: number, toBlock: number): Promise<EventData[]> => {
    //Performance optimization to limit empty requests
    const startingBlock = startingBlocks[chainId];
    if (startingBlock !== undefined && toBlock < startingBlock) {
      return [];
    }
    const requests = await fetchAllRequests(chainId, fromBlock, toBlock);
    const events: EventData[] = [];
    requests?.forEach((request) => {
      const event = convertRequestToEvent(request);
      if (event.depositChainId === chainId && event.deposit) {
        events.push(event.deposit);
      }
      if (event.withdrawChainId === chainId && event.withdraw) {
        events.push(event.withdraw);
      }
    });
    return events;
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(1),
  optimism: constructParams(10),
  bnb: constructParams(56),
  gnosis: constructParams(100),
  polygon: constructParams(137),
  mint: constructParams(185),
  boba: constructParams(288),
  zksync: constructParams(324),
  shape: constructParams(360),
  "world-chain": constructParams(480),
  redstone: constructParams(690),
  "polygon-zkevm": constructParams(1101),
  lisk: constructParams(1135),
  sei: constructParams(1329),
  hychain: constructParams(2911),
  mantle: constructParams(5000),
  ham: constructParams(5112),
  cyber: constructParams(7560),
  B3: constructParams(8333),
  base: constructParams(8453),
  arbitrum: constructParams(42161),
  "arbitrum-nova": constructParams(42170),
  avalanche: constructParams(43114),
  superposition: constructParams(55244),
  linea: constructParams(59144),
  bob: constructParams(60808),
  apex: constructParams(70700),
  boss: constructParams(70701),
  blast: constructParams(81457),
  scroll: constructParams(534352),
  "zero-network": constructParams(543210),
  xai: constructParams(660279),
  forma: constructParams(984122),
  solana: constructParams(792703809),
  ancient8: constructParams(888888888),
  rari: constructParams(1380012617),
  bitcoin: constructParams(8253038),
  eclipse: constructParams(9286185),
  degen: constructParams(666666666),
  funki: constructParams(33979),
  mode: constructParams(34443),
  "proof-of-play": constructParams(70700),
  "proof-of-play-boss": constructParams(70701),
};

export default adapter;
