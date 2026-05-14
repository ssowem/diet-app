import {
  Camera,
  CheckCircle2,
  Circle,
  Scale,
  Utensils,
} from "lucide-react";
import { ChangeEvent, FocusEvent, useEffect, useRef, useState } from "react";
import {
  FASTED_MARKER,
  type CompletionStatus,
  type DailyEntry,
  type TaskKey,
} from "../domain/types";
import { localDietStorage } from "../storage/storage";

type TodayPageProps = {
  entry: DailyEntry;
  completion: CompletionStatus;
  onSave: (entry: DailyEntry) => Promise<void>;
};

const taskLabels: Record<TaskKey, string> = {
  photo: "전신 사진",
  weight: "몸무게",
  meals: "식단 보고",
};

const mealLabels: Array<{
  key: keyof DailyEntry["meals"];
  label: string;
}> = [
  { key: "breakfast", label: "아침" },
  { key: "lunch", label: "점심" },
  { key: "dinner", label: "저녁" },
  { key: "snack", label: "간식" },
];

function formatWeightInput(weightKg: number | undefined): string {
  return typeof weightKg === "number" ? String(weightKg) : "";
}

function parseWeightInput(value: string): number | undefined {
  const parsedWeight = Number(value.trim());

  return value.trim() !== "" && Number.isFinite(parsedWeight) && parsedWeight > 0
    ? parsedWeight
    : undefined;
}

export function TodayPage({ entry, completion, onSave }: TodayPageProps) {
  const [draftEntry, setDraftEntry] = useState(entry);
  const draftEntryRef = useRef(entry);
  const pendingSavesRef = useRef(0);
  const [weightValue, setWeightValue] = useState(formatWeightInput(entry.weightKg));
  const [meals, setMeals] = useState(entry.meals);
  const [uploadError, setUploadError] = useState("");
  const [saveError, setSaveError] = useState("");

  function syncInputsFromEntry(nextEntry: DailyEntry) {
    setWeightValue(formatWeightInput(nextEntry.weightKg));
    setMeals(nextEntry.meals);
  }

  useEffect(() => {
    if (
      draftEntryRef.current.date === entry.date &&
      pendingSavesRef.current > 0
    ) {
      return;
    }

    draftEntryRef.current = entry;
    setDraftEntry(entry);
    syncInputsFromEntry(entry);
  }, [entry]);

  async function saveUpdatedEntry(nextEntry: DailyEntry) {
    setSaveError("");
    pendingSavesRef.current += 1;

    try {
      await onSave(nextEntry);
    } catch {
      setSaveError("저장하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      pendingSavesRef.current -= 1;
    }
  }

  function commitDraftEntry(
    updater: (currentEntry: DailyEntry) => DailyEntry,
    options: { syncInputs?: boolean } = {},
  ): DailyEntry {
    const nextEntry = updater(draftEntryRef.current);

    draftEntryRef.current = nextEntry;
    setDraftEntry(nextEntry);

    if (options.syncInputs) {
      syncInputsFromEntry(nextEntry);
    }

    return nextEntry;
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadError("");

    try {
      const photo = await localDietStorage.savePhoto(file);
      const nextEntry = commitDraftEntry((currentEntry) => ({
        ...currentEntry,
        photo,
      }));

      await saveUpdatedEntry(nextEntry);
    } catch {
      setUploadError("사진을 저장하지 못했습니다. 다시 선택해 주세요.");
    } finally {
      event.target.value = "";
    }
  }

  function handleWeightBlur(event: FocusEvent<HTMLInputElement>) {
    const weightKg = parseWeightInput(event.target.value);
    const nextEntry = commitDraftEntry((currentEntry) => ({
      ...currentEntry,
      weightKg,
    }));

    void saveUpdatedEntry(nextEntry);
  }

  function handleMealChange(key: keyof DailyEntry["meals"], value: string) {
    const nextMeals = {
      ...draftEntryRef.current.meals,
      [key]: value,
    };

    setMeals(nextMeals);
    commitDraftEntry((currentEntry) => ({
      ...currentEntry,
      meals: nextMeals,
    }));
  }

  function handleMealBlur(key: keyof DailyEntry["meals"], value: string) {
    const nextEntry = commitDraftEntry((currentEntry) => ({
      ...currentEntry,
      meals: {
        ...currentEntry.meals,
        [key]: value.trim() ? value : undefined,
      },
    }));

    void saveUpdatedEntry(nextEntry);
  }

  return (
    <section className="today-page" aria-label="오늘 기록">
      <div className="page-heading">
        <p className="date-text">{draftEntry.date}</p>
        <h2>{completion.isComplete ? "오늘 완료" : "오늘 미완료"}</h2>
      </div>

      <div className="today-grid">
        <section className="panel task-panel" aria-label="필수 항목">
          <h3>체크리스트</h3>
          <div className="task-list">
            {completion.tasks.map((task) => {
              const StatusIcon = task.complete ? CheckCircle2 : Circle;

              return (
                <div className="task-row" key={task.key}>
                  <StatusIcon
                    aria-hidden="true"
                    size={20}
                    className={task.complete ? "status-complete" : "status-open"}
                  />
                  <span className="task-label">{taskLabels[task.key] ?? task.label}</span>
                  <span className={task.complete ? "task-state complete" : "task-state"}>
                    {task.complete ? "완료" : "미완료"}
                  </span>
                  <span className={task.required ? "task-badge required" : "task-badge"}>
                    {task.required ? "필수" : "선택"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel photo-panel" aria-label="전신 사진">
          <div className="panel-title">
            <Camera aria-hidden="true" size={20} />
            <h3>전신 사진</h3>
          </div>
          {draftEntry.photo?.previewUrl ? (
            <img
              className="photo-preview"
              src={draftEntry.photo.previewUrl}
              alt={`${draftEntry.date} 전신 사진`}
            />
          ) : (
            <div className="photo-empty">사진 없음</div>
          )}
          <label className="file-button">
            <Camera aria-hidden="true" size={18} />
            사진 선택
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </label>
          {uploadError ? <p className="error-text">{uploadError}</p> : null}
        </section>

        <section className="panel weight-panel" aria-label="몸무게">
          <div className="panel-title">
            <Scale aria-hidden="true" size={20} />
            <h3>몸무게</h3>
          </div>
          <label className="field-label" htmlFor="weight-kg">
            몸무게 kg
          </label>
          <input
            id="weight-kg"
            className="text-input"
            type="number"
            min="1"
            step="0.1"
            inputMode="decimal"
            value={weightValue}
            onChange={(event) => {
              const nextWeightValue = event.target.value;

              setWeightValue(nextWeightValue);
              commitDraftEntry((currentEntry) => ({
                ...currentEntry,
                weightKg: parseWeightInput(nextWeightValue),
              }));
            }}
            onBlur={handleWeightBlur}
          />
        </section>

        <section className="panel meals-panel" aria-label="식단 보고">
          <div className="panel-title">
            <Utensils aria-hidden="true" size={20} />
            <h3>식단 보고</h3>
          </div>
          <p className="helper-text">금식했다면 {FASTED_MARKER}를 입력하세요.</p>
          <div className="meal-grid">
            {mealLabels.map((meal) => (
              <label className="meal-field" key={meal.key}>
                <span>{meal.label}</span>
                <textarea
                  value={meals[meal.key] ?? ""}
                  onChange={(event) => handleMealChange(meal.key, event.target.value)}
                  onBlur={(event) => handleMealBlur(meal.key, event.target.value)}
                  rows={3}
                />
              </label>
            ))}
          </div>
        </section>
      </div>

      {saveError ? <p className="error-text page-error">{saveError}</p> : null}
    </section>
  );
}
