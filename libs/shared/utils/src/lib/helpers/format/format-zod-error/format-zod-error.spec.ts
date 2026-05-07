/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatZodError } from "./index";

describe("formatZodError", () => {
  it("should return valid: true if no error", () => {
    expect(formatZodError(undefined)).toEqual({ valid: true });
  });
  it("should return valid: false and errors for a ZodError", () => {
    // Simule une ZodError minimaliste
    const error = {
      errors: [
        { path: ["foo"], message: "Expected string, received null" },
        { path: ["bar"], message: "Required" },
      ],
    };
    expect(formatZodError(error as any)).toEqual({
      valid: false,
      errors: ["foo (Requis)", "bar (Requis)"],
    });
  });

  it("should handle empty errors array", () => {
    const error = { errors: [] };
    expect(formatZodError(error as any)).toEqual({ valid: false, errors: [] });
  });

  it("should handle malformed error object", () => {
    expect(formatZodError({} as any)).toEqual({ valid: false, errors: [] });
    expect(formatZodError({ errors: null } as any)).toEqual({
      valid: false,
      errors: [],
    });
    expect(formatZodError({ errors: undefined } as any)).toEqual({
      valid: false,
      errors: [],
    });
    expect(formatZodError({ errors: "not-an-array" } as any)).toEqual({
      valid: false,
      errors: [],
    });
  });

  it("should handle deep path in error", () => {
    const error = {
      errors: [{ path: ["foo", "bar", "baz"], message: "Required" }],
    };
    expect(formatZodError(error as any)).toEqual({
      valid: false,
      errors: ["foo.bar.baz (Requis)"],
    });
  });

  it("should keep original message if not 'Required'", () => {
    const error = {
      errors: [{ path: ["foo"], message: "Custom message" }],
    };
    expect(formatZodError(error as any)).toEqual({
      valid: false,
      errors: ["foo (Custom message)"],
    });
  });
});
