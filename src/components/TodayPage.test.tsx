import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { TodayPage } from "./TodayPage";
import type { CompletionStatus, DailyEntry } from "../domain/types";

const entry: DailyEntry = {
  date: "2026-05-14",
  meals: {},
  updatedAt: "2026-05-14T00:00:00.000Z",
};

const completion: CompletionStatus = {
  isComplete: false,
  tasks: [
    { key: "photo", label: "Photo", required: true, complete: false },
    { key: "weight", label: "Weight", required: true, complete: false },
    { key: "meals", label: "Meals", required: true, complete: false },
  ],
};

function pendingPromise(): Promise<void> {
  return new Promise(() => undefined);
}

describe("TodayPage", () => {
  test("saves rapid meal and weight edits from the latest draft", () => {
    const savedEntries: DailyEntry[] = [];
    const onSave = vi.fn((nextEntry: DailyEntry) => {
      savedEntries.push(nextEntry);

      return pendingPromise();
    });

    render(<TodayPage entry={entry} completion={completion} onSave={onSave} />);

    const [breakfast, lunch] = screen.getAllByRole("textbox");
    const weight = screen.getByRole("spinbutton");

    fireEvent.change(breakfast, { target: { value: "eggs" } });
    fireEvent.blur(breakfast);
    fireEvent.change(lunch, { target: { value: "salad" } });
    fireEvent.blur(lunch);
    fireEvent.change(weight, { target: { value: "72.5" } });
    fireEvent.blur(weight);

    expect(onSave).toHaveBeenCalledTimes(3);
    expect(savedEntries[1]).toMatchObject({
      meals: {
        breakfast: "eggs",
        lunch: "salad",
      },
    });
    expect(savedEntries[2]).toMatchObject({
      weightKg: 72.5,
      meals: {
        breakfast: "eggs",
        lunch: "salad",
      },
    });
  });
});
