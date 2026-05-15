import { beforeEach, describe, expect, test, vi } from "vitest";
import { DailyEntry, defaultSettings, UserSettings } from "../domain/types";
import { localDietStorage } from "./storage";

describe("localDietStorage", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localDietStorage.setProfile("local");
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

  test("separates entries and settings by active profile", async () => {
    const firstEntry: DailyEntry = {
      date: "2026-05-14",
      weightKg: 72,
      meals: {},
      updatedAt: "2026-05-14T00:00:00.000Z",
    };
    const secondEntry: DailyEntry = {
      date: "2026-05-14",
      weightKg: 64,
      meals: {},
      updatedAt: "2026-05-14T00:00:00.000Z",
    };
    const firstSettings: UserSettings = {
      ...defaultSettings,
      requiredTasks: {
        photo: false,
        weight: true,
        meals: true,
      },
    };

    localDietStorage.setProfile("user-first");
    await localDietStorage.saveEntry(firstEntry);
    await localDietStorage.saveSettings(firstSettings);

    localDietStorage.setProfile("user-second");
    await localDietStorage.saveEntry(secondEntry);

    await expect(localDietStorage.getEntry("2026-05-14")).resolves.toMatchObject({
      weightKg: 64,
    });
    await expect(localDietStorage.getSettings()).resolves.toEqual(defaultSettings);

    localDietStorage.setProfile("user-first");

    await expect(localDietStorage.getEntry("2026-05-14")).resolves.toMatchObject({
      weightKg: 72,
    });
    await expect(localDietStorage.getSettings()).resolves.toEqual(firstSettings);
  });

  test("rehydrates stored photo previews when entries are loaded", async () => {
    const photoBlob = new Blob(["photo"]);
    const createdAt = "2026-05-14T00:00:00.000Z";
    const entry: DailyEntry = {
      date: "2026-05-14",
      meals: {},
      photo: {
        id: "photo-1",
        previewUrl: "blob:stale-preview",
        createdAt,
      },
      updatedAt: createdAt,
    };
    const createObjectURL = vi.fn(() => "blob:fresh-preview");

    localStorage.setItem("diet-app:entries", JSON.stringify({ [entry.date]: entry }));
    vi.stubGlobal("URL", { ...URL, createObjectURL });
    vi.stubGlobal(
      "indexedDB",
      createIndexedDbWithPhotos(new Map([["photo-1", photoBlob]])),
    );

    await expect(localDietStorage.getEntry("2026-05-14")).resolves.toMatchObject({
      photo: {
        id: "photo-1",
        previewUrl: "blob:fresh-preview",
        createdAt,
      },
    });
    await expect(localDietStorage.listEntries()).resolves.toMatchObject([
      {
        photo: {
          id: "photo-1",
          previewUrl: "blob:fresh-preview",
          createdAt,
        },
      },
    ]);
    expect(createObjectURL).toHaveBeenCalledWith(photoBlob);
  });

  test("keeps existing photo metadata when photo rehydration fails", async () => {
    const createdAt = "2026-05-14T00:00:00.000Z";
    const entry: DailyEntry = {
      date: "2026-05-14",
      meals: {},
      photo: {
        id: "photo-1",
        previewUrl: "blob:stale-preview",
        createdAt,
      },
      updatedAt: createdAt,
    };

    localStorage.setItem("diet-app:entries", JSON.stringify({ [entry.date]: entry }));
    vi.stubGlobal("indexedDB", {
      open: () => {
        throw new Error("IndexedDB unavailable");
      },
    });

    await expect(localDietStorage.getEntry("2026-05-14")).resolves.toEqual(entry);
  });
});

function createIndexedDbWithPhotos(photos: Map<string, Blob>): IDBFactory {
  const db = {
    objectStoreNames: {
      contains: () => true,
    },
    createObjectStore: vi.fn(),
    transaction: () => ({
      objectStore: () => ({
        get: (id: string) => {
          const request: {
            result?: Blob;
            onsuccess?: (event: Event) => void;
          } = {};

          queueMicrotask(() => {
            request.result = photos.get(id);
            request.onsuccess?.(new Event("success"));
          });

          return request;
        },
      }),
    }),
    close: vi.fn(),
  };

  return {
    open: () => {
      const request: {
        result: IDBDatabase;
        onsuccess?: (event: Event) => void;
      } = {
        result: db as unknown as IDBDatabase,
      };

      queueMicrotask(() => {
        request.onsuccess?.(new Event("success"));
      });

      return request;
    },
  } as unknown as IDBFactory;
}
