import {
  type CompletionStatus,
  type CompletionTask,
  type DailyEntry,
  type TaskKey,
  type UserSettings,
} from "./types";

const TASK_LABELS: Record<TaskKey, string> = {
  photo: "전신 사진",
  weight: "몸무게",
  meals: "식단 보고",
};

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function getCompletionStatus(
  entry: DailyEntry,
  settings: UserSettings
): CompletionStatus {
  const weightKg = entry.weightKg;

  const completeByTask: Record<TaskKey, boolean> = {
    photo: Boolean(entry.photo?.id),
    weight:
      typeof weightKg === "number" &&
      Number.isFinite(weightKg) &&
      weightKg > 0,
    meals:
      hasText(entry.meals.breakfast) &&
      hasText(entry.meals.lunch) &&
      hasText(entry.meals.dinner),
  };

  const tasks: CompletionTask[] = (Object.keys(TASK_LABELS) as TaskKey[]).map(
    (key) => ({
      key,
      label: TASK_LABELS[key],
      required: settings.requiredTasks[key],
      complete: completeByTask[key],
    })
  );

  return {
    tasks,
    isComplete: tasks.every((task) => !task.required || task.complete),
  };
}
