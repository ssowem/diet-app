import { DailyEntry, defaultSettings, UserSettings } from "../domain/types";

const ENTRIES_KEY = "diet-app:entries";
const SETTINGS_KEY = "diet-app:settings";
const IMAGE_DB_NAME = "diet-app-images";
const IMAGE_DB_VERSION = 1;
const PHOTO_STORE_NAME = "photos";

function readJson<T>(key: string, fallback: T): T {
  const rawValue = localStorage.getItem(key);

  if (rawValue === null) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function openImageDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IMAGE_DB_NAME, IMAGE_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(PHOTO_STORE_NAME)) {
        db.createObjectStore(PHOTO_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putPhoto(id: string, file: Blob): Promise<void> {
  const db = await openImageDb();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(PHOTO_STORE_NAME, "readwrite");
    const store = transaction.objectStore(PHOTO_STORE_NAME);

    store.put(file, id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });

  db.close();
}

async function getStoredPhoto(id: string): Promise<Blob | undefined> {
  const db = await openImageDb();

  const photo = await new Promise<Blob | undefined>((resolve, reject) => {
    const transaction = db.transaction(PHOTO_STORE_NAME, "readonly");
    const store = transaction.objectStore(PHOTO_STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });

  db.close();
  return photo;
}

export const localDietStorage = {
  async getEntry(date: string): Promise<DailyEntry | undefined> {
    const entries = readJson<Record<string, DailyEntry>>(ENTRIES_KEY, {});

    return entries[date];
  },

  async saveEntry(entry: DailyEntry): Promise<void> {
    const entries = readJson<Record<string, DailyEntry>>(ENTRIES_KEY, {});

    writeJson(ENTRIES_KEY, {
      ...entries,
      [entry.date]: entry,
    });
  },

  async listEntries(): Promise<DailyEntry[]> {
    const entries = readJson<Record<string, DailyEntry>>(ENTRIES_KEY, {});

    return Object.values(entries).sort((firstEntry, secondEntry) =>
      secondEntry.date.localeCompare(firstEntry.date),
    );
  },

  async getSettings(): Promise<UserSettings> {
    return readJson<UserSettings>(SETTINGS_KEY, defaultSettings);
  },

  async saveSettings(settings: UserSettings): Promise<void> {
    writeJson(SETTINGS_KEY, settings);
  },

  async savePhoto(
    file: Blob,
  ): Promise<{ id: string; previewUrl: string; createdAt: string }> {
    const id = crypto.randomUUID();

    await putPhoto(id, file);

    return {
      id,
      previewUrl: URL.createObjectURL(file),
      createdAt: new Date().toISOString(),
    };
  },

  async getPhoto(id: string): Promise<Blob | undefined> {
    return getStoredPhoto(id);
  },

  async clearAll(): Promise<void> {
    localStorage.removeItem(ENTRIES_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  },
};
