import { describe, expect, it } from "vitest";
import { addMonth } from "./add-month.fn";

describe("addMonth", () => {
  it("should add one month to a given date", () => {
    const date = new Date(2023, 0, 15); // January 15, 2023
    const result = addMonth(date, 1);
    expect(result).toEqual(new Date(2023, 1, 15)); // February 15, 2023
  });

  it("should handle year transition correctly", () => {
    const date = new Date(2023, 11, 15); // December 15, 2023
    const result = addMonth(date, 1);
    expect(result).toEqual(new Date(2024, 0, 15)); // January 15, 2024
  });

  it("should handle leap year correctly", () => {
    const date = new Date(2020, 0, 31); // January 31, 2020
    const result = addMonth(date, 1);
    expect(result).toEqual(new Date(2020, 1, 29)); // February 29, 2020
  });

  it("should handle adding multiple months", () => {
    const date = new Date(2023, 0, 15); // January 15, 2023
    const result = addMonth(date, 6);
    expect(result).toEqual(new Date(2023, 6, 15)); // July 15, 2023
  });

  it("should handle subtracting months", () => {
    const date = new Date(2023, 6, 15); // July 15, 2023
    const result = addMonth(date, -6);
    expect(result).toEqual(new Date(2023, 0, 15)); // January 15, 2023
  });

  it("should handle subtracting months across years", () => {
    const date = new Date(2023, 0, 15); // January 15, 2023
    const result = addMonth(date, -1);
    expect(result).toEqual(new Date(2022, 11, 15)); // December 15, 2022
  });

  it("should handle invalid date input", () => {
    const date = new Date("invalid-date");
    const result = addMonth(date, 1);
    expect(result.toString()).toEqual("Invalid Date");
  });

  it("should handle zero months addition", () => {
    const date = new Date(2023, 0, 15); // January 15, 2023
    const result = addMonth(date, 0);
    expect(result).toEqual(new Date(2023, 0, 15)); // January 15, 2023
  });
});
