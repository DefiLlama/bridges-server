import fetch from "node-fetch";
const retry = require("async-retry");

export const getTokenAddress = (symbol: string, chain: string, assets: any[]) =>  {
    symbol = getSymbol(symbol);
    chain = getChain(chain);
    let tokenAddress = assets.find((asset) => asset.symbol === symbol)?.addresses?.[chain]?.address;

    if (tokenAddress == undefined) tokenAddress = "0x000000000000000000000000000000000000dEaD"

    return tokenAddress;
}

const getChain = (chain: string) => {
  switch (chain) {
    case "avax": return "avalanche";
    case "bsc": return "binance";
    // Add any new chain mappings here if needed
    default: return chain;
  }
}

const getSymbol = (rawSymbol: string) => {
  let symbol: string = rawSymbol;
  if (symbol.startsWith("axl-")) symbol = symbol.slice(4);
  if (symbol.startsWith("axl")) symbol = symbol.slice(3);
  
  const nativeTokenMap: {[key: string]: string} = {
    "AVAX": "WAVAX",
    "FTM": "WFTM",
    "BNB": "WBNB",
    "MATIC": "WMATIC",
    "FIL": "WFIL",
    "ETH": "WETH",
    "wAXL": "AXL",
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
      }).then((res) => res.json())
    );
}