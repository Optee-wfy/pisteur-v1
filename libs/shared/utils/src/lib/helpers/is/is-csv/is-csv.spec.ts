import { describe, expect, it } from "vitest";
import { isCSV } from "./is-csv.fn";

describe("isCSV", () => {
  it("should return true for a CSV file", () => {
    const file = new File(["data;hello"], "file.csv", { type: "text/csv" });
    expect(isCSV(file)).toBe(true);
  });

  it("should return false for a non-CSV file", () => {
    const file = new File(["data;hello"], "file.txt", { type: "text/plain" });
    expect(isCSV(file)).toBe(false);
  });

  it("should return false for a file with no extension", () => {
    const file = new File(["data;hello"], "file", { type: "text/csv" });
    expect(isCSV(file)).toBe(false);
  });

  it("should return false for a file with a different extension but correct MIME type", () => {
    const file = new File(["data;hello"], "file.txt", { type: "text/csv" });
    expect(isCSV(file)).toBe(false);
  });

  it("should return false for a file with a CSV extension but incorrect MIME type", () => {
    const file = new File([""], "file.csv", { type: "text/plain" });
    expect(isCSV(file)).toBe(false);
  });

  it("should return false for a file with an empty name", () => {
    const file = new File([""], "", { type: "text/csv" });
    expect(isCSV(file)).toBe(false);
  });
});
