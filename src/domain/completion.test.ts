import { describe, expect, it } from "vitest";
import { FASTED_MARKER, type DailyEntry, defaultSettings } from "./types";
import { getCompletionStatus } from "./completion";

const baseEntry: DailyEntry = {
  date: "2026-05-14",
  meals: {},
  updatedAt: "2026-05-14T00:00:00.000Z",
};

describe("getCompletionStatus", () => {
  it("requires photo, weight, breakfast, lunch, and dinner by default", () => {
    expect(getCompletionStatus(baseEntry, defaultSettings).tasks).toEqual([
      { key: "photo", label: "전신 사진", required: true, complete: false },
      { key: "weight", label: "몸무게", required: true, complete: false },
      { key: "meals", label: "식단 보고", required: true, complete: false },
    ]);
  });

  it("marks the day complete when photo, valid weight, breakfast, lunch, and dinner are present", () => {
    const entry: DailyEntry = {
      ...baseEntry,
      photo: {
        id: "photo-1",
        previewUrl: "blob:photo-1",
        createdAt: "2026-05-14T08:00:00.000Z",
      },
      weightKg: 72.4,
      meals: {
        breakfast: "계란",
        lunch: "샐러드",
        dinner: "닭가슴살",
      },
    };

    expect(getCompletionStatus(entry, defaultSettings).isComplete).toBe(true);
  });

  it("accepts the fasted marker for required meals", () => {
    const entry: DailyEntry = {
      ...baseEntry,
      photo: {
        id: "photo-1",
        previewUrl: "blob:photo-1",
        createdAt: "2026-05-14T08:00:00.000Z",
      },
      weightKg: 72.4,
      meals: {
        breakfast: FASTED_MARKER,
        lunch: FASTED_MARKER,
        dinner: FASTED_MARKER,
      },
    };

    expect(getCompletionStatus(entry, defaultSettings).isComplete).toBe(true);
  });

  it("does not require a snack", () => {
    const entry: DailyEntry = {
      ...baseEntry,
      photo: {
        id: "photo-1",
        previewUrl: "blob:photo-1",
        createdAt: "2026-05-14T08:00:00.000Z",
      },
      weightKg: 72.4,
      meals: {
        breakfast: "요거트",
        lunch: "비빔밥",
        dinner: "생선",
      },
    };

    expect(getCompletionStatus(entry, defaultSettings).isComplete).toBe(true);
  });

  it("excludes disabled tasks from completion", () => {
    const settings = {
      ...defaultSettings,
      requiredTasks: {
        ...defaultSettings.requiredTasks,
        photo: false,
        weight: false,
      },
    };
    const entry: DailyEntry = {
      ...baseEntry,
      meals: {
        breakfast: "오트밀",
        lunch: "두부",
        dinner: "수프",
      },
    };

    expect(getCompletionStatus(entry, settings).isComplete).toBe(true);
    expect(getCompletionStatus(entry, settings).tasks).toEqual([
      { key: "photo", label: "전신 사진", required: false, complete: false },
      { key: "weight", label: "몸무게", required: false, complete: false },
      { key: "meals", label: "식단 보고", required: true, complete: true },
    ]);
  });
});
