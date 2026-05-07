import { BlogPostProvider } from "@optee/blogpost-server";
import z from "zod";
import { publicProcedure, router } from "../trpc";

export const blogPostRouter = router({
  getBySlug: publicProcedure
    .input(z.string())
    .query(({ input }) => BlogPostProvider.getBySlug(input)),

  getRelatedEntries: publicProcedure
    .input(z.array(z.string()))
    .query(({ input }) => BlogPostProvider.getRelatedEntries(input)),

  getAll: publicProcedure
    .input(z.object({ limit: z.number().min(0).max(10).optional() }))
    .query(({ input }) => BlogPostProvider.getEntries(input.limit)),
});
