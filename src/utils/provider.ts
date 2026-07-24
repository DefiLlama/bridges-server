import { getClient } from "../helpers/sui";
import { getProvider as getLlamaProvider } from "@defillama/sdk";
import { getConnection } from "../helpers/solana";
import { ethers } from "ethers";

const providerRpcOverrides: Record<string, { url: string; chainId: number }> = {
  darwinia: { url: "https://rpc.darwinia.network", chainId: 46 },
};

export const getProviderRpcOverride = (chain: string) => providerRpcOverrides[chain.toLowerCase()];

export function getProvider(chain: string) {
  if (chain === "sui") {
    return getClient();
  } else if (chain === "solana") {
    return getConnection();
  }

  const override = getProviderRpcOverride(chain);
  if (override) {
    return new ethers.providers.StaticJsonRpcProvider(override.url, {
      chainId: override.chainId,
      name: chain,
    });
  }

  return getLlamaProvider(chain);
}
