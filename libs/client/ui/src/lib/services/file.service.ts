import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ToastService } from "./toast.service";
@Injectable({ providedIn: "root" })
export class FileService {
  private readonly http = inject(HttpClient);
  private readonly toaster = inject(ToastService);

  downloadFile(file: Blob, fileName: string) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = fileName;
    link.click();

    // Clean up
    URL.revokeObjectURL(link.href);
  }

  async downloadFileFromUrl(url: string, fileName: string) {
    const response = await fetch(url);

    if (!response.ok) {
      this.toaster.open(
        "error",
        "Une erreur est survenu",
        "Erreur lors du téléchargement du fichier",
      );
      return;
    }
    const blob = await response.blob();
    this.downloadFile(blob, fileName);
  }

  toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      // `reader.result` will be something like "data:image/png;base64, iVBORw0..."
      // We only want the base64 portion after the comma
      reader.onload = () => {
        const res = (reader.result as string).split(",")[1];
        if (res) {
          resolve(res);
        } else {
          reject(new Error("Impossible de lire le fichier"));
        }
      };

      reader.onerror = () => reject(new Error("Impossible de lire le fichier"));
      reader.readAsDataURL(file);
    });
  }

  convertBase64ToUrl(base64: string, mimeType = "application/pdf"): string {
    return `data:${mimeType};base64,${base64}`;
  }
}
