const inFlight = new Map<string, Promise<unknown>>();

export const getCachedValue = async <T>(
  cache: Map<string, { value: T; expiresAt: number }>,
  key: string,
  ttlMs: number,
  maxEntries: number,
  fetcher: () => Promise<T>,
): Promise<T> => {
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) {
    cache.delete(key);
    cache.set(key, cached);
    return cached.value;
  }
  const staleValue = cached?.value;
  for (const [entryKey, entry] of cache.entries()) {
    if (entry.expiresAt <= now) {
      cache.delete(entryKey);
    }
  }
  const existingPromise = inFlight.get(key) as Promise<T> | undefined;
  if (existingPromise) {
    try {
      return await existingPromise;
    } catch (error) {
      if (staleValue !== undefined) {
        return staleValue;
      }
      throw error;
    }
  }
  let resolvePromise!: (value: T) => void;
  let rejectPromise!: (reason: unknown) => void;
  const fetchPromise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  inFlight.set(key, fetchPromise);
  void (async () => {
    try {
      const value = await fetcher();
      while (cache.size >= maxEntries) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey === undefined) {
          break;
        }
        cache.delete(oldestKey);
      }
      const expiresAt = Date.now() + ttlMs;
      cache.delete(key);
      cache.set(key, { value, expiresAt });
      resolvePromise(value);
    } catch (error) {
      rejectPromise(error);
    }
  })();
  try {
    return await fetchPromise;
  } catch (error) {
    if (staleValue !== undefined) {
      return staleValue;
    }
    throw error;
  } finally {
    inFlight.delete(key);
  }
};
