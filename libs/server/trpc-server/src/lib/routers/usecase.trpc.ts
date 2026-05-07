import { UseCaseProvider } from "@optee/usecase-server";
import z from "zod";
import { publicProcedure, router } from "../trpc";

export const useCaseRouter = router({
  getBySlug: publicProcedure
    .input(z.string())
    .query(({ input }) => UseCaseProvider.getBySlug(input)),

  getRelatedEntries: publicProcedure
    .input(z.array(z.string()))
    .query(({ input }) => UseCaseProvider.getRelatedEntries(input)),

  getAll: publicProcedure
    .input(z.object({ limit: z.number().int().min(0).max(10).optional() }))
    .query(({ input }) => UseCaseProvider.getEntries(input.limit)),
});
