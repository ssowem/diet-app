import { currentMinutesFromMidnight, minutesFromMidnight } from "./date";
import type { UserSettings } from "./types";

export type ReminderDecisionInput = {
  now: Date;
  lastReminderAt: Date | undefined;
  isComplete: boolean;
  settings: UserSettings;
};

function isInsideWindow(
  now: Date,
  startTime: string,
  endTime: string
): boolean {
  const current = currentMinutesFromMidnight(now);
  const start = minutesFromMidnight(startTime);
  const end = minutesFromMidnight(endTime);

  if (start === end) {
    return false;
  }

  if (start < end) {
    return current >= start && current < end;
  }

  return current >= start || current < end;
}

export function shouldShowReminder(input: ReminderDecisionInput): boolean {
  const { now, lastReminderAt, isComplete, settings } = input;
  const { reminder } = settings;

  if (!reminder.enabled || isComplete) {
    return false;
  }

  if (!isInsideWindow(now, reminder.startTime, reminder.endTime)) {
    return false;
  }

  if (!lastReminderAt) {
    return true;
  }

  const elapsedMs = now.getTime() - lastReminderAt.getTime();
  const intervalMs = reminder.intervalMinutes * 60 * 1000;

  return elapsedMs >= intervalMs;
}
