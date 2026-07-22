const text = { type: "string", minLength: 1, maxLength: 200 } as const;
const chain = { type: "string", minLength: 1, maxLength: 100 } as const;
const digits = { type: "string", pattern: "^[0-9]+$", maxLength: 20 } as const;
const bridgeIdOrAll = { type: "string", pattern: "^(all|[0-9]+)$", maxLength: 20 } as const;

const params = (properties: Record<string, unknown>, required: string[]) => ({
  type: "object",
  additionalProperties: false,
  properties,
  required,
});

const query = (properties: Record<string, unknown> = {}, required: string[] = []) => ({
  type: "object",
  additionalProperties: false,
  properties,
  ...(required.length > 0 ? { required } : {}),
});

export const routeSchemas = {
  bridgeDayStats: {
    params: params({ timestamp: digits, chain }, ["timestamp", "chain"]),
    querystring: query({ id: digits, rollingHours: digits }),
  },
  bridgeVolume: {
    params: params({ chain }, ["chain"]),
    querystring: query({ id: digits }),
  },
  bridgeVolumeBySlug: {
    params: params({ slug: text }, ["slug"]),
    querystring: query(),
  },
  bridgeTxCounts: {
    params: params({ chain }, ["chain"]),
    querystring: query(),
  },
  bridges: {
    querystring: query({ includeChains: { type: "string", enum: ["true", "false"] } }),
  },
  bridge: {
    params: params({ id: digits }, ["id"]),
    querystring: query(),
  },
  noQuery: {
    querystring: query(),
  },
  largeTransactions: {
    params: params({ chain }, ["chain"]),
    querystring: query({ starttimestamp: digits, endtimestamp: digits }),
  },
  largeTransactionsPaginated: {
    params: params({ chain }, ["chain"]),
    querystring: query({
      starttimestamp: digits,
      endtimestamp: digits,
      limit: { type: "string", pattern: "^[1-9][0-9]{0,3}$" },
      offset: digits,
    }),
  },
  netflows: {
    params: params({ period: { type: "string", enum: ["day", "week", "month"] } }, ["period"]),
    querystring: query(),
  },
  transactions: {
    params: params({ id: bridgeIdOrAll }, ["id"]),
    querystring: query({
      starttimestamp: digits,
      endtimestamp: digits,
      chain,
      sourcechain: chain,
      address: { type: "string", minLength: 1, maxLength: 300 },
      limit: { type: "string", pattern: "^(?:[1-9][0-9]{0,3}|10000)$" },
      cursor: { type: "string", minLength: 1, maxLength: 512, pattern: "^[A-Za-z0-9_-]+$" },
    }),
  },
  bridgeSearch: {
    querystring: query({ q: text, chain }),
  },
  netflowsCompare: {
    querystring: query(
      {
        period: { type: "string", enum: ["day", "week", "month"] },
        chains: { type: "string", minLength: 1, maxLength: 1000 },
      },
      ["period", "chains"]
    ),
  },
} as const;
