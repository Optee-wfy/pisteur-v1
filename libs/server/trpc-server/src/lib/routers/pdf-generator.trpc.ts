import { MARKETPLACE_UI_URL } from "@optee/constants";
import { PdfGeneratorProvider } from "@optee/pdf-generator-server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

const ALLOWED_HOSTS = new Set([new URL(MARKETPLACE_UI_URL).hostname]);

export const pdfGeneratorRouter = router({
  convertUrlToPdf: publicProcedure
    .input(
      z.object({
        url: z
          .string()
          .url()
          .refine((u) => {
            try {
              const { hostname } = new URL(u);
              return ALLOWED_HOSTS.has(hostname);
            } catch {
              return false;
            }
          }, "URL not allowed"),
      }),
    )
    .mutation(({ input }) => PdfGeneratorProvider.create(input.url)),
});
