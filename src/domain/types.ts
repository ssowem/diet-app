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
  tasks: CompletionTask[];
  isComplete: boolean;
};

export const defaultSettings: UserSettings = {
  requiredTasks: {
    photo: true,
    weight: true,
    meals: true,
  },
  reminder: {
    enabled: true,
    startTime: "08:00",
    endTime: "23:00",
    intervalMinutes: 60,
  },
};

export function createEmptyEntry(date: string): DailyEntry {
  return {
    date,
    meals: {},
    updatedAt: new Date().toISOString(),
  };
}
