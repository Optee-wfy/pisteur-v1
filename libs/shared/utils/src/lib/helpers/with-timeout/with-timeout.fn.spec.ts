/* eslint-disable @rx-angular/no-zone-critical-browser-apis */
import { describe, expect, it } from "vitest";
import { withTimeout } from "./with-timeout.fn";

describe("withTimeout", () => {
  it("resolves if the promise resolves before timeout", async () => {
    const result = await withTimeout(Promise.resolve("success"), 100);
    expect(result).toBe("success");
  });

  it("rejects if the promise takes longer than the timeout", async () => {
    const slowPromise = new Promise((resolve) =>
      setTimeout(() => resolve("slow"), 200),
    );
    await expect(withTimeout(slowPromise, 50)).rejects.toThrow(
      "Request timeout",
    );
  });

  it("resolves if the promise resolves exactly at the timeout", async () => {
    const exactPromise = new Promise((resolve) =>
      setTimeout(() => resolve("on time"), 50),
    );
    const result = await withTimeout(exactPromise, 50);
    expect(result).toBe("on time");
  });

  it("rejects with the original error if the promise rejects before timeout", async () => {
    const errorPromise = Promise.reject(new Error("original error"));
    await expect(withTimeout(errorPromise, 100)).rejects.toThrow(
      "original error",
    );
  });
});
