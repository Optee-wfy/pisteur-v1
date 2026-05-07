import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class CSVService {
  parse(file: File): Promise<Record<string, string | null>[]> {
    return new Promise((resolve, reject) => {
      if (file.type !== "text/csv") {
        reject(new Error("Seul les fichiers de type CSV sont autorisés."));
      }
      const reader = new FileReader();

      reader.onload = () => {
        try {
          const csvContent = reader.result as string;
          const rows = csvContent.trim().split("\n"); // Split by newlines
          const header = (rows[0] ?? "").split(","); // Get the header row

          const data = rows.slice(1).map((row) => {
            const values = row.split(",");
            return header.reduce(
              (acc, key, index) => {
                acc[key.trim()] = values[index]?.trim() ?? null;
                return acc;
              },
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              {} as Record<string, string | null>,
            );
          });

          resolve(data); // Resolve the promise with the parsed data
        } catch (error) {
          reject(new Error("Impossible de parser le CSV: " + error)); // Reject the promise in case of errors
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read the file"));
      };

      reader.readAsText(file); // Read the file as text
    });
  }

  arrayToCSV(
    data: Record<string, string | number | boolean | undefined | null>[],
  ): Blob | undefined {
    const obj = data[0];

    if (!obj) {
      console.error("The data array is empty.");
      return;
    }

    // Extract headers from the keys of the first object
    const headers = Object.keys(obj);

    // Create CSV content
    const csvContent = [
      headers.join(","), // Join headers with commas
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            return this.escapeCSVValue(value == null ? "" : String(value));
          })
          .join(","),
      ), // Escape values and join them
    ].join("\n");

    // Create a Blob from the CSV content
    return new Blob([csvContent], { type: "text/csv" });
  }

  escapeCSVValue(value: string): string {
    let escaped = value.replace(/"/g, '""');
    if (/^[=+\-@\t\r]/.test(escaped)) {
      escaped = "'" + escaped;
    }
    return `"${escaped}"`;
  }
}
