import { NoteRepository } from "@optee/note-server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HubspotProvider } from "./hubspot.provider";

vi.mock("@optee/note-server");

const isProduction = ["production", "preview"].includes(
  process.env["VITE_ENV"] ?? "",
);

describe("HubspotProvider", () => {
  const mockFile = new Blob(["test content"], { type: "text/plain" });
  const mockFolderPath = "test/folder/path";
  const mockAttachmentId = "mock-attachment-id";

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should upload a file and associate it to a note", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: mockAttachmentId }),
    });

    NoteRepository.associateToAttachment = vi
      .fn()
      .mockResolvedValue(mockAttachmentId);

    const result = await HubspotProvider.uploadFile({
      file: mockFile,
      folderPath: mockFolderPath,
      fileName: "document_sans_titre.pdf",
    });

    if (!isProduction) {
      expect(result).toBeNull();
    } else {
      expect(global.fetch).toHaveBeenCalledWith(
        "https://eu.api-proxy.stacksync.cloud/v1/proxy/https://api.hubapi.com/files/v3/files",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: `Bearer ${process.env["STACKSYNC_BEARER_TOKEN"]}`,
            contentType: "multipart/form-data",
          }),
        }),
      );

      expect(NoteRepository.associateToAttachment).toHaveBeenCalledWith(
        mockAttachmentId,
      );
      expect(result).toBe(mockAttachmentId);
    }
  });

  it("should throw an error if the upload fails", async () => {
    if (!isProduction) {
      return;
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: "Internal Server Error",
    });

    await expect(
      HubspotProvider.uploadFile({
        file: mockFile,
        folderPath: mockFolderPath,
        fileName: "document_sans_titre.pdf",
      }),
    ).rejects.toThrow("Internal Server Error");
  });

  it("should throw an error if the attachment ID is not returned", async () => {
    if (!isProduction) {
      return;
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });

    await expect(
      HubspotProvider.uploadFile({
        file: mockFile,
        folderPath: mockFolderPath,
        fileName: "document_sans_titre.pdf",
      }),
    ).rejects.toThrow("Failed to upload file");
  });
});
