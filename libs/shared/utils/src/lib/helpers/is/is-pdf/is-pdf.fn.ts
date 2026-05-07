export function isPdf(value: unknown): value is File {
  return (
    !!value &&
    typeof value === "object" &&
    "type" in value &&
    value?.type === "application/pdf"
  );
}
