export function addMonth(value: Date, nbMonthsToAdd: number) {
  const newDate = new Date(value.getTime());

  // 2) Remember the original day
  const originalDay = newDate.getDate();

  // 3) Temporarily set day to 1, so we don't accidentally overflow when we add the month.
  newDate.setDate(1);

  // 4) Now safely add the months
  newDate.setMonth(newDate.getMonth() + nbMonthsToAdd);

  // 5) Figure out how many days are in the *new* month newDate.getMonth()+1 moves to
  // the next month, and "day=0" gives us the last day of the *previous* month, which is the one we just set.
  const daysInNewMonth = new Date(
    newDate.getFullYear(),
    newDate.getMonth() + 1,
    0,
  ).getDate();

  // 6) "Clamp" the day to the max day in the new month
  newDate.setDate(Math.min(originalDay, daysInNewMonth));

  return newDate;
}
