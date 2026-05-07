import type { z } from "zod";

// @todo improve error message to be more user friendly
export const formatZodError = (
  error?: z.ZodError,
): { valid: boolean; errors?: string[] } => {
  if (!error) {
    return { valid: true };
  }
  return {
    valid: false,
    errors: Array.isArray(error.errors)
      ? error.errors.map(
          (err) =>
            err.path.join(".") +
            " (" +
            (err.message === "Required" ||
            err.message === "Expected string, received null"
              ? "Requis"
              : err.message) +
            ")",
        )
      : [],
  };
};
