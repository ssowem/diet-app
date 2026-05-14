import { CalendarDays, History, Settings } from "lucide-react";
import { useState } from "react";

type View = "today" | "history" | "settings";

const views: Array<{
  id: View;
  label: string;
  icon: typeof CalendarDays;
}> = [
  { id: "today", label: "오늘", icon: CalendarDays },
  { id: "history", label: "기록", icon: History },
  { id: "settings", label: "설정", icon: Settings }
];

const viewContent: Record<View, { title: string; text: string }> = {
  today: {
    title: "오늘 식단",
    text: "오늘의 식단 체크 항목이 여기에 표시됩니다."
  },
  history: {
    title: "기록",
    text: "지난 식단 기록과 완료 상태가 여기에 표시됩니다."
  },
  settings: {
    title: "설정",
    text: "개인 목표와 알림 설정이 여기에 표시됩니다."
  }
};

export default function App() {
  const [activeView, setActiveView] = useState<View>("today");
  const content = viewContent[activeView];

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

      <section className="content-card" aria-live="polite">
        <p className="section-label">{content.title}</p>
        <p>{content.text}</p>
      </section>
    </main>
  );
}
