import { warmCache, handlerRegistry, needsWarming } from "../../utils/cache";

const WARM_ACCESS_WINDOW_MS = 6 * 60 * 60 * 1000;

const warmAllCaches = async () => {
  let warmed = 0;
  let skipped = 0;
  for (const [cacheKey, entry] of Array.from(handlerRegistry.entries())) {
    if (!entry.pinned && Date.now() - entry.lastAccessedAt > WARM_ACCESS_WINDOW_MS) {
      skipped++;
      continue;
    }
    try {
      if (await needsWarming(cacheKey)) {
        await warmCache(cacheKey);
        warmed++;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Failed to warm cache for key ${cacheKey}:`, error);
    }
  }
  console.log(
    `[INFO] Cache warming: ${warmed} warmed, ${skipped} skipped (stale), registry size ${handlerRegistry.size}`
  );
};

export { warmAllCaches };
