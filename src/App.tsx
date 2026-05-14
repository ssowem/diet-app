import { CalendarDays, History, Settings } from "lucide-react";
import { useState } from "react";
import { HistoryPage } from "./components/HistoryPage";
import { ReminderToast } from "./components/ReminderToast";
import { SettingsPage } from "./components/SettingsPage";
import { TodayPage } from "./components/TodayPage";
import { useTodayEntry } from "./hooks/useTodayEntry";

type View = "today" | "history" | "settings";

const views: Array<{
  id: View;
  label: string;
  icon: typeof CalendarDays;
}> = [
  { id: "today", label: "오늘", icon: CalendarDays },
  { id: "history", label: "기록", icon: History },
  { id: "settings", label: "설정", icon: Settings },
];

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "데이터를 처리하지 못했습니다.";
}

export default function App() {
  const [activeView, setActiveView] = useState<View>("today");
  const {
    entry,
    entries,
    settings,
    completion,
    loading,
    error,
    saveEntry,
    saveSettings,
  } = useTodayEntry();

  function renderActiveView() {
    if (activeView === "history") {
      return <HistoryPage entries={entries} />;
    }

    if (activeView === "settings") {
      return <SettingsPage settings={settings} onSave={saveSettings} />;
    }

    return <TodayPage entry={entry} completion={completion} onSave={saveEntry} />;
  }

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Personal diet log</p>
          <h1>Diet Check</h1>
        </div>
      </header>

      <nav className="segmented-tabs" aria-label="Diet Check views">
        {views.map((view) => {
          const Icon = view.icon;
          const isActive = activeView === view.id;

          return (
            <button
              key={view.id}
              className={isActive ? "tab-button active" : "tab-button"}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveView(view.id)}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={2} />
              <span>{view.label}</span>
            </button>
          );
        })}
      </nav>

      {loading ? (
        <section className="panel loading-panel" aria-live="polite">
          불러오는 중...
        </section>
      ) : (
        <>
          {error ? <p className="app-error">{errorMessage(error)}</p> : null}
          {renderActiveView()}
          <ReminderToast
            isComplete={completion.isComplete}
            settings={settings}
            tasks={completion.tasks}
          />
        </>
      )}
    </main>
  );
}
