import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import App from "./App";
import { ReminderToast } from "./components/ReminderToast";
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
const signInWithProvider = vi.fn();
const logout = vi.fn();

let authState = {
  session: undefined as { email: string; profileId: string } | undefined,
  loading: false,
  error: undefined as string | undefined,
  isConfigured: true,
  signInWithProvider,
  logout,
};

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

vi.mock("./hooks/useAuthSession", () => ({
  useAuthSession: () => authState,
}));

describe("App", () => {
  beforeEach(() => {
    saveEntry.mockReset();
    saveSettings.mockReset();
    signInWithProvider.mockReset();
    logout.mockReset();
    authState = {
      session: undefined,
      loading: false,
      error: undefined,
      isConfigured: true,
      signInWithProvider,
      logout,
    };
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("shows login and install entry before the app", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "로그인" })).toBeVisible();
    expect(screen.queryByLabelText("이메일")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Google로 계속하기" })).toBeVisible();
    expect(screen.getByRole("button", { name: "카카오로 계속하기" })).toBeVisible();
    expect(screen.getByRole("button", { name: "네이버로 계속하기" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "앱 설치" })).toBeVisible();
  });

  test("starts social login with the selected provider", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: "카카오로 계속하기" }));

    expect(signInWithProvider).toHaveBeenCalledWith("kakao");
  });

  test("renders the real today view for an authenticated user and switches views", async () => {
    const user = userEvent.setup();

    authState = {
      ...authState,
      session: {
        email: "tester@example.com",
        profileId: "supabase-user-1",
      },
    };

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

  test("shows reminder text for incomplete required tasks only", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-14T12:00:00.000Z"));
    vi.stubGlobal("Notification", undefined);

    const settings = {
      ...defaultSettings,
      reminder: {
        ...defaultSettings.reminder,
        enabled: true,
        startTime: "00:00",
        endTime: "23:59",
      },
    };
    const tasks = [
      { key: "photo" as const, label: "전신 사진", required: false, complete: false },
      { key: "weight" as const, label: "몸무게", required: true, complete: true },
      { key: "meals" as const, label: "식단 보고", required: true, complete: false },
    ];

    render(<ReminderToast {...{ isComplete: false, settings, tasks }} />);

    const title = screen.getByText("오늘 기록이 아직 미완료입니다.");
    const toast = title.closest(".reminder-toast");

    expect(toast).not.toBeNull();
    expect(within(toast as HTMLElement).getByText(/식단 보고/)).toBeVisible();
    expect(within(toast as HTMLElement).queryByText(/전신 사진/)).not.toBeInTheDocument();
    expect(within(toast as HTMLElement).queryByText(/몸무게/)).not.toBeInTheDocument();
  });
});
