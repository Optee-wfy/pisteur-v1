import { API_TRPC_BASE_ROUTE } from "@optee/constants";
import { environment } from "@optee/env";
import type { AppRouter } from "@optee/trpc-client";
import type { TRPCLink } from "@trpc/client";
import { createTRPCProxyClient, httpLink, TRPCClientError } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import superjson from "superjson";
import { SupabaseService } from "./app/supabase.service";

export function isTRPCClientError(
  cause: unknown,
): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError;
}

export const authErrorLink: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      const subscription = next(op).subscribe({
        next(value) {
          observer.next(value);
        },
        error(err) {
          if (err.data?.code === "UNAUTHORIZED") {
            SupabaseService.signOut();
          }

          observer.error(err);
        },
        complete() {
          observer.complete();
        },
      });

      return subscription;
    });
  };
};

export const TRPC_SKIP_BATCH_KEY = "skipBatch";

// Get tRPC API URL
// - Development: use apiUrl to connect to standalone API server (localhost:4200)
// - Preview/Production: use relative path, Firebase Hosting rewrites handle the routing to API functions
const getTrpcUrl = () => {
  // In development with standalone API server
  if (environment.slug === "development") {
    return `${environment.apiUrl}${API_TRPC_BASE_ROUTE}`;
  }

  // Preview/Production: relative path + Firebase Hosting rewrites
  return API_TRPC_BASE_ROUTE;
};

export const trpcClient = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    authErrorLink,
    httpLink({
      url: getTrpcUrl(),
      headers() {
        return SupabaseService.getHeaders();
      },
    }),
    /*
    // Allow to skip batching for specific operations
    splitLink({
      condition(op) {
        // check for context property `skipBatch`
        return Boolean(op.context[TRPC_SKIP_BATCH_KEY]);
      },
      // when condition is true, use normal request
      true: httpLink({
        url,
        headers() {
          return SupabaseService.getHeaders();
        },
      }),
      // when condition is false, use batching
      false: httpBatchLink({
        url,
        headers() {
          return SupabaseService.getHeaders();
        },
      }),
    }),
    */
  ],
});

export default trpcClient;
