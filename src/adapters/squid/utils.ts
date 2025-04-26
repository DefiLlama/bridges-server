import fetch from "node-fetch";
const retry = require("async-retry");
import { stablecoins, chainIdToName } from "./constants";

const NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

// Add mapping for native tokens
const nativeTokens: { [chain: string]: string } = {
  ethereum: "ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
  polygon: "polygon:0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", // WMATIC
  arbitrum: "arbitrum:0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // WETH
  optimism: "optimism:0x4200000000000000000000000000000000000006", // WETH
  base: "base:0x4200000000000000000000000000000000000006", // WETH
  linea: "ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // Map to ETH price
  avalanche: "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", // WAVAX
  bsc: "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", // WBNB
  fantom: "fantom:0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83", // WFTM
};

// Add proper token address mapping
const tokenAddressMap: { [key: string]: { [chain: string]: string } } = {
  USDC: {
    ethereum: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    arbitrum: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
    optimism: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
    polygon: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    bsc: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    fantom: "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
    base: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    linea: "0x176211869ca2b568f2a7d4ee941e073a821ee1ff",
    avax: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
    moonbeam: "0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b"
  },
  WETH: {
    ethereum: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    arbitrum: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    optimism: "0x4200000000000000000000000000000000000006",
    base: "0x4200000000000000000000000000000000000006",
    linea: "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f"
  },
  LQDR: {
    linea: "0x332c72dd7e77070740f01d2d35851c461585d5d0"  // Replace with actual LQDR token address on Linea
  }
};

export const getTokenId = (token: string, chain: string): string => {
  // Handle native token case
  if (token.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
    return `${chain}:${tokenAddressMap["WETH"][chain]}`;
  }

  // Check if token is in address map
  const tokenSymbol = token.toUpperCase();
  if (tokenAddressMap[tokenSymbol]?.[chain]) {
    return `${chain}:${tokenAddressMap[tokenSymbol][chain]}`;
  }

  // If token is already an address, return formatted string
  if (token.startsWith("0x")) {
    return `${chain}:${token.toLowerCase()}`;
  }

  // For other cases, try to use the token symbol
  return `${chain}:${token.toLowerCase()}`;
}

export const getTokenAddress = (symbol: string, chain: string, assets: any[]) => {
  // Handle native token address
  if (symbol === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
    return symbol;
  }
  symbol = getSymbol(symbol);
  chain = getChain(chain);
  let tokenAddress = assets.find((asset) => asset.symbol === symbol
  )?.addresses?.[chain == 'imx' ? 'immutable' : chain]?.address
  if (tokenAddress == undefined) tokenAddress = "0x000000000000000000000000000000000000dEaD"

  return tokenAddress;
}

const getChain = (chain: string) => {
  switch (chain) {
    case "avax": return "avalanche";
    case "bsc": return "binance";
    case "base": return "base";
    case "linea": return "linea";
    case "scroll": return "scroll";
    case "blast": return "blast";
    case "fraxtal": return "fraxtal";
    case "immutable": return "immutable";
    // Add any new chain mappings here if needed
    default: return chain;
  }
}

const getSymbol = (rawSymbol: string) => {
  let symbol: string = rawSymbol;
  if (symbol.startsWith("axl-")) symbol = symbol.slice(4);
  if (symbol.startsWith("axl")) symbol = symbol.slice(3);

  const nativeTokenMap: { [key: string]: string } = {
    "AVAX": "WAVAX",
    "FTM": "WFTM",
    "BNB": "WBNB",
    "MATIC": "WMATIC",
    "FIL": "WFIL",
    "ETH": "WETH",
    "wAXL": "AXL",
    "LINEA": "ETH",
    "BASE": "ETH",
    "BLAST": "ETH",
    "FRAX": "FRAX",
    "IMX": "IMX",
    // Add any new native token mappings here if needed
  };

  symbol = nativeTokenMap[symbol] || symbol;

  return symbol.charAt(0) === symbol.toUpperCase().charAt(0) ? symbol.toUpperCase() : symbol;
}

export const fetchAssets = () => {
    return retry(() =>
      fetch("https://api.axelarscan.io/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "getAssets",
        }),
      }).then((res: any) => {
        console.log(res, 'the res')
        res.json()
      })
    );
}

export const isStablecoin = (tokenAddress: string, chain: string) => {
  // If it's the native token address, it's not a stablecoin
  if (tokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()) {
    return false;
  }

  // Common stablecoin symbols to check in assets list
  const stablecoinSymbols = ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'USDP'];

  // Check if the token address matches known stablecoin addresses
  const stablecoinAddresses = {
    bsc: [
      "0x55d398326f99059ff775485246999027b3197955", // USDT
      "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC
      "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3", // DAI
      "0xe9e7cea3dedca5984780bafc599bd69add087d56", // BUSD
    ],
    base: [
      "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // USDC
      "0x50c5725949a6f0c72e6c4a641f24049a917db0cb", // DAI
    ],
    linea: [
      "0x176211869ca2b568f2a7d4ee941e073a821ee1ff", // USDC
      "0xa219439258ca9da29e9cc4ce5596924745e12b93", // USDT
    ],
    ethereum: [
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
      "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
      "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
    ],
    arbitrum: [
      "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
      "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
    ],
    optimism: [
      "0x7f5c764cbc14f9669b88837ca1490cca17c31607", // USDC
      "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58", // USDT
    ],
    polygon: [
      "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // USDC
      "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // USDT
    ],
    avax: [
      "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e", // USDC
      "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7", // USDT
    ]
  };

  const chainStablecoins = stablecoinAddresses[chain.toLowerCase()] || [];
  return chainStablecoins.includes(tokenAddress.toLowerCase());
};

// Add helper function to convert chain ID to name
export const getChainNameFromId = (chainId: string | number): string => {
  // Convert number to hex string if needed
  const hexChainId = typeof chainId === "number" ?
    "0x" + chainId.toString(16) :
    chainId.toLowerCase();

  return chainIdToName[hexChainId] || "unknown";
};

// When processing logs, use this to get chain names
const processLogData = (logData: any) => {
  const fromChainId = logData.fromChain?._hex || logData.fromChain;
  const toChainId = logData.toChain?._hex || logData.toChain;

  return {
    ...logData,
    fromChain: getChainNameFromId(fromChainId),
    toChain: getChainNameFromId(toChainId)
  };
};

export const fetchWithRetry = async (url: string, maxRetries = 5) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = await fetch(url);
      if (response.status === 429) {
        // Get retry-after header or use exponential backoff
        const retryAfter = response.headers.get('retry-after') ?
          parseInt(response.headers.get('retry-after') || '1') :
          Math.pow(2, retries) * 1000;

        console.log(`Rate limited. Retrying after ${retryAfter}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter));
        retries++;
        continue;
      }
      return response;
    } catch (error) {
      retries++;
      if (retries >= maxRetries) throw error;
      // Exponential backoff
      const delay = Math.pow(2, retries) * 1000;
      console.log(`Request failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error(`Failed after ${maxRetries} retries`);
};
