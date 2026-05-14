import { FormEvent, useEffect, useState } from "react";
import { minutesFromMidnight } from "../domain/date";
import type { TaskKey, UserSettings } from "../domain/types";

type SettingsPageProps = {
  settings: UserSettings;
  onSave: (settings: UserSettings) => Promise<void>;
};

const requiredTasks: Array<{
  key: TaskKey;
  label: string;
}> = [
  { key: "photo", label: "전신 사진" },
  { key: "weight", label: "몸무게" },
  { key: "meals", label: "식단 보고" },
];

export function SettingsPage({ settings, onSave }: SettingsPageProps) {
  const [draft, setDraft] = useState(settings);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(settings);
    setMessage("");
    setError("");
  }, [settings]);

  function updateRequiredTask(key: TaskKey, checked: boolean) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      requiredTasks: {
        ...currentDraft.requiredTasks,
        [key]: checked,
      },
    }));
  }

  function updateReminder(partial: Partial<UserSettings["reminder"]>) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      reminder: {
        ...currentDraft.reminder,
        ...partial,
      },
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    let start: number;
    let end: number;

    try {
      start = minutesFromMidnight(draft.reminder.startTime);
      end = minutesFromMidnight(draft.reminder.endTime);
    } catch {
      setError("리마인더 시작/종료 시간은 달라야 합니다.");
      return;
    }

    if (start === end) {
      setError("리마인더 시작/종료 시간은 달라야 합니다.");
      return;
    }

    try {
      await onSave(draft);
      setMessage("설정을 저장했습니다.");
    } catch {
      setError("설정을 저장하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  return (
    <section className="settings-page" aria-label="설정">
      <div className="page-heading">
        <h2>설정</h2>
      </div>

      <form className="settings-panel" onSubmit={handleSubmit}>
        <fieldset className="settings-group">
          <legend>필수 기록</legend>
          {requiredTasks.map((task) => (
            <label className="checkbox-row" key={task.key}>
              <input
                type="checkbox"
                checked={draft.requiredTasks[task.key]}
                onChange={(event) => updateRequiredTask(task.key, event.target.checked)}
              />
              <span>{task.label}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="settings-group">
          <legend>리마인더</legend>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={draft.reminder.enabled}
              onChange={(event) => updateReminder({ enabled: event.target.checked })}
            />
            <span>리마인더 사용</span>
          </label>
          <div className="time-grid">
            <label className="field-label">
              시작
              <input
                className="text-input"
                type="time"
                value={draft.reminder.startTime}
                onChange={(event) => updateReminder({ startTime: event.target.value })}
              />
            </label>
            <label className="field-label">
              종료
              <input
                className="text-input"
                type="time"
                value={draft.reminder.endTime}
                onChange={(event) => updateReminder({ endTime: event.target.value })}
              />
            </label>
          </div>
        </fieldset>

        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}

        <button className="primary-action" type="submit">
          설정 저장
        </button>
      </form>
    </section>
  );
}
