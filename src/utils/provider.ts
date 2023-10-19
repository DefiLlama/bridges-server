import { getConnection } from "../helpers/solana";
import { getProvider as getLlamaProvider } from "@defillama/sdk";

export function getProvider(chain: string) {
  if (chain === "solana") {
    return getConnection();
  }

  return getLlamaProvider(chain);
}
