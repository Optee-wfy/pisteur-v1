const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds

export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      // eslint-disable-next-line @rx-angular/no-zone-critical-browser-apis
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs),
    ),
  ]);
};
