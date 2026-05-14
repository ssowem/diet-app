import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import App from "./App";
import { defaultSettings, type DailyEntry } from "./domain/types";

const todayEntry: DailyEntry = {
  date: "2026-05-14",
  meals: {},
  updatedAt: "2026-05-14T00:00:00.000Z",
};

const completion = {
  isComplete: false,
  tasks: [
    { key: "photo" as const, label: "전신 사진", required: true, complete: false },
    { key: "weight" as const, label: "몸무게", required: true, complete: false },
    { key: "meals" as const, label: "식단 보고", required: true, complete: false },
  ],
};

const saveEntry = vi.fn();
const saveSettings = vi.fn();

vi.mock("./hooks/useTodayEntry", () => ({
  useTodayEntry: () => ({
    entry: todayEntry,
    entries: [],
    settings: {
      ...defaultSettings,
      reminder: {
        ...defaultSettings.reminder,
        enabled: false,
      },
    },
    completion,
    loading: false,
    error: undefined,
    saveEntry,
    saveSettings,
  }),
}));

describe("App", () => {
  beforeEach(() => {
    saveEntry.mockReset();
    saveSettings.mockReset();
  });

  test("renders the real today view and switches to history and settings", async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Diet Check" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "오늘 미완료" })).toBeVisible();
    expect(screen.getAllByText("전신 사진")[0]).toBeVisible();
    expect(
      within(screen.getByLabelText("필수 항목")).getAllByText("미완료"),
    ).toHaveLength(3);
    expect(screen.getByLabelText("몸무게 kg")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "기록" }));
    expect(screen.getByRole("heading", { name: "기록" })).toBeVisible();
    expect(screen.getByText("아직 저장된 기록이 없습니다.")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "설정" }));
    expect(screen.getByRole("heading", { name: "설정" })).toBeVisible();
    expect(screen.getByLabelText("전신 사진")).toBeChecked();
    expect(screen.getByRole("button", { name: "설정 저장" })).toBeVisible();
  });
});
