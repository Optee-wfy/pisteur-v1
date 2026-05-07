export function isCSV(file: File): file is File {
  return (
    file.type === "text/csv" && file.size > 0 && file.name.endsWith(".csv")
  );
}
