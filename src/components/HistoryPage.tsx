import type { DailyEntry } from "../domain/types";

type HistoryPageProps = {
  entries: DailyEntry[];
};

const meals: Array<{
  key: keyof DailyEntry["meals"];
  label: string;
}> = [
  { key: "breakfast", label: "아침" },
  { key: "lunch", label: "점심" },
  { key: "dinner", label: "저녁" },
  { key: "snack", label: "간식" },
];

function mealText(value: string | undefined): string {
  return value?.trim() || "-";
}

export function HistoryPage({ entries }: HistoryPageProps) {
  return (
    <section className="history-page" aria-label="기록">
      <div className="page-heading">
        <h2>기록</h2>
      </div>

      {entries.length === 0 ? (
        <p className="empty-state">아직 저장된 기록이 없습니다.</p>
      ) : (
        <div className="history-list">
          {entries.map((entry) => (
            <article className="history-card" key={entry.date}>
              <div className="history-main">
                <div>
                  <h3>{entry.date}</h3>
                  <p className="history-weight">
                    {typeof entry.weightKg === "number"
                      ? `${entry.weightKg} kg`
                      : "몸무게 미입력"}
                  </p>
                </div>
                {entry.photo?.previewUrl ? (
                  <img
                    className="history-photo"
                    src={entry.photo.previewUrl}
                    alt={`${entry.date} 전신 사진`}
                  />
                ) : (
                  <div className="history-photo history-photo-empty">사진 없음</div>
                )}
              </div>
              <dl className="meal-summary">
                {meals.map((meal) => (
                  <div key={meal.key}>
                    <dt>{meal.label}</dt>
                    <dd>{mealText(entry.meals[meal.key])}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
