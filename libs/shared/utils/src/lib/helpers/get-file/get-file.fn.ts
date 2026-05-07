/**
 * Download a file from a URL and return it as a Blob
 * @param url path of the file to download
 * @returns the file as a Blob
 */
export async function getFile(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Erreur lors du téléchargement du fichier: ${response.statusText} with url: ${url}`,
    );
  }

  const type = response.headers.get("content-type");
  if (!type) {
    throw new Error("Type de fichier inconnu");
  }

  return response.blob();
}
