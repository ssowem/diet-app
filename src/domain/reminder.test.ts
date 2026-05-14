import { describe, expect, it } from "vitest";
import { shouldShowReminder } from "./reminder";
import { defaultSettings } from "./types";

describe("shouldShowReminder", () => {
  it("does not show a reminder when reminders are disabled", () => {
    expect(
      shouldShowReminder({
        now: new Date("2026-05-14T10:00:00"),
        lastReminderAt: undefined,
        isComplete: false,
        settings: {
          ...defaultSettings,
          reminder: {
            ...defaultSettings.reminder,
            enabled: false,
          },
        },
      })
    ).toBe(false);
  });

  it("does not show a reminder outside the configured window", () => {
    expect(
      shouldShowReminder({
        now: new Date("2026-05-14T07:59:00"),
        lastReminderAt: undefined,
        isComplete: false,
        settings: defaultSettings,
      })
    ).toBe(false);
  });

  it("does not show a reminder when today is complete", () => {
    expect(
      shouldShowReminder({
        now: new Date("2026-05-14T10:00:00"),
        lastReminderAt: undefined,
        isComplete: true,
        settings: defaultSettings,
      })
    ).toBe(false);
  });

  it("shows a reminder inside the window when incomplete and no previous reminder exists", () => {
    expect(
      shouldShowReminder({
        now: new Date("2026-05-14T10:00:00"),
        lastReminderAt: undefined,
        isComplete: false,
        settings: defaultSettings,
      })
    ).toBe(true);
  });

  it("waits until 60 minutes pass before showing another reminder", () => {
    const lastReminderAt = new Date("2026-05-14T10:00:00");

    expect(
      shouldShowReminder({
        now: new Date("2026-05-14T10:30:00"),
        lastReminderAt,
        isComplete: false,
        settings: defaultSettings,
      })
    ).toBe(false);

    expect(
      shouldShowReminder({
        now: new Date("2026-05-14T11:00:00"),
        lastReminderAt,
        isComplete: false,
        settings: defaultSettings,
      })
    ).toBe(true);
  });
});
