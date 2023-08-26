import fetch from "node-fetch";
const retry = require("async-retry");

export const getTokenAddress = (symbol: string, chain: string, assets: any[]) =>  {
    // the symbol is usually of the form axlUSDC, axlDAI, axlUSDT, etc.
    const tokenSymbol = symbol.slice(3);
    // find the correct token address given the chain
    const tokenAddress = assets.find((asset) => asset.symbol === tokenSymbol)?.addresses?.[chain]?.address;
    return tokenAddress;
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