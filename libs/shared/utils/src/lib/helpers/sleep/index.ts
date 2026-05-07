/**
 * Set a timeout to resolve a promise for a given time (in ms)
 * @param ms time in milliseconds
 * @returns  Promise<void>
 */
export const sleep = (ms: number) =>
  // eslint-disable-next-line @rx-angular/no-zone-critical-browser-apis
  new Promise((resolve) => setTimeout(resolve, ms));
