export function formatSelectedValues(
  value: string | string[] | null,
  options: {
    label: string;
    value: string;
  }[],
) {
  const array = Array.isArray(value) ? value : [value];
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return "";
  }
  return array.length === 1
    ? (options.find((option) => option.value === array[0])?.label ?? "")
    : `${array.length} sélectionnés`;
}
