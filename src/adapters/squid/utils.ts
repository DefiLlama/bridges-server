import fetch from "node-fetch";
import retry from "async-retry";

export const getAssets = () =>
  retry(() =>
    fetch("https://api.axelarscan.io/api/getAssets", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((res: any) => res.json())
  );

const chainNameMap: Record<string, string> = {
  avax: "avalanche",
  bsc: "binance",
};

export const getTokenAddress = (symbol: string, chain: string, assets: any[]): string => {
  const chainName = chainNameMap[chain] || chain;
  const asset = assets.find(
    (a: any) =>
      a.id?.toLowerCase() === symbol?.toLowerCase() ||
      a.symbol?.toLowerCase() === symbol?.toLowerCase() ||
      a.denom === symbol
  );
  if (!asset) return "";
  return asset?.addresses?.[chainName]?.address || "";
};
