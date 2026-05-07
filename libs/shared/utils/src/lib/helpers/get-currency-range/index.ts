import { formatCurrency } from "../format/format-currency";

export function getCurrencyRange({
  value,
  gap,
}: {
  value: number | null;
  gap: number;
}): string {
  if (value === null) {
    return "--";
  }

  const rawLower = value - value * gap;
  const rawUpper = value + gap * value;
  const lowerBound = formatCurrency(rawLower);
  const upperBound = formatCurrency(rawUpper);

  if (lowerBound === upperBound) {
    return lowerBound;
  }

  return rawLower < rawUpper
    ? `${lowerBound} < ${upperBound}`
    : `${upperBound} < ${lowerBound}`;
}
