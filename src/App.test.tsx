import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import App from "./App";

describe("App", () => {
  test("renders the scaffold views and switches tabs", async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Diet Check" })
    ).toBeInTheDocument();
    expect(screen.getByText("오늘의 식단 체크 항목이 여기에 표시됩니다.")).toBeVisible();

    await user.click(screen.getByRole("button", { name: /기록/ }));
    expect(
      screen.getByText("지난 식단 기록과 완료 상태가 여기에 표시됩니다.")
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: /설정/ }));
    expect(
      screen.getByText("개인 목표와 알림 설정이 여기에 표시됩니다.")
    ).toBeVisible();
  });
});
