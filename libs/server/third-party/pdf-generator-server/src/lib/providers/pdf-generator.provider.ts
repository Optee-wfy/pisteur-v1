import { FileProvider } from "@optee/file-server";

const API_KEY = process.env["PDFSHIFT_API_KEY"];

export const PdfGeneratorProvider = {
  async create(url: string): Promise<string> {
    const apiUrl = "https://api.pdfshift.io/v3/convert/pdf";

    if (!API_KEY) {
      throw new Error("PDFSHIFT_API_KEY n'est pas défini.");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`api:${API_KEY}`), // Encoder "api:<API_KEY>" en base64
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: url,
        use_print: true,
        format: "A4",
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la génération PDF: ${response.statusText}`,
      );
    }

    return FileProvider.blobToBase64(response);
  },
};
