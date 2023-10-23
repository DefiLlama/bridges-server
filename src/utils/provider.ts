import { getClient } from "../helpers/sui";
import { getProvider as getLlamaProvider } from "@defillama/sdk";

export function getProvider(chain: string) {
  if (chain === "sui") {
    return getClient();
  }

  return getLlamaProvider(chain);
}
