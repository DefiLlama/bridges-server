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

const convertRequestToEvent = (
  request: NonNullable<RelayRequestsResponse["requests"]>["0"],
  blockNumber: number
): { deposit?: EventData; withdraw?: EventData; depositChainId?: number; withdrawChainId?: number } => {
  const deposit = request.data?.metadata?.currencyIn;
  const withdraw = request.data?.metadata?.currencyOut;

  const depositTx = request.data?.inTxs?.[0];
  const withdrawTx = request.data?.outTxs?.[0];

  return {
    depositChainId: depositTx?.chainId,
    deposit: depositTx
      ? {
          blockNumber: blockNumber, //MISSING: going to just fudge it for now
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
    withdraw: withdrawTx
      ? {
          blockNumber: blockNumber, //MISSING: going to just fudge it for now
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
    const response = await fetchRequests(chainId, fromBlock, toBlock);
    continuation = response.continuation;
    allRequests = [...allRequests, ...(response.requests ?? [])];
  }
  return allRequests;
};

const constructParams = (chainId: number) => {
  return async (fromBlock: number, toBlock: number): Promise<EventData[]> => {
    const requests = await fetchAllRequests(chainId, fromBlock, toBlock);
    const events: EventData[] = [];
    requests?.forEach((request) => {
      const event = convertRequestToEvent(request, fromBlock);
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
