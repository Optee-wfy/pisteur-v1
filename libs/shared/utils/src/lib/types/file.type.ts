import { z } from "zod";

// Base64-encoded file data
export const fileDtoSchema = z.object({
  name: z.string(),
  type: z.string(),
  data: z.string(),
});
export type FileDto = z.infer<typeof fileDtoSchema>;

export const labelledFileDtoSchema = z.object({
  file: fileDtoSchema,
  label: z.string(),
});
export type LabelledFileDto = z.infer<typeof labelledFileDtoSchema>;
