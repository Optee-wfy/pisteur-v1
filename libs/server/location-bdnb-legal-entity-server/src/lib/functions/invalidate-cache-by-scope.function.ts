const isCacheKeyForScope = (
  key: string,
  scope: string,
  shouldLogSQL: boolean,
): boolean => {
  try {
    const parsed = JSON.parse(key) as { scope?: string };
    return parsed?.scope === scope;
  } catch {
    if (shouldLogSQL) {
      console.warn("[cache] Malformed cache key:", key);
    }
    return false;
  }
};

export const invalidateCacheByScope = (
  cache: Map<string, unknown>,
  scope: string,
  shouldLogSQL = false,
) => {
  for (const key of cache.keys()) {
    if (isCacheKeyForScope(key, scope, shouldLogSQL)) {
      cache.delete(key);
    }
  }
};
