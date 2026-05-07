import z from "zod";

export const paginationRequestSchema = z.object({
  page: z.number().min(0).default(0),
  pageSize: z.number().min(10).max(100).default(20),
});
export type PaginationRequest = z.infer<typeof paginationRequestSchema>;
