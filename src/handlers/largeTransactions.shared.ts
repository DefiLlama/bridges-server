import { importBridgeNetwork } from "../data/importBridgeNetwork";
import { transformTokens } from "../helpers/tokenMappings";
import { isValidPriceId } from "../utils/priceIds";
import { getLlamaPricesWithStatus } from "../utils/prices";
import { ILargeTransactionRow, queryConfig } from "../utils/wrappa/postgres/query";

export const toUnixSeconds = (value: Date | number | string) => {
  if (value instanceof Date) return Math.floor(value.getTime() / 1000);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`Invalid transaction timestamp: ${value}`);
    return Math.floor(value > 10_000_000_000 ? value / 1000 : value);
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric)) return Math.floor(numeric > 10_000_000_000 ? numeric / 1000 : numeric);

  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) throw new Error(`Invalid transaction timestamp: ${value}`);
  return Math.floor(milliseconds / 1000);
};

const getPriceId = (tx: ILargeTransactionRow) => {
  const priceId = transformTokens[tx.chain]?.[tx.token] ?? `${tx.chain}:${tx.token}`;
  return isValidPriceId(priceId) ? priceId : undefined;
};

export const enrichLargeTransactions = async (largeTransactions: ILargeTransactionRow[]) => {
  const configs = await queryConfig();
  const configMapping: Record<string, string> = {};
  configs.forEach((config) => {
    const bridgeNetwork = importBridgeNetwork(config.bridge_name);
    if (bridgeNetwork) configMapping[config.id] = bridgeNetwork.displayName;
  });

  const tokenSet = new Set<string>();
  for (const tx of largeTransactions) {
    const priceId = getPriceId(tx);
    if (priceId) tokenSet.add(priceId);
  }

  const { prices, failedBatches, totalBatches } = await getLlamaPricesWithStatus(Array.from(tokenSet));
  const transactions = largeTransactions.map((tx) => {
    const bridgeName = configMapping[tx.bridge_id] ?? "unknown";
    const priceId = getPriceId(tx);
    const priceEntry = priceId ? prices[priceId] ?? prices[priceId.toLowerCase()] : undefined;
    return {
      date: toUnixSeconds(tx.ts),
      txHash: `${tx.chain}:${tx.tx_hash}`,
      from: tx.tx_from,
      to: tx.tx_to,
      token: `${tx.chain}:${tx.token}`,
      symbol: priceEntry?.symbol ?? "unknown",
      amount: tx.amount,
      isDeposit: tx.is_deposit,
      bridge: bridgeName,
      chain: tx.chain,
      usdValue: tx.usd_value,
    };
  });

  return {
    transactions,
    pricingDegraded: failedBatches > 0,
    priceBatches: { failed: failedBatches, total: totalBatches },
  };
};
