export const mergeRelayAggregationChains = (configuredChains: string[], staticChains: string[]): string[] => {
  return Array.from(
    new Set(
      [...configuredChains, ...staticChains]
        .map((chain) => chain.trim())
        .filter((chain) => chain.length > 0)
    )
  );
};
