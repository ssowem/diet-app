import { beforeEach, describe, expect, test } from "vitest";
import { DailyEntry, defaultSettings, UserSettings } from "../domain/types";
import { localDietStorage } from "./storage";

describe("localDietStorage", () => {
  beforeEach(async () => {
    localStorage.clear();
    await localDietStorage.clearAll();
  });

  test("stores entries separately by date", async () => {
    const firstEntry: DailyEntry = {
      date: "2026-05-14",
      weightKg: 72,
      meals: {},
      updatedAt: "2026-05-14T00:00:00.000Z",
    };
    const secondEntry: DailyEntry = {
      date: "2026-05-15",
      weightKg: 71.5,
      meals: {},
      updatedAt: "2026-05-15T00:00:00.000Z",
    };

    await localDietStorage.saveEntry(firstEntry);
    await localDietStorage.saveEntry(secondEntry);

    await expect(localDietStorage.getEntry("2026-05-14")).resolves.toMatchObject({
      weightKg: 72,
    });
    await expect(localDietStorage.getEntry("2026-05-15")).resolves.toMatchObject({
      weightKg: 71.5,
    });
  });

  test("returns defaultSettings before custom settings are saved", async () => {
    await expect(localDietStorage.getSettings()).resolves.toEqual(defaultSettings);
  });

  test("persists settings", async () => {
    const settings: UserSettings = {
      ...defaultSettings,
      requiredTasks: {
        photo: false,
        weight: true,
        meals: true,
      },
    };

    await localDietStorage.saveSettings(settings);

    await expect(localDietStorage.getSettings()).resolves.toEqual(settings);
  });
});
