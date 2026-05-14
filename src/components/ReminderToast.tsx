import { useEffect, useState } from "react";
import { shouldShowReminder } from "../domain/reminder";
import type { CompletionTask, UserSettings } from "../domain/types";

type ReminderToastProps = {
  isComplete: boolean;
  settings: UserSettings;
  tasks: CompletionTask[];
};

const reminderTitle = "Diet Check";

function canUseNotification(): boolean {
  return typeof Notification !== "undefined";
}

function buildReminderBody(tasks: CompletionTask[]): string {
  const incompleteRequiredTasks = tasks.filter((task) => task.required && !task.complete);

  if (incompleteRequiredTasks.length === 0) {
    return "오늘 필수 기록을 확인하세요.";
  }

  return `${incompleteRequiredTasks.map((task) => task.label).join(", ")}를 확인하세요.`;
}

export function ReminderToast({ isComplete, settings, tasks }: ReminderToastProps) {
  const [lastReminderAt, setLastReminderAt] = useState<Date>();
  const [isVisible, setIsVisible] = useState(false);
  const remindersEnabled = settings.reminder.enabled;
  const reminderBody = buildReminderBody(tasks);

  useEffect(() => {
    if (isComplete || !remindersEnabled) {
      setIsVisible(false);
      return undefined;
    }

    function checkReminder() {
      const now = new Date();

      if (
        !shouldShowReminder({
          now,
          lastReminderAt,
          isComplete,
          settings,
        })
      ) {
        return;
      }

      setLastReminderAt(now);

      if (canUseNotification() && Notification.permission === "granted") {
        new Notification(reminderTitle, { body: reminderBody });
        setIsVisible(false);
        return;
      }

      setIsVisible(true);
    }

    checkReminder();
    const intervalId = window.setInterval(checkReminder, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, [isComplete, lastReminderAt, reminderBody, remindersEnabled, settings]);

  async function requestPermission() {
    if (!canUseNotification()) {
      setIsVisible(true);
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      new Notification(reminderTitle, { body: reminderBody });
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
  }

  if (isComplete || !remindersEnabled || !isVisible) {
    return null;
  }

  return (
    <aside className="reminder-toast">
      <div aria-live="polite">
        <p className="reminder-title">오늘 기록이 아직 미완료입니다.</p>
        <p>{reminderBody}</p>
      </div>
      <div className="reminder-actions">
        <button className="secondary-action" type="button" onClick={requestPermission}>
          브라우저 알림 허용
        </button>
        <button className="secondary-action" type="button" onClick={() => setIsVisible(false)}>
          닫기
        </button>
      </div>
    </aside>
  );
}
