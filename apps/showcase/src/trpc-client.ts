import { API_TRPC_BASE_ROUTE } from "@optee/constants";
import { environment } from "@optee/env";
import type { AppRouter } from "@optee/trpc-client";
import { createTRPCProxyClient, httpLink, TRPCClientError } from "@trpc/client";
import superjson from "superjson";

export function isTRPCClientError(
  cause: unknown,
): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError;
}

export const trpcClient = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpLink({
      url: `${environment.apiUrl}${API_TRPC_BASE_ROUTE}`,
    }),
  ],
});

export default trpcClient;
