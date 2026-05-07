export const stableStringify = (value: unknown): string => {
  const seen = new WeakSet<object>();
  const normalize = (input: unknown): unknown => {
    if (input === null || typeof input !== "object") {
      return input;
    }
    if (seen.has(input as object)) {
      return "[Circular]";
    }
    seen.add(input as object);
    if (input instanceof Date) {
      return input.toISOString();
    }
    if (input instanceof RegExp) {
      return input.toString();
    }
    if (input instanceof Set) {
      return Array.from(input, normalize);
    }
    if (input instanceof Map) {
      const entries = Array.from(input.entries()).map(
        ([key, value]) =>
          [normalize(key), normalize(value)] as [unknown, unknown],
      );
      entries.sort((a, b) => {
        const aKey = JSON.stringify(a[0]) ?? "undefined";
        const bKey = JSON.stringify(b[0]) ?? "undefined";
        return aKey.localeCompare(bKey);
      });
      return entries;
    }
    if (Array.isArray(input)) {
      return input.map(normalize);
    }
    const obj = input as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = normalize(obj[key]);
    }
    return sorted;
  };
  return JSON.stringify(normalize(value));
};
