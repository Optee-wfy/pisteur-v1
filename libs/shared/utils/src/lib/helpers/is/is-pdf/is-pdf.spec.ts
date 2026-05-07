import { describe, expect, it } from "vitest";
import { isPdf } from "./is-pdf.fn";

describe("isPdf", () => {
  describe("isPdf", () => {
    it("should return true for a valid PDF file", () => {
      const file = new File(["%PDF-1.4"], "test.pdf", {
        type: "application/pdf",
      });
      expect(isPdf(file)).toBe(true);
    });

    it("should return false for a non-PDF file", () => {
      const file = new File(["Hello, world!"], "test.txt", {
        type: "text/plain",
      });
      expect(isPdf(file)).toBe(false);
    });

    it("should return false for a file with a .pdf extension but incorrect MIME type", () => {
      const file = new File(["Hello, world!"], "test.pdf", {
        type: "text/plain",
      });
      expect(isPdf(file)).toBe(false);
    });

    it("should return true for an empty PDF file (type only)", () => {
      const file = new File([], "empty.pdf", { type: "application/pdf" });
      expect(isPdf(file)).toBe(true);
    });

    it("should return true for a PDF file with .pdf extension but no content (type only)", () => {
      const file = new File([""], "empty.pdf", { type: "application/pdf" });
      expect(isPdf(file)).toBe(true);
    });

    it("should return false for null", () => {
      expect(isPdf(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isPdf(undefined)).toBe(false);
    });

    it("should return false for a plain object", () => {
      expect(isPdf({})).toBe(false);
    });

    it("should return false for a string", () => {
      expect(isPdf("not a file")).toBe(false);
    });

    it("should return false for a number", () => {
      expect(isPdf(123)).toBe(false);
    });

    it("should return false for an object with wrong type property", () => {
      expect(isPdf({ type: "not/pdf" })).toBe(false);
    });
  });
});
