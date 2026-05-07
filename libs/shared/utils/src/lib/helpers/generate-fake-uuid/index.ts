export function generateFakeUUID<T extends string>(): T {
  // In case performance is not defined (e.g. in older Node versions)
  const time = new Date().getTime();
  const perfTime =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0;

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    // We use either time or perfTime to produce randomness
    let r = Math.random() * 16;
    if (time > 0) {
      r = ((time + r) % 16) | 0;
    } else {
      r = ((perfTime + r) % 16) | 0;
    }

    // If 'x', use r; if 'y', use r & 0x3 | 0x8 (to make it RFC 4122 compliant)
    const value = char === "x" ? r : (r & 0x3) | 0x8;

    return value.toString(16);
  }) as T;
}
