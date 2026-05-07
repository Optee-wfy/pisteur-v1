export function getDaysDiff(date1: Date, date2: Date): number {
  const diffInTime = date2.getTime() - date1.getTime();
  return Math.floor(diffInTime / (1000 * 60 * 60 * 24));
}
