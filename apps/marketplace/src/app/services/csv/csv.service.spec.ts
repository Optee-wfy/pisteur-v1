import { beforeEach, describe, expect, it } from "vitest";
import { CSVService } from "./csv.service";

describe("CSVService", () => {
  let csvService: CSVService;

  beforeEach(() => {
    csvService = new CSVService();
  });

  describe("parse", () => {
    it("should parse a valid CSV file", async () => {
      const file = new File(["name,age\nJohn,30\nJane,25"], "test.csv", {
        type: "text/csv",
      });

      const result = await csvService.parse(file);
      expect(result).toEqual([
        { name: "John", age: "30" },
        { name: "Jane", age: "25" },
      ]);
    });

    it("should handle empty CSV file", async () => {
      const file = new File([""], "empty.csv", { type: "text/csv" });

      const result = await csvService.parse(file);
      expect(result).toEqual([]);
    });

    it("should reject if the file type is not CSV", async () => {
      const file = new File(["hello world"], "invalid.csv", {
        type: "application/pdf",
      });

      await expect(csvService.parse(file)).rejects.toThrow(
        "Seul les fichiers de type CSV sont autorisés.",
      );
    });
  });

  it("should parse and fill w/ null if the CSV content is invalid", async () => {
    const file = new File(["name,age\nJohn,30\nJane"], "invalid.csv", {
      type: "text/csv",
    });

    const result = await csvService.parse(file);
    expect(result).toEqual([
      { name: "John", age: "30" },
      { name: "Jane", age: null },
    ]);
  });

  it("should parse and ignore content if inconsistent columns found", async () => {
    const file = new File(["name,age\nJohn,30\nJane,25,extra"], "invalid.csv", {
      type: "text/csv",
    });

    const result = await csvService.parse(file);
    expect(result).toEqual([
      { name: "John", age: "30" },
      { name: "Jane", age: "25" },
    ]);
  });

  describe("arrayToCSV", () => {
    it("should convert an array of objects to CSV", () => {
      const data = [
        { name: "John", age: 30 },
        { name: "Jane", age: 25 },
      ];

      const blob = csvService.arrayToCSV(data);
      const expectedCSV = "name,age\nJohn,30\nJane,25";

      const reader = new FileReader();
      reader.onload = () => {
        expect(reader.result).toBe(expectedCSV);
      };
      reader.readAsText(blob as Blob);
    });

    it("should handle empty data array", () => {
      const data: Record<string, string>[] = [];

      const blob = csvService.arrayToCSV(data);
      expect(blob).toBeUndefined();
    });

    it("should escape values containing commas", () => {
      const data = [
        { name: "John, Doe", age: 30 },
        { name: "Jane, Smith", age: 25 },
      ];

      const blob = csvService.arrayToCSV(data);
      const expectedCSV = 'name,age\n"John, Doe",30\n"Jane, Smith",25';

      const reader = new FileReader();
      reader.onload = () => {
        expect(reader.result).toBe(expectedCSV);
      };
      reader.readAsText(blob as Blob);
    });

    it("should handle array with null values", () => {
      const data = [
        { name: "John", age: 30, city: null },
        { name: "Jane", age: 25, city: null },
      ];

      const blob = csvService.arrayToCSV(data);
      const expectedCSV = "name,age,city\nJohn,30,\nJane,25,";

      const reader = new FileReader();
      reader.onload = () => {
        expect(reader.result).toBe(expectedCSV);
      };
      reader.readAsText(blob as Blob);
    });
  });
});
