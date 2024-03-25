export function daysRemaining(today: Date, targetDate: Date): number {
  if (!(today instanceof Date && targetDate instanceof Date)) {
    throw new TypeError("Input values must be Date objects.");
  }

  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const endDate = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );

  const differenceInMilliseconds = endDate.getTime() - startOfDay.getTime();
  const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

  return Math.max(0, Math.floor(differenceInDays));
}
