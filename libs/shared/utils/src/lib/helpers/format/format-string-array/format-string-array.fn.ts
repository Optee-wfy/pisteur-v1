export function formatToStringArray(
  value: string | string[] | null | undefined,
): string[] {
  if (!value) {
    return [];
  }
  if (typeof value === "string") {
    const array = value
      .split(/\r?\n/)
      .map((v) => v.trim())
      .filter(Boolean);
    return Array.from(new Set(array));
  }

  return Array.from(new Set(value.map((v) => v.trim()).filter(Boolean)));
}
