import { describe, expect, it, vi } from "vitest";
import { getFile } from "./get-file.fn";

describe("getFile", () => {
  it("should download a file and return it as a Blob", async () => {
    const mockUrl = "https://example.com/file.txt";
    const mockResponse = new Response(
      new Blob(["file content"], { type: "text/plain" }),
      {
        status: 200,
        headers: { "content-type": "text/plain" },
      },
    );

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const result = await getFile(mockUrl);

    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe("text/plain");
    const text = await result.text();
    expect(text).toBe("file content");
  });

  it("should throw an error if the response is not ok", async () => {
    const mockUrl = "https://example.com/file.txt";
    const mockResponse = new Response(null, {
      status: 404,
      statusText: "Not Found",
    });

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    await expect(getFile(mockUrl)).rejects.toThrow(
      "Erreur lors du téléchargement du fichier: Not Found",
    );
  });

  it("should throw an error if the content-type header is missing", async () => {
    const mockUrl = "https://example.com/file.txt";
    const mockResponse = new Response(new Blob(["file content"]), {
      status: 200,
    });

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    await expect(getFile(mockUrl)).rejects.toThrow("Type de fichier inconnu");
  });
});
