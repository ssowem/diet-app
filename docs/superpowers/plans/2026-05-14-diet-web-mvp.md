# Diet Web MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first personal diet-tracking web MVP where the user completes daily photo, weight, and meal reporting tasks and receives hourly reminders while the app is open.

**Architecture:** Use a Vite + React + TypeScript single-page app. Keep business rules in pure modules (`completion`, `reminder`) and persistence behind an async `storage` module so browser-local storage can later be replaced by an API.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, IndexedDB, localStorage, CSS modules through plain CSS.

---

## File Structure

- Create: `package.json` - scripts and dependencies.
- Create: `index.html` - Vite HTML entry.
- Create: `tsconfig.json` - TypeScript compiler settings.
- Create: `tsconfig.node.json` - Vite config TypeScript settings.
- Create: `vite.config.ts` - Vite and Vitest config.
- Create: `.gitignore` - local build, dependency, and brainstorm artifacts.
- Create: `src/main.tsx` - React entry.
- Create: `src/App.tsx` - top-level app shell and tab state.
- Create: `src/styles.css` - full app styling.
- Create: `src/domain/types.ts` - shared domain types and default settings.
- Create: `src/domain/date.ts` - date and time helpers.
- Create: `src/domain/completion.ts` - pure completion rules.
- Create: `src/domain/reminder.ts` - pure reminder decision rules.
- Create: `src/storage/storage.ts` - async local-first storage facade.
- Create: `src/hooks/useTodayEntry.ts` - load and save today's entry/settings.
- Create: `src/components/TodayPage.tsx` - checklist and daily input workflow.
- Create: `src/components/HistoryPage.tsx` - date-based history list.
- Create: `src/components/SettingsPage.tsx` - required task and reminder settings.
- Create: `src/components/ReminderToast.tsx` - in-app reminder fallback.
- Create: `src/domain/completion.test.ts` - completion rule tests.
- Create: `src/domain/reminder.test.ts` - reminder rule tests.
- Create: `src/storage/storage.test.ts` - storage isolation tests.

## Task 1: Scaffold Vite React App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `.gitignore`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`

- [ ] **Step 1: Create project config**

Create `package.json`:

```json
{
  "name": "diet-app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.7",
    "typescript": "^5.7.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "jsdom": "^25.0.1",
    "vitest": "^2.1.8"
  }
}
```

Create `index.html`:

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Diet Check</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

Create `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: []
  }
});
```

Create `.gitignore`:

```gitignore
node_modules/
dist/
.vite/
.superpowers/
*.log
```

- [ ] **Step 2: Create minimal React entry**

Create `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Create `src/App.tsx`:

```tsx
import { useState } from "react";

type View = "today" | "history" | "settings";

export default function App() {
  const [view, setView] = useState<View>("today");

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Personal diet log</p>
          <h1>Diet Check</h1>
        </div>
        <nav className="tabs" aria-label="주요 화면">
          <button className={view === "today" ? "active" : ""} onClick={() => setView("today")}>오늘</button>
          <button className={view === "history" ? "active" : ""} onClick={() => setView("history")}>기록</button>
          <button className={view === "settings" ? "active" : ""} onClick={() => setView("settings")}>설정</button>
        </nav>
      </header>
      <main className="main-panel">
        {view === "today" && <p>오늘 화면 준비 중</p>}
        {view === "history" && <p>기록 화면 준비 중</p>}
        {view === "settings" && <p>설정 화면 준비 중</p>}
      </main>
    </div>
  );
}
```

Create `src/styles.css`:

```css
:root {
  color: #18201d;
  background: #f6f7f4;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button,
input,
textarea {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  padding: 24px;
}

.top-bar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  max-width: 1120px;
  margin: 0 auto 18px;
}

.eyebrow {
  margin: 0 0 4px;
  color: #617066;
  font-size: 0.82rem;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 0;
  font-size: 2rem;
}

.tabs {
  display: inline-flex;
  gap: 6px;
  padding: 4px;
  border: 1px solid #d6ded2;
  border-radius: 8px;
  background: #ffffff;
}

.tabs button {
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #455149;
  padding: 8px 12px;
  cursor: pointer;
}

.tabs button.active {
  background: #18201d;
  color: #ffffff;
}

.main-panel {
  max-width: 1120px;
  margin: 0 auto;
}

@media (max-width: 720px) {
  .app-shell {
    padding: 16px;
  }

  .top-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .tabs {
    width: 100%;
  }

  .tabs button {
    flex: 1;
  }
}
```

- [ ] **Step 3: Install dependencies**

Run:

```powershell
npm install
```

Expected: `node_modules` and `package-lock.json` are created without dependency resolution errors.

- [ ] **Step 4: Verify scaffold builds**

Run:

```powershell
npm run build
```

Expected: TypeScript completes and Vite writes `dist`.

## Task 2: Domain Types and Completion Logic

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/completion.ts`
- Create: `src/domain/completion.test.ts`

- [ ] **Step 1: Write failing completion tests**

Create `src/domain/completion.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { FASTED_MARKER, type DailyEntry, defaultSettings } from "./types";
import { getCompletionStatus } from "./completion";

const baseEntry: DailyEntry = {
  date: "2026-05-14",
  meals: {},
  updatedAt: "2026-05-14T00:00:00.000Z"
};

describe("getCompletionStatus", () => {
  it("requires photo, weight, breakfast, lunch, and dinner by default", () => {
    const status = getCompletionStatus(baseEntry, defaultSettings);

    expect(status.isComplete).toBe(false);
    expect(status.tasks).toEqual([
      { key: "photo", label: "전신 사진", required: true, complete: false },
      { key: "weight", label: "몸무게", required: true, complete: false },
      { key: "meals", label: "식단 보고", required: true, complete: false }
    ]);
  });

  it("marks the day complete when all default required tasks are present", () => {
    const status = getCompletionStatus(
      {
        ...baseEntry,
        photo: { id: "photo-1", previewUrl: "blob:photo-1", createdAt: "2026-05-14T01:00:00.000Z" },
        weightKg: 72.4,
        meals: {
          breakfast: "계란",
          lunch: "샐러드",
          dinner: "닭가슴살"
        }
      },
      defaultSettings
    );

    expect(status.isComplete).toBe(true);
    expect(status.tasks.every((task) => task.complete)).toBe(true);
  });

  it("allows the fasted marker for required meals", () => {
    const status = getCompletionStatus(
      {
        ...baseEntry,
        photo: { id: "photo-1", previewUrl: "blob:photo-1", createdAt: "2026-05-14T01:00:00.000Z" },
        weightKg: 72.4,
        meals: {
          breakfast: FASTED_MARKER,
          lunch: "샐러드",
          dinner: FASTED_MARKER
        }
      },
      defaultSettings
    );

    expect(status.isComplete).toBe(true);
  });

  it("does not count snack as required", () => {
    const status = getCompletionStatus(
      {
        ...baseEntry,
        photo: { id: "photo-1", previewUrl: "blob:photo-1", createdAt: "2026-05-14T01:00:00.000Z" },
        weightKg: 72.4,
        meals: {
          breakfast: "요거트",
          lunch: "샐러드",
          dinner: "두부"
        }
      },
      defaultSettings
    );

    expect(status.isComplete).toBe(true);
  });

  it("excludes disabled tasks from completion", () => {
    const status = getCompletionStatus(
      {
        ...baseEntry,
        meals: {
          breakfast: "요거트",
          lunch: "샐러드",
          dinner: "두부"
        }
      },
      {
        ...defaultSettings,
        requiredTasks: { photo: false, weight: false, meals: true }
      }
    );

    expect(status.isComplete).toBe(true);
    expect(status.tasks.find((task) => task.key === "photo")?.required).toBe(false);
  });
});
```

- [ ] **Step 2: Run completion tests to verify failure**

Run:

```powershell
npm test -- src/domain/completion.test.ts
```

Expected: FAIL because `src/domain/types.ts` and `src/domain/completion.ts` do not exist yet.

- [ ] **Step 3: Implement domain types**

Create `src/domain/types.ts`:

```ts
export const FASTED_MARKER = "공복";

export type TaskKey = "photo" | "weight" | "meals";

export type DailyEntry = {
  date: string;
  photo?: {
    id: string;
    previewUrl: string;
    createdAt: string;
  };
  weightKg?: number;
  meals: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snack?: string;
  };
  updatedAt: string;
};

export type UserSettings = {
  requiredTasks: Record<TaskKey, boolean>;
  reminder: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    intervalMinutes: 60;
  };
};

export type CompletionTask = {
  key: TaskKey;
  label: string;
  required: boolean;
  complete: boolean;
};

export type CompletionStatus = {
  isComplete: boolean;
  tasks: CompletionTask[];
};

export const defaultSettings: UserSettings = {
  requiredTasks: {
    photo: true,
    weight: true,
    meals: true
  },
  reminder: {
    enabled: true,
    startTime: "08:00",
    endTime: "23:00",
    intervalMinutes: 60
  }
};

export function createEmptyEntry(date: string): DailyEntry {
  return {
    date,
    meals: {},
    updatedAt: new Date().toISOString()
  };
}
```

- [ ] **Step 4: Implement completion logic**

Create `src/domain/completion.ts`:

```ts
import type { CompletionStatus, CompletionTask, DailyEntry, UserSettings } from "./types";

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function hasValidWeight(value: number | undefined): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function hasRequiredMeals(entry: DailyEntry): boolean {
  return hasText(entry.meals.breakfast) && hasText(entry.meals.lunch) && hasText(entry.meals.dinner);
}

export function getCompletionStatus(entry: DailyEntry, settings: UserSettings): CompletionStatus {
  const tasks: CompletionTask[] = [
    {
      key: "photo",
      label: "전신 사진",
      required: settings.requiredTasks.photo,
      complete: Boolean(entry.photo?.id)
    },
    {
      key: "weight",
      label: "몸무게",
      required: settings.requiredTasks.weight,
      complete: hasValidWeight(entry.weightKg)
    },
    {
      key: "meals",
      label: "식단 보고",
      required: settings.requiredTasks.meals,
      complete: hasRequiredMeals(entry)
    }
  ];

  return {
    tasks,
    isComplete: tasks.every((task) => !task.required || task.complete)
  };
}
```

- [ ] **Step 5: Run completion tests to verify pass**

Run:

```powershell
npm test -- src/domain/completion.test.ts
```

Expected: PASS.

## Task 3: Date and Reminder Logic

**Files:**
- Create: `src/domain/date.ts`
- Create: `src/domain/reminder.ts`
- Create: `src/domain/reminder.test.ts`

- [ ] **Step 1: Write failing reminder tests**

Create `src/domain/reminder.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { defaultSettings } from "./types";
import { shouldShowReminder } from "./reminder";

describe("shouldShowReminder", () => {
  it("does not remind when reminders are disabled", () => {
    expect(
      shouldShowReminder({
        now: new Date("2026-05-14T10:00:00"),
        lastReminderAt: undefined,
        isComplete: false,
        settings: { ...defaultSettings, reminder: { ...defaultSettings.reminder, enabled: false } }
      })
    ).toBe(false);
  });

  it("does not remind outside the configured window", () => {
    expect(
      shouldShowReminder({
        now: new Date("2026-05-14T07:59:00"),
        lastReminderAt: undefined,
        isComplete: false,
        settings: defaultSettings
      })
    ).toBe(false);
  });

  it("does not remind when today is complete", () => {
    expect(
      shouldShowReminder({
        now: new Date("2026-05-14T10:00:00"),
        lastReminderAt: undefined,
        isComplete: true,
        settings: defaultSettings
      })
    ).toBe(false);
  });

  it("reminds inside the window when incomplete and no previous reminder exists", () => {
    expect(
      shouldShowReminder({
        now: new Date("2026-05-14T10:00:00"),
        lastReminderAt: undefined,
        isComplete: false,
        settings: defaultSettings
      })
    ).toBe(true);
  });

  it("waits until 60 minutes pass before reminding again", () => {
    expect(
      shouldShowReminder({
        now: new Date("2026-05-14T10:30:00"),
        lastReminderAt: new Date("2026-05-14T10:00:00"),
        isComplete: false,
        settings: defaultSettings
      })
    ).toBe(false);

    expect(
      shouldShowReminder({
        now: new Date("2026-05-14T11:00:00"),
        lastReminderAt: new Date("2026-05-14T10:00:00"),
        isComplete: false,
        settings: defaultSettings
      })
    ).toBe(true);
  });
});
```

- [ ] **Step 2: Run reminder tests to verify failure**

Run:

```powershell
npm test -- src/domain/reminder.test.ts
```

Expected: FAIL because reminder helpers are missing.

- [ ] **Step 3: Implement date helpers**

Create `src/domain/date.ts`:

```ts
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function minutesFromMidnight(time: string): number {
  const [hour, minute] = time.split(":").map(Number);

  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error("Time must use HH:mm format");
  }

  return hour * 60 + minute;
}

export function currentMinutesFromMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}
```

- [ ] **Step 4: Implement reminder rules**

Create `src/domain/reminder.ts`:

```ts
import { currentMinutesFromMidnight, minutesFromMidnight } from "./date";
import type { UserSettings } from "./types";

type ReminderDecisionInput = {
  now: Date;
  lastReminderAt: Date | undefined;
  isComplete: boolean;
  settings: UserSettings;
};

function isInsideWindow(now: Date, startTime: string, endTime: string): boolean {
  const current = currentMinutesFromMidnight(now);
  const start = minutesFromMidnight(startTime);
  const end = minutesFromMidnight(endTime);

  if (start === end) {
    return false;
  }

  if (start < end) {
    return current >= start && current <= end;
  }

  return current >= start || current <= end;
}

export function shouldShowReminder(input: ReminderDecisionInput): boolean {
  if (!input.settings.reminder.enabled || input.isComplete) {
    return false;
  }

  if (!isInsideWindow(input.now, input.settings.reminder.startTime, input.settings.reminder.endTime)) {
    return false;
  }

  if (!input.lastReminderAt) {
    return true;
  }

  const elapsedMs = input.now.getTime() - input.lastReminderAt.getTime();
  const requiredMs = input.settings.reminder.intervalMinutes * 60 * 1000;
  return elapsedMs >= requiredMs;
}
```

- [ ] **Step 5: Run reminder tests to verify pass**

Run:

```powershell
npm test -- src/domain/reminder.test.ts
```

Expected: PASS.

## Task 4: Local Storage Module

**Files:**
- Create: `src/storage/storage.ts`
- Create: `src/storage/storage.test.ts`

- [ ] **Step 1: Write failing storage tests**

Create `src/storage/storage.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { defaultSettings, type DailyEntry } from "../domain/types";
import { localDietStorage } from "./storage";

describe("localDietStorage", () => {
  beforeEach(async () => {
    localStorage.clear();
    await localDietStorage.clearAll();
  });

  it("stores entries separately by date", async () => {
    const first: DailyEntry = {
      date: "2026-05-14",
      weightKg: 72,
      meals: {},
      updatedAt: "2026-05-14T00:00:00.000Z"
    };
    const second: DailyEntry = {
      date: "2026-05-15",
      weightKg: 71.5,
      meals: {},
      updatedAt: "2026-05-15T00:00:00.000Z"
    };

    await localDietStorage.saveEntry(first);
    await localDietStorage.saveEntry(second);

    await expect(localDietStorage.getEntry("2026-05-14")).resolves.toMatchObject({ weightKg: 72 });
    await expect(localDietStorage.getEntry("2026-05-15")).resolves.toMatchObject({ weightKg: 71.5 });
  });

  it("returns default settings before custom settings are saved", async () => {
    await expect(localDietStorage.getSettings()).resolves.toEqual(defaultSettings);
  });

  it("persists settings", async () => {
    await localDietStorage.saveSettings({
      ...defaultSettings,
      requiredTasks: { photo: false, weight: true, meals: true }
    });

    await expect(localDietStorage.getSettings()).resolves.toMatchObject({
      requiredTasks: { photo: false, weight: true, meals: true }
    });
  });
});
```

- [ ] **Step 2: Run storage tests to verify failure**

Run:

```powershell
npm test -- src/storage/storage.test.ts
```

Expected: FAIL because `src/storage/storage.ts` does not exist yet.

- [ ] **Step 3: Implement async storage facade**

Create `src/storage/storage.ts`:

```ts
import { defaultSettings, type DailyEntry, type UserSettings } from "../domain/types";

const ENTRIES_KEY = "diet-app:entries";
const SETTINGS_KEY = "diet-app:settings";

type EntryMap = Record<string, DailyEntry>;

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

async function openImageDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("diet-app-images", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("photos")) {
        db.createObjectStore("photos");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putPhoto(id: string, file: Blob): Promise<void> {
  const db = await openImageDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction("photos", "readwrite");
    transaction.objectStore("photos").put(file, id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

async function getStoredPhoto(id: string): Promise<Blob | undefined> {
  const db = await openImageDb();
  const result = await new Promise<Blob | undefined>((resolve, reject) => {
    const transaction = db.transaction("photos", "readonly");
    const request = transaction.objectStore("photos").get(id);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return result;
}

export const localDietStorage = {
  async getEntry(date: string): Promise<DailyEntry | undefined> {
    const entries = readJson<EntryMap>(ENTRIES_KEY, {});
    return entries[date];
  },

  async saveEntry(entry: DailyEntry): Promise<void> {
    const entries = readJson<EntryMap>(ENTRIES_KEY, {});
    entries[entry.date] = entry;
    writeJson(ENTRIES_KEY, entries);
  },

  async listEntries(): Promise<DailyEntry[]> {
    const entries = readJson<EntryMap>(ENTRIES_KEY, {});
    return Object.values(entries).sort((a, b) => b.date.localeCompare(a.date));
  },

  async getSettings(): Promise<UserSettings> {
    return readJson<UserSettings>(SETTINGS_KEY, defaultSettings);
  },

  async saveSettings(settings: UserSettings): Promise<void> {
    writeJson(SETTINGS_KEY, settings);
  },

  async savePhoto(file: Blob): Promise<{ id: string; previewUrl: string; createdAt: string }> {
    const id = crypto.randomUUID();
    await putPhoto(id, file);
    return {
      id,
      previewUrl: URL.createObjectURL(file),
      createdAt: new Date().toISOString()
    };
  },

  async getPhoto(id: string): Promise<Blob | undefined> {
    return getStoredPhoto(id);
  },

  async clearAll(): Promise<void> {
    localStorage.removeItem(ENTRIES_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  }
};
```

- [ ] **Step 4: Run storage tests to verify pass**

Run:

```powershell
npm test -- src/storage/storage.test.ts
```

Expected: PASS.

## Task 5: Today State Hook

**Files:**
- Create: `src/hooks/useTodayEntry.ts`

- [ ] **Step 1: Implement hook**

Create `src/hooks/useTodayEntry.ts`:

```ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { getCompletionStatus } from "../domain/completion";
import { toDateKey } from "../domain/date";
import { createEmptyEntry, defaultSettings, type DailyEntry, type UserSettings } from "../domain/types";
import { localDietStorage } from "../storage/storage";

export function useTodayEntry(now = new Date()) {
  const todayKey = toDateKey(now);
  const [entry, setEntry] = useState<DailyEntry>(() => createEmptyEntry(todayKey));
  const [settings, setSettingsState] = useState<UserSettings>(defaultSettings);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [savedEntry, savedSettings, savedEntries] = await Promise.all([
      localDietStorage.getEntry(todayKey),
      localDietStorage.getSettings(),
      localDietStorage.listEntries()
    ]);
    setEntry(savedEntry ?? createEmptyEntry(todayKey));
    setSettingsState(savedSettings);
    setEntries(savedEntries);
    setLoading(false);
  }, [todayKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveEntry = useCallback(async (nextEntry: DailyEntry) => {
    const stamped = { ...nextEntry, updatedAt: new Date().toISOString() };
    await localDietStorage.saveEntry(stamped);
    setEntry(stamped);
    setEntries(await localDietStorage.listEntries());
  }, []);

  const saveSettings = useCallback(async (nextSettings: UserSettings) => {
    await localDietStorage.saveSettings(nextSettings);
    setSettingsState(nextSettings);
  }, []);

  const completion = useMemo(() => getCompletionStatus(entry, settings), [entry, settings]);

  return {
    todayKey,
    entry,
    entries,
    settings,
    completion,
    loading,
    refresh,
    saveEntry,
    saveSettings
  };
}
```

- [ ] **Step 2: Run TypeScript build**

Run:

```powershell
npm run build
```

Expected: PASS.

## Task 6: Today Page

**Files:**
- Create: `src/components/TodayPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Implement Today page**

Create `src/components/TodayPage.tsx`:

```tsx
import { Camera, CheckCircle2, Circle, Scale, Utensils } from "lucide-react";
import { FASTED_MARKER, type DailyEntry } from "../domain/types";
import { localDietStorage } from "../storage/storage";
import type { CompletionStatus } from "../domain/types";

type TodayPageProps = {
  entry: DailyEntry;
  completion: CompletionStatus;
  onSave: (entry: DailyEntry) => Promise<void>;
};

export function TodayPage({ entry, completion, onSave }: TodayPageProps) {
  async function handlePhoto(file: File | undefined) {
    if (!file) {
      return;
    }
    const photo = await localDietStorage.savePhoto(file);
    await onSave({ ...entry, photo });
  }

  function updateMeal(key: keyof DailyEntry["meals"], value: string) {
    void onSave({
      ...entry,
      meals: {
        ...entry.meals,
        [key]: value
      }
    });
  }

  const taskIcon = {
    photo: Camera,
    weight: Scale,
    meals: Utensils
  };

  return (
    <section className="today-grid">
      <div className="status-panel">
        <div>
          <p className="eyebrow">{entry.date}</p>
          <h2>{completion.isComplete ? "오늘 완료" : "오늘 미완료"}</h2>
        </div>
        <div className="task-list">
          {completion.tasks.map((task) => {
            const Icon = taskIcon[task.key];
            return (
              <div className="task-row" key={task.key}>
                <Icon size={18} aria-hidden />
                <span>{task.label}</span>
                <span className="task-state">
                  {task.complete || !task.required ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  {!task.required ? "선택" : task.complete ? "완료" : "필수"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="input-panel">
        <section className="form-section">
          <h3>전신 사진</h3>
          {entry.photo?.previewUrl ? <img className="photo-preview" src={entry.photo.previewUrl} alt="오늘 전신 사진" /> : null}
          <input type="file" accept="image/*" onChange={(event) => void handlePhoto(event.target.files?.[0])} />
        </section>

        <section className="form-section">
          <h3>몸무게</h3>
          <label>
            <span>kg</span>
            <input
              type="number"
              min="1"
              step="0.1"
              value={entry.weightKg ?? ""}
              onChange={(event) => {
                const value = Number(event.target.value);
                void onSave({ ...entry, weightKg: Number.isFinite(value) && value > 0 ? value : undefined });
              }}
            />
          </label>
        </section>

        <section className="form-section">
          <div className="section-heading">
            <h3>식단 보고</h3>
            <span>공복이면 {FASTED_MARKER} 입력</span>
          </div>
          <label>
            <span>아침</span>
            <textarea value={entry.meals.breakfast ?? ""} onChange={(event) => updateMeal("breakfast", event.target.value)} />
          </label>
          <label>
            <span>점심</span>
            <textarea value={entry.meals.lunch ?? ""} onChange={(event) => updateMeal("lunch", event.target.value)} />
          </label>
          <label>
            <span>저녁</span>
            <textarea value={entry.meals.dinner ?? ""} onChange={(event) => updateMeal("dinner", event.target.value)} />
          </label>
          <label>
            <span>간식</span>
            <textarea value={entry.meals.snack ?? ""} onChange={(event) => updateMeal("snack", event.target.value)} />
          </label>
        </section>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire Today page into App**

Replace `src/App.tsx`:

```tsx
import { useState } from "react";
import { HistoryPage } from "./components/HistoryPage";
import { SettingsPage } from "./components/SettingsPage";
import { TodayPage } from "./components/TodayPage";
import { ReminderToast } from "./components/ReminderToast";
import { useTodayEntry } from "./hooks/useTodayEntry";

type View = "today" | "history" | "settings";

export default function App() {
  const [view, setView] = useState<View>("today");
  const { entry, entries, settings, completion, loading, saveEntry, saveSettings } = useTodayEntry();

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Personal diet log</p>
          <h1>Diet Check</h1>
        </div>
        <nav className="tabs" aria-label="주요 화면">
          <button className={view === "today" ? "active" : ""} onClick={() => setView("today")}>오늘</button>
          <button className={view === "history" ? "active" : ""} onClick={() => setView("history")}>기록</button>
          <button className={view === "settings" ? "active" : ""} onClick={() => setView("settings")}>설정</button>
        </nav>
      </header>
      <main className="main-panel">
        {loading ? <p>불러오는 중...</p> : null}
        {!loading && view === "today" && <TodayPage entry={entry} completion={completion} onSave={saveEntry} />}
        {!loading && view === "history" && <HistoryPage entries={entries} />}
        {!loading && view === "settings" && <SettingsPage settings={settings} onSave={saveSettings} />}
      </main>
      {!loading && <ReminderToast isComplete={completion.isComplete} settings={settings} />}
    </div>
  );
}
```

- [ ] **Step 3: Add Today page styles**

Append to `src/styles.css`:

```css
.today-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 18px;
}

.status-panel,
.input-panel,
.history-list,
.settings-panel {
  border: 1px solid #d6ded2;
  border-radius: 8px;
  background: #ffffff;
  padding: 18px;
}

.task-list {
  display: grid;
  gap: 10px;
}

.task-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  border: 1px solid #e4e9e1;
  border-radius: 8px;
  padding: 12px;
}

.task-state {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #52645a;
}

.input-panel {
  display: grid;
  gap: 16px;
}

.form-section {
  display: grid;
  gap: 10px;
}

.section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.section-heading span {
  color: #617066;
  font-size: 0.9rem;
}

label {
  display: grid;
  gap: 6px;
}

input,
textarea {
  width: 100%;
  border: 1px solid #cfd8cb;
  border-radius: 8px;
  padding: 10px;
  background: #ffffff;
  color: #18201d;
}

textarea {
  min-height: 70px;
  resize: vertical;
}

.photo-preview {
  width: min(100%, 320px);
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #d6ded2;
}

@media (max-width: 840px) {
  .today-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Build to reveal missing component errors**

Run:

```powershell
npm run build
```

Expected: FAIL because `HistoryPage`, `SettingsPage`, and `ReminderToast` are not implemented yet. Continue to the next tasks.

## Task 7: History Page

**Files:**
- Create: `src/components/HistoryPage.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Implement History page**

Create `src/components/HistoryPage.tsx`:

```tsx
import type { DailyEntry } from "../domain/types";

type HistoryPageProps = {
  entries: DailyEntry[];
};

export function HistoryPage({ entries }: HistoryPageProps) {
  return (
    <section className="history-list">
      <h2>기록</h2>
      {entries.length === 0 ? <p className="muted">아직 저장된 기록이 없습니다.</p> : null}
      <div className="entry-list">
        {entries.map((entry) => (
          <article className="entry-card" key={entry.date}>
            <div>
              <h3>{entry.date}</h3>
              <p>{entry.weightKg ? `${entry.weightKg}kg` : "몸무게 미입력"}</p>
            </div>
            {entry.photo?.previewUrl ? <img src={entry.photo.previewUrl} alt={`${entry.date} 전신 사진`} /> : <div className="photo-empty">사진 없음</div>}
            <dl className="meal-summary">
              <div><dt>아침</dt><dd>{entry.meals.breakfast || "-"}</dd></div>
              <div><dt>점심</dt><dd>{entry.meals.lunch || "-"}</dd></div>
              <div><dt>저녁</dt><dd>{entry.meals.dinner || "-"}</dd></div>
              <div><dt>간식</dt><dd>{entry.meals.snack || "-"}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add History styles**

Append to `src/styles.css`:

```css
.muted {
  color: #617066;
}

.entry-list {
  display: grid;
  gap: 12px;
}

.entry-card {
  display: grid;
  grid-template-columns: 160px 120px 1fr;
  gap: 14px;
  align-items: start;
  border-top: 1px solid #e4e9e1;
  padding-top: 14px;
}

.entry-card img,
.photo-empty {
  width: 120px;
  aspect-ratio: 3 / 4;
  border-radius: 8px;
  object-fit: cover;
}

.photo-empty {
  display: grid;
  place-items: center;
  border: 1px dashed #cfd8cb;
  color: #617066;
  font-size: 0.9rem;
}

.meal-summary {
  display: grid;
  gap: 8px;
  margin: 0;
}

.meal-summary div {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 8px;
}

.meal-summary dt {
  color: #617066;
}

.meal-summary dd {
  margin: 0;
}

@media (max-width: 720px) {
  .entry-card {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Build to reveal remaining missing components**

Run:

```powershell
npm run build
```

Expected: FAIL only because `SettingsPage` and `ReminderToast` are not implemented yet.

## Task 8: Settings Page

**Files:**
- Create: `src/components/SettingsPage.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Implement Settings page**

Create `src/components/SettingsPage.tsx`:

```tsx
import { useState } from "react";
import { minutesFromMidnight } from "../domain/date";
import type { TaskKey, UserSettings } from "../domain/types";

type SettingsPageProps = {
  settings: UserSettings;
  onSave: (settings: UserSettings) => Promise<void>;
};

const taskLabels: Record<TaskKey, string> = {
  photo: "전신 사진",
  weight: "몸무게",
  meals: "식단 보고"
};

export function SettingsPage({ settings, onSave }: SettingsPageProps) {
  const [draft, setDraft] = useState(settings);
  const [message, setMessage] = useState("");

  async function save() {
    if (minutesFromMidnight(draft.reminder.startTime) === minutesFromMidnight(draft.reminder.endTime)) {
      setMessage("리마인더 시작/종료 시간은 달라야 합니다.");
      return;
    }

    await onSave(draft);
    setMessage("설정을 저장했습니다.");
  }

  return (
    <section className="settings-panel">
      <h2>설정</h2>
      <div className="settings-group">
        <h3>매일 필수 항목</h3>
        {(Object.keys(taskLabels) as TaskKey[]).map((key) => (
          <label className="check-row" key={key}>
            <input
              type="checkbox"
              checked={draft.requiredTasks[key]}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  requiredTasks: { ...draft.requiredTasks, [key]: event.target.checked }
                })
              }
            />
            <span>{taskLabels[key]}</span>
          </label>
        ))}
      </div>

      <div className="settings-group">
        <h3>리마인더</h3>
        <label className="check-row">
          <input
            type="checkbox"
            checked={draft.reminder.enabled}
            onChange={(event) =>
              setDraft({
                ...draft,
                reminder: { ...draft.reminder, enabled: event.target.checked }
              })
            }
          />
          <span>미완료 시 알림</span>
        </label>
        <div className="time-grid">
          <label>
            <span>시작</span>
            <input
              type="time"
              value={draft.reminder.startTime}
              onChange={(event) =>
                setDraft({ ...draft, reminder: { ...draft.reminder, startTime: event.target.value } })
              }
            />
          </label>
          <label>
            <span>종료</span>
            <input
              type="time"
              value={draft.reminder.endTime}
              onChange={(event) =>
                setDraft({ ...draft, reminder: { ...draft.reminder, endTime: event.target.value } })
              }
            />
          </label>
        </div>
        <p className="muted">미완료 상태면 설정한 시간대 안에서 1시간마다 알려줍니다.</p>
      </div>

      <button className="primary-action" onClick={() => void save()}>설정 저장</button>
      {message ? <p className="muted">{message}</p> : null}
    </section>
  );
}
```

- [ ] **Step 2: Add Settings styles**

Append to `src/styles.css`:

```css
.settings-panel {
  display: grid;
  gap: 18px;
}

.settings-group {
  display: grid;
  gap: 10px;
  border-top: 1px solid #e4e9e1;
  padding-top: 14px;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.check-row input {
  width: auto;
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 180px));
  gap: 12px;
}

.primary-action {
  justify-self: start;
  border: 0;
  border-radius: 8px;
  background: #2f6f4e;
  color: #ffffff;
  padding: 10px 14px;
  cursor: pointer;
}

@media (max-width: 520px) {
  .time-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Build to reveal remaining missing component**

Run:

```powershell
npm run build
```

Expected: FAIL only because `ReminderToast` is not implemented yet.

## Task 9: Reminder UI and Browser Notification Fallback

**Files:**
- Create: `src/components/ReminderToast.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Implement ReminderToast**

Create `src/components/ReminderToast.tsx`:

```tsx
import { useEffect, useState } from "react";
import { shouldShowReminder } from "../domain/reminder";
import type { UserSettings } from "../domain/types";

type ReminderToastProps = {
  isComplete: boolean;
  settings: UserSettings;
};

export function ReminderToast({ isComplete, settings }: ReminderToastProps) {
  const [lastReminderAt, setLastReminderAt] = useState<Date>();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const tick = async () => {
      const now = new Date();
      if (!shouldShowReminder({ now, lastReminderAt, isComplete, settings })) {
        return;
      }

      setLastReminderAt(now);

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Diet Check", {
          body: "오늘 필수 기록이 아직 완료되지 않았습니다."
        });
        return;
      }

      setVisible(true);
    };

    void tick();
    const id = window.setInterval(() => void tick(), 60_000);
    return () => window.clearInterval(id);
  }, [isComplete, lastReminderAt, settings]);

  async function requestPermission() {
    if (!("Notification" in window)) {
      setVisible(true);
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setVisible(true);
    }
  }

  if (isComplete || !settings.reminder.enabled) {
    return null;
  }

  return (
    <div className={`reminder-toast ${visible ? "show" : ""}`}>
      <div>
        <strong>오늘 기록이 아직 미완료입니다.</strong>
        <p>전신 사진, 몸무게, 식단 보고를 확인하세요.</p>
      </div>
      <div className="toast-actions">
        <button onClick={() => void requestPermission()}>브라우저 알림 허용</button>
        <button onClick={() => setVisible(false)}>닫기</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add Reminder styles**

Append to `src/styles.css`:

```css
.reminder-toast {
  position: fixed;
  right: 18px;
  bottom: 18px;
  display: none;
  max-width: 360px;
  border: 1px solid #d5b978;
  border-radius: 8px;
  background: #fff8e5;
  color: #302410;
  padding: 14px;
  box-shadow: 0 16px 36px rgba(24, 32, 29, 0.16);
}

.reminder-toast.show {
  display: grid;
  gap: 10px;
}

.reminder-toast p {
  margin-bottom: 0;
}

.toast-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.toast-actions button {
  border: 1px solid #d5b978;
  border-radius: 8px;
  background: #ffffff;
  color: #302410;
  padding: 8px 10px;
  cursor: pointer;
}

@media (max-width: 520px) {
  .reminder-toast {
    left: 12px;
    right: 12px;
    bottom: 12px;
  }
}
```

- [ ] **Step 3: Run full test suite**

Run:

```powershell
npm test
```

Expected: PASS.

- [ ] **Step 4: Run production build**

Run:

```powershell
npm run build
```

Expected: PASS.

## Task 10: Visual Verification and Polish

**Files:**
- Modify: `src/styles.css`
- Modify only components that have verified layout or text issues.

- [ ] **Step 1: Start dev server**

Run:

```powershell
npm run dev
```

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 2: Open app in browser**

Open the Vite URL in the in-app browser.

Expected: the Today screen loads without console errors.

- [ ] **Step 3: Verify core flow manually**

Perform these checks:

- Today tab shows incomplete status on first load.
- Enter a valid weight.
- Enter breakfast, lunch, and dinner.
- Leave snack empty.
- Upload a test image.
- Today status changes to complete.
- History tab shows the saved date, weight, meals, and photo preview.
- Settings tab can disable a required task and save.
- Reminder toast is not visible when the day is complete.

- [ ] **Step 4: Fix any verified visual issues**

If text overlaps, buttons wrap badly, or mobile layout breaks, modify `src/styles.css` only for the observed issue. Re-run `npm run build` after fixes.

- [ ] **Step 5: Final verification**

Run:

```powershell
npm test
npm run build
```

Expected: both commands PASS.
