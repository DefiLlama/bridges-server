import axios, { AxiosResponse } from 'axios';
import { BigNumber } from 'ethers';
import { EventData } from '../../utils/types';

interface AnalyticsEvent {
  blockTime: number;
  txHash: string;
  from: string;
  to: string;
  token: string;
  amount: string;
  isDeposit: boolean;
}

export async function getEventsFromAnalyticsApi(
  chainCode: string,
  fromBlock: number,
  fromTimestampMs: number,
  toBlock: number,
  toTimestampMs: number
): Promise<EventData[]> {
  const from = new Date(fromTimestampMs).toISOString();
  const to = new Date(toTimestampMs).toISOString();

  let response: AxiosResponse<AnalyticsEvent[]>;
  try {
    response = await axios.get<AnalyticsEvent[]>(
      `https://core.api.allbridgecoreapi.net/analytics/inflows?chain=${chainCode}&from=${from}&to=${to}`
    );
  } catch (e) {
    console.error(`Error fetching ${chainCode} events`, e);
    return [];
  }

  return response.data.map((event) => {
    const blockTimeMs = event.blockTime * 1000;
    return {
      blockNumber: interpolateNumber(fromBlock, fromTimestampMs, toBlock, toTimestampMs, blockTimeMs),
      txHash: event.txHash,
      from,
      to,
      token: event.token,
      amount: BigNumber.from(event.amount),
      isDeposit: event.isDeposit,
      timestamp: blockTimeMs,
    }
  });
}

function interpolateNumber(x1: number, y1: number, x2: number, y2: number, y: number): number {
  const x = x1 + (x2 - x1) / (y2 - y1) * (y - y1);
  return Math.round(x);
}
