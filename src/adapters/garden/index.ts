import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { getAccountTrcTransactions, tronGetTimestampByBlockNumber } from "../../helpers/tron";
import { SolanaEvent, SwapResponse } from "./types";
import { EventData } from "../../utils/types";
import retry from "async-retry";
import { ethers } from "ethers";

// Solana asset string → SPL token address mapping
const solanaTokenAddresses: Record<string, string> = {
  "solana:sol": "So11111111111111111111111111111111111111112",
  "primary": "So11111111111111111111111111111111111111112",
  "solana:usdc": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "solana:usdt": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  "solana:cash": "CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH",
  "solana:cbbtc": "cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij",
};

// Decimals for known Solana assets 
const solanaAssetDecimals: Record<string, number> = {
  "solana:sol": 9,
  "primary": 9,
  "solana:usdc": 6,
  "solana:usdt": 6,
  "solana:cash": 6,
  "solana:cbbtc": 8,
};

const DEFAULT_SOLANA_DECIMALS = 9;
const WSOL_ADDRESS = "So11111111111111111111111111111111111111112";

const MAX_PAGES = 200;

const fetchWithRetry = (url: string): Promise<SwapResponse> => {
  return retry(
    async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    },
    {
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 4000,
    }
  );
};

// Helper function to check if we should process this slot
const shouldProcessSlot = (slot: number, fromSlot: number, toSlot: number) => {
  if (slot < fromSlot) return { process: false, stopPagination: true };
  if (slot > toSlot) return { process: false, stopPagination: false };
  return { process: true, stopPagination: false };
};

// Fetches one direction of orders using chain-filtered API — much faster than scanning all orders
const fetchOrdersForChainDirection = async (
  chainName: string,
  isSource: boolean,
  fromBlock: number,
  toBlock: number,
  tokenAddressMap: Record<string, string>,
  decimalsMap: Record<string, number>,
  defaultToken: string,
  defaultDecimals: number
): Promise<EventData[]> => {
  const events: EventData[] = [];
  let page = 1;
  let hasMoreData = true;
  const chainParam = isSource ? `from_chain=${chainName}` : `to_chain=${chainName}`;

  while (hasMoreData && page <= MAX_PAGES) {
    try {
      const url = `https://api.garden.finance/v2/orders?status=completed&${chainParam}&per_page=500&page=${page}`;
      const response = await fetchWithRetry(url);

      if (response.status !== "Ok" || !response.result.data.length) {
        hasMoreData = false;
        break;
      }

      let shouldStopPagination = false;

      for (const swap of response.result.data) {
        const { source_swap, destination_swap } = swap;
        if (!destination_swap.redeem_tx_hash) continue;

        // API already filtered by chain, so just pick the right side for block number
        const blockNumber = isSource
          ? parseInt(source_swap.initiate_block_number, 10)
          : parseInt(destination_swap.redeem_block_number, 10);

        if (isNaN(blockNumber)) continue;

        const { process, stopPagination } = shouldProcessSlot(blockNumber, fromBlock, toBlock);

        if (stopPagination) {
          shouldStopPagination = true;
          break;
        }

        if (!process) continue;

        const chainSwap = isSource ? source_swap : destination_swap;
        const assetKey = chainSwap.asset.toLowerCase();
        const decimals = decimalsMap[assetKey] ?? defaultDecimals;
        const rawAmount = parseFloat(chainSwap.amount);
        const assetPrice = chainSwap.asset_price;

        const usdAmount = (rawAmount / Math.pow(10, decimals)) * assetPrice;
        if (isNaN(usdAmount) || usdAmount <= 0) continue;

        events.push({
          blockNumber,
          txHash: isSource ? source_swap.initiate_tx_hash : destination_swap.redeem_tx_hash,
          from: isSource ? source_swap.initiator : destination_swap.initiator,
          to: isSource ? source_swap.redeemer : destination_swap.redeemer,
          token: tokenAddressMap[assetKey] ?? defaultToken,
          amount: ethers.BigNumber.from(Math.round(usdAmount).toString()),
          isDeposit: isSource,
          isUSDVolume: true,
        });
      }

      if (shouldStopPagination) {
        hasMoreData = false;
        break;
      }

      page++;
    } catch (error) {
      console.error(`Error fetching ${chainName} ${isSource ? "source" : "destination"} page ${page}:`, error);
      throw error;
    }
  }

  return events;
};

// Generic API-based event fetcher — queries source and destination in parallel using chain filters
const getChainEventsFromAPI = async (
  chainName: string,
  fromBlock: number,
  toBlock: number,
  tokenAddressMap: Record<string, string>,
  decimalsMap: Record<string, number>,
  defaultToken: string,
  defaultDecimals: number
): Promise<EventData[]> => {
  const [sourceEvents, destEvents] = await Promise.all([
    fetchOrdersForChainDirection(chainName, true, fromBlock, toBlock, tokenAddressMap, decimalsMap, defaultToken, defaultDecimals),
    fetchOrdersForChainDirection(chainName, false, fromBlock, toBlock, tokenAddressMap, decimalsMap, defaultToken, defaultDecimals),
  ]);
  return [...sourceEvents, ...destEvents];
};

const fetchSolanaDirection = async (isSource: boolean, fromSlot: number, toSlot: number): Promise<SolanaEvent[]> => {
  const events: SolanaEvent[] = [];
  let page = 1;
  let hasMoreData = true;
  const chainParam = isSource ? "from_chain=solana" : "to_chain=solana";

  while (hasMoreData && page <= MAX_PAGES) {
    try {
      const url = `https://api.garden.finance/v2/orders?status=completed&${chainParam}&per_page=500&page=${page}`;
      const response = await fetchWithRetry(url);

      if (response.status !== "Ok" || !response.result.data.length) {
        hasMoreData = false;
        break;
      }

      let shouldStopPagination = false;

      for (const swap of response.result.data) {
        const { source_swap, destination_swap } = swap;
        if (!destination_swap.redeem_tx_hash) continue;

        const chainSwap = isSource ? source_swap : destination_swap;
        const slot = parseInt(isSource ? source_swap.initiate_block_number : destination_swap.redeem_block_number, 10);
        if (isNaN(slot)) continue;

        const { process, stopPagination } = shouldProcessSlot(slot, fromSlot, toSlot);
        if (stopPagination) { shouldStopPagination = true; break; }
        if (!process) continue;

        const assetKey = chainSwap.asset.toLowerCase();
        const decimals = solanaAssetDecimals[assetKey] ?? DEFAULT_SOLANA_DECIMALS;
        const usdAmount = (parseFloat(chainSwap.amount) / Math.pow(10, decimals)) * chainSwap.asset_price;
        if (isNaN(usdAmount) || usdAmount <= 0) continue;

        events.push({
          blockNumber: slot,
          txHash: isSource ? source_swap.initiate_tx_hash : destination_swap.redeem_tx_hash,
          from: isSource ? source_swap.initiator : destination_swap.initiator,
          to: isSource ? source_swap.redeemer : destination_swap.redeemer,
          amount: Math.round(usdAmount).toString(),
          isDeposit: isSource,
          token: solanaTokenAddresses[assetKey] ?? WSOL_ADDRESS,
          timestamp: new Date(swap.created_at).getTime(),
        });
      }

      if (shouldStopPagination) { hasMoreData = false; break; }
      page++;
    } catch (error) {
      console.error(`Error fetching Solana ${isSource ? "source" : "destination"} page ${page}:`, error);
      throw error;
    }
  }

  return events;
};

const getSolanaEvents = async (fromSlot: number, toSlot: number): Promise<EventData[]> => {
  const [sourceEvents, destEvents] = await Promise.all([
    fetchSolanaDirection(true, fromSlot, toSlot),
    fetchSolanaDirection(false, fromSlot, toSlot),
  ]);

  return [...sourceEvents, ...destEvents].map((event) => ({
    blockNumber: event.blockNumber,
    txHash: event.txHash,
    from: event.from,
    to: event.to,
    token: event.token,
    amount: ethers.BigNumber.from(event.amount),
    isDeposit: event.isDeposit,
    isUSDVolume: true,
    timestamp: event.timestamp,
  }));
};

const TRON_HTLC = "TBjXw4bQsoNcKJocqAE37bW7hd6JV993tZ";
const TRON_USDT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

const getTronEvents = async (fromBlock: number, toBlock: number): Promise<EventData[]> => {
  const fromTimestamp = await tronGetTimestampByBlockNumber(fromBlock);
  const toTimestamp = await tronGetTimestampByBlockNumber(toBlock);

  const transactions = await getAccountTrcTransactions(
    TRON_HTLC,
    TRON_USDT,
    fromTimestamp * 1000,
    toTimestamp * 1000
  );

  return transactions
    .filter((tx: any) => tx.type === "Transfer") // Exclude Approval events
    .map((tx: any) => {
      const isDeposit = tx.to === TRON_HTLC;
      return {
        blockNumber: Math.floor(tx.block_timestamp / 1000), // Convert ms timestamp to seconds
        txHash: tx.transaction_id,
        from: tx.from,
        to: tx.to,
        token: TRON_USDT,
        amount: ethers.BigNumber.from(tx.value),
        isDeposit,
      };
    });
};

const getStarknetEvents = async (fromBlock: number, toBlock: number): Promise<EventData[]> => {
  return getChainEventsFromAPI(
    "starknet",
    fromBlock,
    toBlock,
    { "starknet:wbtc": "0x3fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac" },
    { "starknet:wbtc": 8 },
    "0x3fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac",
    8
  );
};

// cBTC is native on Citrea 
const getCitreaEvents = async (fromBlock: number, toBlock: number): Promise<EventData[]> => {
  return getChainEventsFromAPI(
    "citrea",
    fromBlock,
    toBlock,
    { "citrea:cbtc": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" },
    { "citrea:cbtc": 18 },
    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    18
  );
};

// BTC is native on Botanix — ERC20 Transfer events don't apply
const getBotanixEvents = async (fromBlock: number, toBlock: number): Promise<EventData[]> => {
  return getChainEventsFromAPI(
    "botanix",
    fromBlock,
    toBlock,
    { "botanix:btc": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" },
    { "botanix:btc": 18 },
    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    18
  );
};

// Monad: native MON (token: null) + ERC20 USDC — tracked via API to cover both
const getMonadEvents = async (fromBlock: number, toBlock: number): Promise<EventData[]> => {
  return getChainEventsFromAPI(
    "monad",
    fromBlock,
    toBlock,
    {
      "monad:mon": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      "monad:usdc": "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
    },
    { "monad:mon": 18, "monad:usdc": 6 },
    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    18
  );
};

const contractAddresses = {
  ethereum: {
    WBTC: "0xD781a2abB3FCB9fC0D1Dd85697c237d06b75fe95",
    USDT: "0xCF5E5e28848cFe779f7Fb711C57857Cb3b144A19",
    USDC: "0x5fA58e4E89c85B8d678Ade970bD6afD4311aF17E",
    cbBTC: "0xe35d025d0f0d9492db4700FE8646f7F89150eC04",
    iBTC: "0xDC74a45e86DEdf1fF7c6dac77e0c2F082f9E4F72",
  },
  arbitrum: {
    WBTC: "0xb5AE9785349186069C48794a763DB39EC756B1cF",
    USDC: "0xeae7721d779276eb0f5837e2fe260118724a2ba4",
    iBTC: "0x7e8c18fa79bd4014cfCf49294Bf315139eD39f45",
  },
  base: {
    cbBTC: "0xe35d025d0f0d9492db4700FE8646f7F89150eC04",
    USDC: "0xd8a6e3fca403d79b6ad6216b60527f51cc967d39",
    cbLTC: "0x7aE2D05e6fD9F12A9D4bA5C61384F4D0b90843eb",
  },
  unichain: {
    WBTC: "0xD8a6E3FCA403d79b6AD6216b60527F51cc967D39",
    USDC: "0x795Dcb58d1cd4789169D5F938Ea05E17ecEB68cA",
  },
  berachain: {
    LBTC: "0x39f3294352208905fc6ebf033954E6c6455CdB4C",
  },
  hyperliquid: {
    uBTC: "0xDC74a45e86DEdf1fF7c6dac77e0c2F082f9E4F72",
  },
  bsc: {
    BTCB: "0xe74784E5A45528fDEcB257477DD6bd31c8ef0761",
  },
  corn: {
    BTCN: "0xeaE7721d779276eb0f5837e2fE260118724a2Ba4"
  },
  megaeth: {
    "BTC.b": "0x52b4d144059CB17724D352034b15A8eaE2F29FA7",
  },
} as any;

const tokenAddresses = {
  ethereum: {
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    cbBTC: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    iBTC: "0x20157DBAbb84e3BBFE68C349d0d44E48AE7B5AD2",
  },
  arbitrum: {
    WBTC: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    iBTC: "0x050C24dBf1eEc17babE5fc585F06116A259CC77A",
  },
  base: {
    cbBTC: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
  unichain: {
    WBTC: "0x927B51f251480a681271180DA4de28D44EC4AfB8",
    USDC: "0x078D782b760474a361dDA0AF3839290b0EF57AD6",
  },
  berachain: {
    LBTC: "0xecAc9C5F704e954931349Da37F60E39f515c11c1",
  },
  hyperliquid: {
    uBTC: "0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463",
  },
  citrea: {
    cBTC: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  },
  botanix: {
    BTC: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  },
  bsc: {
    BTCB: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
  },
  corn: {
    BTCN: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
  },
  monad: {
    MON: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    USDC: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
  },
  megaeth: {
    "BTC.b": "0xB0F70C0bD6FD87dbEb7C10dC692a2a6106817072",
  },
} as any;


const constructParams = (chain: Chain) => {
  const eventParams = [] as PartialContractEventParams[];
  const contracts = contractAddresses[chain];

  Object.keys(contracts).forEach((token: string) => {
    const depositParams = constructTransferParams(contracts[token], true, {}, {}, chain);
    const withdrawParams = constructTransferParams(contracts[token], false, {}, {}, chain);
    eventParams.push(depositParams, withdrawParams);
  });

  return async (fromBlock: number, toBlock: number) => {
    return getTxDataFromEVMEventLogs("garden", chain, fromBlock, toBlock, eventParams);
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
  base: constructParams("base"),
  unichain: constructParams("unichain"),
  berachain: constructParams("berachain"),
  hyperliquid: constructParams("hyperliquid"),
  citrea: getCitreaEvents,
  botanix: getBotanixEvents,
  bsc: constructParams("bsc"),
  corn: constructParams("corn"),
  solana: getSolanaEvents,
  tron: getTronEvents,
  starknet: getStarknetEvents,
  monad: getMonadEvents,
  megaeth: constructParams("megaeth"),
};

export default adapter;
