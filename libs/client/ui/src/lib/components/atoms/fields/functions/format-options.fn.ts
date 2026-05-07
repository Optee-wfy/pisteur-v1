import type { FieldOptions } from "../field.types";

export function formatOptions(options: FieldOptions) {
  if (typeof options === "object" && !Array.isArray(options) && options) {
    if (Object.keys(options).length === 0) {
      return [];
    }
    return Object.entries(options).map(([value, label]) => ({
      label: formatLabel(label),
      value,
    }));
  }

  if (options.length === 0) {
    return [];
  }

  if (typeof options[0] === "string") {
    return (options as string[]).map((option) => ({
      label: formatLabel(option),
      value: option,
    }));
  }

  return (options as { label: string; value: string }[]).map((option) => ({
    ...option,
    label: formatLabel(option.label),
    value: option.value,
  }));
}

export function formatLabel(label: string) {
  return label
    .charAt(0)
    .toUpperCase()
    .concat(label.slice(1).toLowerCase().replaceAll("_", " "));
}
