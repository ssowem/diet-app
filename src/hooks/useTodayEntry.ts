import { useCallback, useEffect, useMemo, useState } from "react";
import { getCompletionStatus } from "../domain/completion";
import { toDateKey } from "../domain/date";
import {
  createEmptyEntry,
  DailyEntry,
  defaultSettings,
  UserSettings,
} from "../domain/types";
import { localDietStorage } from "../storage/storage";

export function useTodayEntry(now = new Date()) {
  const todayKey = toDateKey(now);
  const [entry, setEntry] = useState<DailyEntry>(createEmptyEntry(todayKey));
  const [settings, setSettingsState] = useState<UserSettings>(defaultSettings);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    const [savedEntry, savedSettings, savedEntries] = await Promise.all([
      localDietStorage.getEntry(todayKey),
      localDietStorage.getSettings(),
      localDietStorage.listEntries(),
    ]);

    setEntry(savedEntry ?? createEmptyEntry(todayKey));
    setSettingsState(savedSettings);
    setEntries(savedEntries);
    setLoading(false);
  }, [todayKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveEntry = useCallback(async (entryToSave: DailyEntry) => {
    const stamped = {
      ...entryToSave,
      updatedAt: new Date().toISOString(),
    };

    await localDietStorage.saveEntry(stamped);
    setEntry(stamped);
    setEntries(await localDietStorage.listEntries());
  }, []);

  const saveSettings = useCallback(async (settingsToSave: UserSettings) => {
    await localDietStorage.saveSettings(settingsToSave);
    setSettingsState(settingsToSave);
  }, []);

  const completion = useMemo(
    () => getCompletionStatus(entry, settings),
    [entry, settings],
  );

  return {
    todayKey,
    entry,
    entries,
    settings,
    completion,
    loading,
    refresh,
    saveEntry,
    saveSettings,
  };
}
