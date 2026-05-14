import { useEffect, useState } from "react";
import { shouldShowReminder } from "../domain/reminder";
import type { UserSettings } from "../domain/types";

type ReminderToastProps = {
  isComplete: boolean;
  settings: UserSettings;
};

const reminderTitle = "Diet Check";
const reminderBody = "오늘 필수 기록이 아직 완료되지 않았습니다.";

function canUseNotification(): boolean {
  return typeof Notification !== "undefined";
}

export function ReminderToast({ isComplete, settings }: ReminderToastProps) {
  const [lastReminderAt, setLastReminderAt] = useState<Date>();
  const [isVisible, setIsVisible] = useState(false);
  const remindersEnabled = settings.reminder.enabled;

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
  }, [isComplete, lastReminderAt, remindersEnabled, settings]);

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
    <aside className="reminder-toast" role="status" aria-live="polite">
      <div>
        <p className="reminder-title">오늘 기록이 아직 미완료입니다.</p>
        <p>전신 사진, 몸무게, 식단 보고를 확인하세요.</p>
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
