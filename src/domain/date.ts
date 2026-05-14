export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function minutesFromMidnight(time: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(time);

  if (!match) {
    throw new Error("Time must use HH:mm format");
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error("Time must use HH:mm format");
  }

  return hour * 60 + minute;
}

export function currentMinutesFromMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}
