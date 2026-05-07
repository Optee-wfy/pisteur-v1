export function formatCurrency(
  amount: number,
  currency = "€",
  decimals = 0,
): string {
  if (!Number.isFinite(amount)) {
    return `NaN ${currency}`;
  }
  const integerValue = decimals === 0 ? Math.floor(amount) : amount;
  const units = [
    { limit: 1_000_000_000_000, suffix: "T" }, // Trillions
    { limit: 1_000_000_000, suffix: "B" }, // Billions
    { limit: 1_000_000, suffix: "M" }, // Millions
    { limit: 1_000, suffix: "K" }, // Thousands
  ];

  return (
    units.reduce((formatted, unit) => {
      if (!formatted && Math.abs(integerValue) >= unit.limit) {
        return `${(integerValue / unit.limit).toFixed(decimals)}${unit.suffix} ${currency}`;
      }
      return formatted;
    }, "") ||
    `${decimals > 0 ? amount.toFixed(decimals) : integerValue} ${currency}`
  );
}
