# Diet Web MVP Design

## Summary

Build a personal diet-tracking web app MVP with Vite and React. The app helps one user complete daily accountability tasks: upload a full-body photo, enter body weight, and report meals. The MVP stores data locally in the browser and uses in-app/browser reminders while the app is open.

Actual mobile push notifications, accounts, server storage, and coach/admin workflows are out of scope for this MVP.

## Goals

- Let the user see today's required tasks immediately.
- Let the user upload and review daily full-body photos.
- Let the user enter daily body weight.
- Let the user report breakfast, lunch, and dinner every day.
- Remind the user hourly during their configured reminder window when required tasks are incomplete.
- Keep storage local-first while isolating persistence code so a server database can be added later.

## Non-Goals

- Native iOS or Android app.
- Background push notifications when the web app is closed.
- Login, user accounts, cloud sync, or multi-device data.
- Coach/admin dashboard.
- Calorie estimation, macro tracking, or AI food analysis.

## Product Decisions

- Platform: web app MVP.
- Frontend stack: Vite + React.
- User type: personal use only.
- First screen: today's checklist.
- Storage: browser-local storage for MVP.
- Photo behavior: upload with preview and date-based history.
- Meal reporting: breakfast, lunch, and dinner are required; snack is optional.
- Reminder schedule: user-configurable start and end time, with hourly reminders.

## Screens

### Today

The Today screen is the first screen. It shows:

- Today's completion status.
- Required task checklist.
- Full-body photo upload control and preview.
- Body weight input.
- Meal inputs for breakfast, lunch, dinner, and optional snack.
- Reminder status when the day is incomplete.

The user should be able to complete the day from this screen without navigating elsewhere.

### History

The History screen shows past daily entries by date. It includes:

- Photo preview history.
- Body weight history.
- Meal report history.

The MVP can use a simple date list instead of charts. Charts can be added later after the core recording flow is stable.

### Settings

The Settings screen lets the user configure:

- Required daily tasks: photo, weight, meals.
- Reminder enabled or disabled.
- Reminder start time.
- Reminder end time.
- Reminder interval, fixed at 60 minutes in the MVP.

Settings must validate that the reminder time range is usable before saving.

## Data Model

### DailyEntry

```ts
type DailyEntry = {
  date: string; // YYYY-MM-DD
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
```

### UserSettings

```ts
type UserSettings = {
  requiredTasks: {
    photo: boolean;
    weight: boolean;
    meals: boolean;
  };
  reminder: {
    enabled: boolean;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    intervalMinutes: 60;
  };
};
```

## Completion Rules

Completion is calculated from the current date's `DailyEntry` and `UserSettings`.

- If photo is required, the day is incomplete until a full-body photo is uploaded.
- If weight is required, the day is incomplete until a valid body weight is saved.
- If meals are required, breakfast, lunch, and dinner must all be non-empty.
- If the user fasted for a meal, they must explicitly enter the fasted marker. In Korean UI this is the word with code points `U+ACF5 U+BCF5`.
- Snack is optional and does not affect completion.
- A disabled required task is excluded from completion checks.
- The day is complete only when every enabled required task is complete.

## Reminder Rules

The MVP reminder runs only while the app is open.

- If reminders are disabled, no reminder is shown.
- If the current time is outside the configured reminder window, no reminder is shown.
- If today is complete, no reminder is shown.
- If today is incomplete, show a reminder once every 60 minutes.
- Use the browser Notification API when permission is granted.
- Fall back to an in-app toast or banner when browser notification permission is unavailable, denied, or not requested.
- When the day becomes complete, stop reminders for that day.

## Storage Design

Persistence should sit behind a small storage module. React components should not directly know whether data comes from localStorage, IndexedDB, or a future API.

Recommended MVP split:

- Store structured entries and settings through a `storage` module.
- Store image blobs in IndexedDB.
- Store photo metadata on the matching `DailyEntry`.
- Keep all storage functions asynchronous so a future API-backed implementation can use the same call shape.

Example storage responsibilities:

- `getEntry(date)`
- `saveEntry(entry)`
- `listEntries()`
- `getSettings()`
- `saveSettings(settings)`
- `savePhoto(file)`
- `getPhoto(id)`

## Component and Module Boundaries

- `storage`: date-based entries, settings, and photo persistence.
- `completion`: pure functions for daily completion status.
- `reminder`: pure scheduling decisions plus browser/in-app notification integration.
- `TodayPage`: checklist and today's input workflow.
- `HistoryPage`: date-based record browsing.
- `SettingsPage`: required tasks and reminder settings.

The completion logic should remain independent from React so it can be tested directly.

## Validation and Error Handling

- Photo upload failure should not erase the existing saved entry.
- Body weight must be numeric and greater than zero.
- Breakfast, lunch, and dinner cannot be empty when meal reporting is required.
- The fasted marker with code points `U+ACF5 U+BCF5` is valid meal text.
- Snack can be empty.
- Invalid reminder time settings must be blocked before saving.
- Date changes should automatically move the Today screen to the new date's entry.

## Testing Plan

Focus tests on logic with the highest behavior risk:

- Completion tests for photo, weight, and meals.
- Meal completion test requiring breakfast, lunch, and dinner.
- Meal completion test allowing the fasted marker with code points `U+ACF5 U+BCF5`.
- Settings tests proving disabled required tasks are excluded.
- Reminder tests for enabled/disabled state, time window, completion state, and hourly interval.
- Storage tests proving entries stay separated by date.

## Implementation Sequence

1. Scaffold Vite + React app.
2. Add base app shell with Today, History, and Settings views.
3. Implement data types and default settings.
4. Implement local-first storage module.
5. Implement completion logic with tests.
6. Implement Today workflow.
7. Implement History view.
8. Implement Settings view.
9. Implement reminder logic and UI/browser notification fallback.
10. Run tests and visually verify the app in browser.
