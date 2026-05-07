/**
 * Returns a formatted duration range based on a value and gap percentage
 * @param value - The base duration value (in years)
 * @param gap - The gap percentage (0.2 means 20%)
 * @returns A formatted string representing the duration range
 */
export function getDurationRange({
  value,
  gap,
}: {
  value: number | null;
  gap: number;
}): string {
  if (value === null) {
    return "--";
  }

  if (gap < 0) {
    throw new Error("Gap must be a positive number");
  }

  const lowerBound = value * (1 - gap);
  const upperBound = value * (1 + gap);
  const formatYears = (value: number) => {
    const formattedValue = value.toFixed(1);
    const pluralSuffix = Math.abs(Math.floor(value)) > 1 ? "s" : "";
    return `${formattedValue} an${pluralSuffix}`;
  };
  return `${formatYears(lowerBound)} < ${formatYears(upperBound)}`;
}
