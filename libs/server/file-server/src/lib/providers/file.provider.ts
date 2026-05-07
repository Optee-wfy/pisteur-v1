export const FileProvider = {
  /**
   * Download file from the specified url.
   * @param url url of the file to download
   * @returns File content as Blob
   */
  async downloadFile(url: string) {
    const response = await fetch(url);
    const data = await response.blob();

    if (!response.ok) {
      throw new Error(
        `Failed to download file at path [${url}]: ${response.statusText}`,
      );
    }
    return data;
  },

  base64ToBlob({
    base64Data,
    contentType,
  }: {
    base64Data: string;
    contentType: string;
  }) {
    // Decode base64 (transform from base64 into a binary string)
    const byteCharacters = atob(base64Data);

    // Create an array of byte values
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    // Turn the array of byte values into a typed array (Uint8Array)
    const byteArray = new Uint8Array(byteNumbers);

    // Pass the typed array into a Blob constructor
    return new Blob([byteArray], { type: contentType });
  },

  async blobToBase64(response: Response): Promise<string> {
    try {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer.toString("base64");
    } catch (error) {
      throw new Error(`Failed to convert blob to base64: ${error}`);
    }
  },
};
