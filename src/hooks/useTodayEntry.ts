import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const requestIdRef = useRef(0);
  const [entry, setEntry] = useState<DailyEntry>(() =>
    createEmptyEntry(todayKey),
  );
  const [settings, setSettingsState] = useState<UserSettings>(defaultSettings);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>();

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setLoading(true);

    try {
      const [savedEntry, savedSettings, savedEntries] = await Promise.all([
        localDietStorage.getEntry(todayKey),
        localDietStorage.getSettings(),
        localDietStorage.listEntries(),
      ]);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setEntry(savedEntry ?? createEmptyEntry(todayKey));
      setSettingsState(savedSettings);
      setEntries(savedEntries);
      setError(undefined);
    } catch (caughtError) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setEntry(createEmptyEntry(todayKey));
      setSettingsState(defaultSettings);
      setEntries([]);
      setError(caughtError);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [todayKey]);

  useEffect(() => {
    void refresh();

    return () => {
      requestIdRef.current += 1;
    };
  }, [refresh]);

  const saveEntry = useCallback(async (entryToSave: DailyEntry) => {
    const requestId = ++requestIdRef.current;
    const stamped = {
      ...entryToSave,
      updatedAt: new Date().toISOString(),
    };

    try {
      await localDietStorage.saveEntry(stamped);
      const savedEntries = await localDietStorage.listEntries();

      if (requestId !== requestIdRef.current) {
        return;
      }

      setEntry(stamped);
      setEntries(savedEntries);
      setError(undefined);
    } catch (caughtError) {
      if (requestId === requestIdRef.current) {
        setError(caughtError);
      }

      throw caughtError;
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const saveSettings = useCallback(async (settingsToSave: UserSettings) => {
    const requestId = ++requestIdRef.current;

    try {
      await localDietStorage.saveSettings(settingsToSave);
      if (requestId !== requestIdRef.current) {
        return;
      }

      setSettingsState(settingsToSave);
      setError(undefined);
    } catch (caughtError) {
      if (requestId === requestIdRef.current) {
        setError(caughtError);
      }

      throw caughtError;
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
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
    error,
    refresh,
    saveEntry,
    saveSettings,
  };
}
