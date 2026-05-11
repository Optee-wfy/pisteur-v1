"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpLink } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";
import { createClient } from "@/lib/supabase/client";
import { trpc } from "@/lib/trpc";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const TRPC_URL = `${API_URL}/api/trpc`;

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }));

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpLink({
          url: TRPC_URL,
          transformer: superjson,
          async headers() {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return {};
            return {
              Authorization: `Bearer ${session.access_token}`,
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
            };
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
