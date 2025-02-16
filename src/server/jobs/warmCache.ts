import { warmCache, handlerRegistry, needsWarming } from "../../utils/cache";

const warmAllCaches = async () => {
  const cacheKeys = Array.from(handlerRegistry.keys());

  for (const cacheKey of cacheKeys) {
    try {
      if (await needsWarming(cacheKey)) {
        await warmCache(cacheKey);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Failed to warm cache for key ${cacheKey}:`, error);
    }
  }
};

export { warmAllCaches };
