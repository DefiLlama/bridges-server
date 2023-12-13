// import { getClient } from "../helpers/sui";
import { getProvider as getLlamaProvider } from "@defillama/sdk";
import { getConnection } from "../helpers/solana";

export function getProvider(chain: string) {
  if (chain === "sui") {
    // return getClient();
  } else if (chain === "solana") {
    return getConnection();
  }

  return getLlamaProvider(chain);
}
