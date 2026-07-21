type APIEvent = {
  pathParameters?: Record<string, any>;
  queryStringParameters?: Record<string, any>;
  body?: any;
  routePath?: string;
};

export const normalizeBridgeDayStatsEvent = (event: APIEvent): APIEvent => {
  const timestamp = Number(event.pathParameters?.timestamp);
  const normalizedTimestamp = Math.floor(timestamp / 86400) * 86400;
  return {
    ...event,
    pathParameters: {
      ...event.pathParameters,
      timestamp: String(normalizedTimestamp),
      chain: String(event.pathParameters?.chain ?? "").toLowerCase(),
    },
  };
};

export const normalizeBridgesEvent = (event: APIEvent): APIEvent => ({
  ...event,
  body: { ...event.body, cacheVersion: "bridges-freshness-v1" },
});
