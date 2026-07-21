export const responseAllowsCaching = (headers: Record<string, any>) => {
  const cacheControl = Object.entries(headers).find(([name]) => name.toLowerCase() === "cache-control")?.[1];
  return typeof cacheControl !== "string" || !/(?:^|,)\s*no-store(?:,|$)/i.test(cacheControl);
};
