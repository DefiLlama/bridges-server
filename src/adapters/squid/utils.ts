import fetch from "node-fetch";
const retry = require("async-retry");

export const getTokenAddress = (symbol: string, chain: string, assets: any[]) =>  {
    
    symbol = getSymbol(symbol);
    chain = getChain(chain);
    // find the correct token address given the chain
    let tokenAddress = assets.find((asset) => asset.symbol === symbol)?.addresses?.[chain]?.address;

    // if the token address is not listed, then it means that the token is not that important. 
    // We return some hardcoded address for this token to circumvent the token address not found in defillama bridge server.
    if (tokenAddress == undefined) tokenAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"

    return tokenAddress;
}

const getChain = (chain: string) => {
  if (chain === "avax") return "avalanche";
  if (chain === "bsc") return "binance";
  else return chain;
}

const getSymbol = (rawSymbol: string) => {
  // the symbol is usually of the form axlUSDC, axlDAI, axlUSDT, etc. or if AXL is being transferred then AXL.
  let symbol: string = rawSymbol;
  // for tokens of the form axl-TOKEN, remove the first 4 chars.
  if (symbol.startsWith("axl-")) symbol = symbol.slice(4);
  // for tokens of the form axlUSDC, remove the first 3 chars.
  if (symbol.startsWith("axl")) symbol = symbol.slice(3);
  // if the symbol is of a native token then prepend w, i.e., AVAX -> WAVAX. This is because axelar represents native tokens as wrapped version.
  if (symbol === "AVAX") symbol = "WAVAX";
  if (symbol === "FTM") symbol = "WFTM";
  if (symbol === "BNB") symbol = "WBNB";
  if (symbol === "MATIC") symbol = "WMATIC";
  if (symbol === "FIL") symbol = "WFIL";
  if (symbol === "ETH") symbol = "WETH";
  if (symbol === "wAXL") symbol = "AXL";
  // make all uppercase if the token starts with an uppercase letter, e.g., Lqdr.
  if (symbol.charAt(0) === symbol.toUpperCase().charAt(0)) symbol = symbol.toUpperCase();
  

  return symbol;
}

export const fetchAssets = () => {
    // fetch from axelarscan and pass {"method": "getAssets"} as json body
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