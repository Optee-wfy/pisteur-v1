import type { Prettify } from "@optee/utils";

/**
 * Extract the parameter at position N (default 0) of a given function T.
 * * Must be used with the function type, not the function itself. (use typeof keyword)
 * * You can set N type to extract the parameter at the Nth position. (For multiple arguments functions)
 *
 * @example
 * ```ts
 * FunctionParameters<typeof trpcClient.contacts.update.mutate>
 * ```
 */
export type ExtractParams<
  T extends (...args: Array<never>) => unknown,
  N = 0,
> = N extends keyof Parameters<T> ? Prettify<Parameters<T>[N]> : never;
