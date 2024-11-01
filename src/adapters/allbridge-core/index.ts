import axios, { AxiosResponse } from 'axios';
import { BigNumber } from 'ethers';
import { BridgeAdapter, ContractEventParamsV2, } from "../../helpers/bridgeAdapter.type";
import { EventData } from '../../utils/types';
import { getConnection } from '../../helpers/solana';
import { processEVMLogsExport } from "../../helpers/processTransactions";


const lpAddresses = {
  bsc: [
    '0x8033d5b454Ee4758E4bD1D37a49009c1a81D8B10',
    '0xf833afA46fCD100e62365a0fDb0734b7c4537811',
  ],
  ethereum: [
    "0x7DBF07Ad92Ed4e26D5511b4F285508eBF174135D",
    "0xa7062bbA94c91d565Ae33B893Ab5dFAF1Fc57C4d",
  ],
  polygon: [
    '0x58Cc621c62b0aa9bABfae5651202A932279437DA',
    '0x0394c4f17738A10096510832beaB89a9DD090791',
    '0x4C42DfDBb8Ad654b42F66E0bD4dbdC71B52EB0A6',
  ],
  avax: [
    '0xe827352A0552fFC835c181ab5Bf1D7794038eC9f',
    '0x2d2f460d7a1e7a4fcC4Ddab599451480728b5784',
  ],
  arbitrum: [
    '0x690e66fc0F8be8964d40e55EdE6aEBdfcB8A21Df',
    '0x47235cB71107CC66B12aF6f8b8a9260ea38472c7',
  ],
  base: [
    '0xDA6bb1ec3BaBA68B26bEa0508d6f81c9ec5e96d5',
  ],
  optimism: [
    '0x3B96F88b2b9EB87964b852874D41B633e0f1f68F',
    '0xb24A05d54fcAcfe1FC00c59209470d4cafB0deEA',
  ],
  celo: [
    '0xfb2C7c10e731EBe96Dabdf4A96D656Bfe8e2b5Af',
  ],
  tron: [
    'TAC21biCBL9agjuUyzd4gZr356zRgJq61b',
  ]
} as {
  [chain: string]: string[];
};

const constructParams = (chain: string) => {
  let eventParams = [] as ContractEventParamsV2[];
  const lps = lpAddresses[chain];

  for (const lpAddress of lps) {
    const depositParams: ContractEventParamsV2 = {
      target: lpAddress,
      abi: "event SwappedToVUsd(address from, address token, uint amount, uint vUsdAmount, uint fee)",
      fixedEventData: {
        to: lpAddress,
      },
      isDeposit: true
    };

    const withdrawParams: ContractEventParamsV2 = {
      target: lpAddress,
      abi: "event SwappedFromVUsd(address to, address token, uint256 vUsdAmount, uint256 amount, uint256 fee)",
      fixedEventData: {
        from: lpAddress,
      },
      isDeposit: false,
    };
    eventParams.push(depositParams, withdrawParams)
  }
  return processEVMLogsExport(eventParams)
};

interface SolanaEvent {
  blockTime: number;
  txHash: string;
  from: string;
  to: string;
  token: string;
  amount: string;
  isDeposit: boolean;
}

function interpolateNumber(x1: number, y1: number, x2: number, y2: number, y: number): number {
  const x = x1 + (x2 - x1) / (y2 - y1) * (y - y1);
  return Math.round(x);
}

const getSolanaEvents = async (fromSlot: number, toSlot: number): Promise<EventData[]> => {
  const connection = getConnection();
  const timestampFrom = await connection.getBlockTime(fromSlot);
  const timestampTo = await connection.getBlockTime(toSlot);
  // Old blocks may have been pruned by the RPC
  if (!timestampFrom || !timestampTo) {
    return [];
  }
  const from = new Date(timestampFrom * 1000).toISOString();
  const to = new Date(timestampTo * 1000).toISOString();

  let response: AxiosResponse<SolanaEvent[]>;
  try {
    response = await axios.get<SolanaEvent[]>(
      `https://core.api.allbridgecoreapi.net/analytics/inflows?chain=SOL&from=${from}&to=${to}`
    );
  } catch (e) {
    console.error("Error fetching Solana events", e);
    return [];
  }

  return response.data.map((event) => ({
    blockNumber: interpolateNumber(fromSlot, timestampFrom, toSlot, timestampTo, event.blockTime),
    txHash: event.txHash,
    from,
    to,
    token: event.token,
    amount: BigNumber.from(event.amount),
    isDeposit: event.isDeposit,
  }));
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  arbitrum: constructParams("arbitrum"),
  base: constructParams("base"),
  optimism: constructParams("optimism"),
  celo: constructParams("celo"),
  solana: getSolanaEvents,
};

export default adapter;
