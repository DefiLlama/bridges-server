import dayjs from "dayjs";
import { queryAllium } from "../../helpers/allium";
import { defaultConfidenceThreshold } from "../../utils/constants";
import { getSingleLlamaPrice } from "../../utils/prices";

export type WormholeBridgeEvent = {
  block_timestamp: string | number;
  transaction_hash: string;
  token_transfer_from_address: string;
  token_transfer_to_address: string;
  token_address: string;
  token_usd_amount: string;
  token_amount: string;
  source_chain: string;
  source_token_address: string | null;
  source_token_amount: string | null;
  destination_chain: string;
  application_protocol_ids: string[] | string | null;
};

type PriceData = {
  price?: number | string;
  decimals?: number | string;
  confidence?: number;
};

type PriceFetcher = (chain: string, token: string, timestamp?: number) => Promise<PriceData | null | undefined>;

type WormholeOutlierOptions = {
  threshold?: number;
  fetchPrice?: PriceFetcher;
};

const WORMHOLE_REPRICE_USD_THRESHOLD = 1_000_000;

const priceChainMapping: Record<string, string> = {
  avalanche: "avax",
  avax: "avax",
  bnb_smart_chain: "bsc",
  bsc: "bsc",
  ethereum: "ethereum",
  polygon: "polygon",
  arbitrum: "arbitrum",
  optimism: "optimism",
  base: "base",
  solana: "solana",
  fantom: "fantom",
  celo: "celo",
  mantle: "mantle",
  scroll: "scroll",
};

const getSourcePriceChainAndToken = (event: WormholeBridgeEvent) => {
  const sourceChain = event.source_chain?.toLowerCase?.();
  const priceChain = priceChainMapping[sourceChain];
  if (!priceChain || !event.source_token_address) return null;

  const token = priceChain === "solana" ? event.source_token_address : event.source_token_address.toLowerCase();
  return { priceChain, token };
};

const getRepricedUsdAmount = async (
  event: WormholeBridgeEvent,
  priceCache: Map<string, Promise<PriceData | null | undefined>>,
  fetchPrice: PriceFetcher
): Promise<number | null> => {
  const sourceTokenAmount = Number(event.source_token_amount);
  if (!Number.isFinite(sourceTokenAmount) || sourceTokenAmount <= 0) return null;

  const priceKey = getSourcePriceChainAndToken(event);
  if (!priceKey) return null;

  const eventTimestamp = Number(event.block_timestamp);
  if (!Number.isFinite(eventTimestamp) || eventTimestamp <= 0) return null;

  const hourTimestamp = Math.floor(eventTimestamp / 3600) * 3600;
  const cacheKey = `${priceKey.priceChain}:${priceKey.token}:${hourTimestamp}`;
  if (!priceCache.has(cacheKey)) {
    priceCache.set(cacheKey, fetchPrice(priceKey.priceChain, priceKey.token, hourTimestamp));
  }

  const priceData = await priceCache.get(cacheKey);
  const confidence = priceData?.confidence;
  if (confidence !== undefined && confidence < defaultConfidenceThreshold) return null;

  const price = Number(priceData?.price);
  if (!Number.isFinite(price) || price <= 0) return null;

  const upstreamUsdAmount = Number(event.token_usd_amount);
  const directUsdAmount = sourceTokenAmount * price;
  const decimals = Number(priceData?.decimals);

  if (
    Number.isFinite(decimals) &&
    decimals >= 0 &&
    Number.isInteger(decimals) &&
    directUsdAmount > upstreamUsdAmount * 100
  ) {
    const decimalAdjustedUsdAmount = (sourceTokenAmount / 10 ** decimals) * price;
    if (
      Number.isFinite(decimalAdjustedUsdAmount) &&
      decimalAdjustedUsdAmount > 0 &&
      decimalAdjustedUsdAmount <= upstreamUsdAmount * 10
    ) {
      return decimalAdjustedUsdAmount;
    }
  }

  return Number.isFinite(directUsdAmount) && directUsdAmount > 0 ? directUsdAmount : null;
};

export const repriceWormholeOutliers = async (
  events: WormholeBridgeEvent[],
  options: WormholeOutlierOptions = {}
): Promise<WormholeBridgeEvent[]> => {
  const threshold = options.threshold ?? WORMHOLE_REPRICE_USD_THRESHOLD;
  const fetchPrice = options.fetchPrice ?? getSingleLlamaPrice;
  const priceCache = new Map<string, Promise<PriceData | null | undefined>>();
  const safeEvents: WormholeBridgeEvent[] = [];
  let repriced = 0;
  let dropped = 0;

  for (const event of events) {
    const upstreamUsdAmount = Number(event.token_usd_amount);
    if (!Number.isFinite(upstreamUsdAmount) || upstreamUsdAmount < threshold) {
      safeEvents.push(event);
      continue;
    }

    let repricedUsdAmount: number | null = null;
    let priceLookupError: unknown;
    try {
      repricedUsdAmount = await getRepricedUsdAmount(event, priceCache, fetchPrice);
    } catch (error) {
      priceLookupError = error;
    }

    if (repricedUsdAmount === null) {
      dropped++;
      const reason = priceLookupError
        ? `price lookup failed: ${(priceLookupError as any)?.message}`
        : "no trusted source amount/price";
      console.warn(
        `[Wormhole] Dropping unverifiable outlier ${event.transaction_hash}; ${reason} for ` +
          `${event.source_chain}:${event.source_token_address}`
      );
      continue;
    }

    repriced++;
    safeEvents.push({ ...event, token_usd_amount: String(repricedUsdAmount) });
  }

  if (repriced || dropped) {
    console.log(`[Wormhole] Repriced ${repriced} large events; dropped ${dropped} unverifiable outliers.`);
  }

  return safeEvents;
};

const chains = [
  "ethereum",
  "avalanche",
  "avax",
  "bsc",
  "polygon",
  "arbitrum",
  "optimism",
  "base",
  "zksync",
  "scroll",
  "aptos",
  "sui",
  "solana",
  "sei",
  "mantle",
  "fantom",
  "injective",
  "moonbeam",
  "oasis",
  "celo",
  "kaia",
  "near",
  "algorand",
  "terra",
  "terra classic",
  "karura",
  "acala",
  "wormchain",
  "monad",
];

export const chainNameMapping: { [key: string]: string } = {
  ethereum: "Ethereum",
  avalanche: "Avalanche",
  avax: "Avalanche",
  polygon: "Polygon",
  arbitrum: "Arbitrum",
  optimism: "Optimism",
  fantom: "Fantom",
  base: "Base",
  solana: "Solana",
  sui: "Sui",
  aptos: "Aptos",
  celo: "Celo",
  mantle: "Mantle",
  scroll: "Scroll",
  algorand: "Algorand",
  sei: "Sei",
  moonbeam: "Moonbeam",
  injective: "Injective",
  kaia: "Kaia",
  oasis: "Oasis",
  BNB_Smart_Chain: "BSC",
  bnb_smart_chain: "BSC",
  terra: "Terra Classic",
  terra2: "Terra",
  "terra classic": "Terra Classic",
  near: "Near",
  karura: "Karura",
  acala: "Acala",
  wormchain: "Wormchain",
  xlayer: "xLayer",
  blast: "Blast",
  xpla: "XPLA",
  monad: "Monad",
};

export function normalizeChainName(chainName: string): string {
  const lowercaseChain = chainName.toLowerCase();

  const mapping = chainNameMapping[lowercaseChain] || chainNameMapping[chainName];

  if (mapping) {
    return mapping?.toLowerCase();
  }

  return chainName?.toLowerCase();
}

export const fetchWormholeEvents = async (
  fromTimestamp: number,
  toTimestamp: number
): Promise<WormholeBridgeEvent[]> => {
  let allResults: WormholeBridgeEvent[] = [];
  let currentTimestamp = fromTimestamp;
  const BATCH_SIZE = 10000;

  while (currentTimestamp < toTimestamp) {
    const result = await queryAllium(`
      select
        BLOCK_TIMESTAMP,
        TOKEN_TRANSFER_FROM_ADDRESS,
        TOKEN_TRANSFER_TO_ADDRESS,
        TOKEN_ADDRESS,
        TOKEN_USD_AMOUNT,
        TOKEN_AMOUNT,
        SOURCE_CHAIN,
        SOURCE_TOKEN_ADDRESS,
        SOURCE_TOKEN_AMOUNT,
        DESTINATION_CHAIN, 
        APPLICATION_PROTOCOL_IDS,
        UNIQUE_ID AS transaction_hash
      from org_db__defillama.default.wormhole_token_transfers
      where
        block_timestamp BETWEEN TO_TIMESTAMP_NTZ(${currentTimestamp}) AND TO_TIMESTAMP_NTZ(${toTimestamp}) 
        and status != 'REFUNDED'
        order by block_timestamp
        limit ${BATCH_SIZE};
    `);

    if (result.length === 0) break;

    const normalizedBatch = result.map((row: any) => ({
      ...row,
      token_usd_amount: String(parseFloat(row.token_usd_amount || "0") || 0),
      block_timestamp: dayjs(row.block_timestamp).unix(),
    }));
    const repricedBatch = await repriceWormholeOutliers(normalizedBatch);

    allResults = [...allResults, ...repricedBatch];
    console.log(`Fetched ${allResults.length} Wormhole events.`);

    currentTimestamp = normalizedBatch[normalizedBatch.length - 1].block_timestamp + 1;

    if (result.length < BATCH_SIZE) break;
  }

  return allResults;
};

const adapter = chains.reduce((acc: any, chain: string) => {
  acc[chain] = true;
  return acc;
}, {});

export default adapter;
