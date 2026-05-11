"use client";

import type { AppRouter } from "@optee/trpc-client";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();
