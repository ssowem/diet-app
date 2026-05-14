import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { CompletionStatus, DailyEntry } from "../domain/types";
import { TodayPage } from "./TodayPage";

const { savePhoto } = vi.hoisted(() => ({
  savePhoto: vi.fn(),
}));

vi.mock("../storage/storage", () => ({
  localDietStorage: {
    savePhoto,
  },
}));

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

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

describe("TodayPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    savePhoto.mockReset();
  });

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

  test("preserves typed edits while a photo save is pending", async () => {
    const savedEntries: DailyEntry[] = [];
    const photo = {
      id: "photo-1",
      previewUrl: "blob:photo-1",
      createdAt: "2026-05-14T01:00:00.000Z",
    };
    const photoSave = deferred<typeof photo>();
    const onSave = vi.fn(async (nextEntry: DailyEntry) => {
      savedEntries.push(nextEntry);
    });

    savePhoto.mockReturnValueOnce(photoSave.promise);

    const { container } = render(
      <TodayPage entry={entry} completion={completion} onSave={onSave} />,
    );

    const fileInput = container.querySelector<HTMLInputElement>("input[type='file']");
    const [breakfast] = screen.getAllByRole("textbox");
    const weight = screen.getByRole("spinbutton");

    expect(fileInput).not.toBeNull();

    fireEvent.change(fileInput!, {
      target: {
        files: [new File(["photo"], "today.jpg", { type: "image/jpeg" })],
      },
    });
    fireEvent.change(breakfast, { target: { value: "oatmeal" } });
    fireEvent.change(weight, { target: { value: "71.2" } });

    photoSave.resolve(photo);

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));

    expect(breakfast).toHaveValue("oatmeal");
    expect(weight).toHaveValue(71.2);
    expect(savedEntries[0]).toMatchObject({
      photo,
      weightKg: 71.2,
      meals: {
        breakfast: "oatmeal",
      },
    });

    fireEvent.blur(breakfast);
    fireEvent.blur(weight);

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(3));
    expect(savedEntries[2]).toMatchObject({
      photo,
      weightKg: 71.2,
      meals: {
        breakfast: "oatmeal",
      },
    });
  });

  test("keeps the latest selected photo when earlier photo save resolves last", async () => {
    const savedEntries: DailyEntry[] = [];
    const photoA = {
      id: "photo-a",
      previewUrl: "blob:photo-a",
      createdAt: "2026-05-14T01:00:00.000Z",
    };
    const photoB = {
      id: "photo-b",
      previewUrl: "blob:photo-b",
      createdAt: "2026-05-14T01:01:00.000Z",
    };
    const photoSaveA = deferred<typeof photoA>();
    const photoSaveB = deferred<typeof photoB>();
    const onSave = vi.fn(async (nextEntry: DailyEntry) => {
      savedEntries.push(nextEntry);
    });

    savePhoto
      .mockReturnValueOnce(photoSaveA.promise)
      .mockReturnValueOnce(photoSaveB.promise);

    const { container } = render(
      <TodayPage entry={entry} completion={completion} onSave={onSave} />,
    );

    const fileInput = container.querySelector<HTMLInputElement>("input[type='file']");

    expect(fileInput).not.toBeNull();

    fireEvent.change(fileInput!, {
      target: {
        files: [new File(["photo-a"], "photo-a.jpg", { type: "image/jpeg" })],
      },
    });
    fireEvent.change(fileInput!, {
      target: {
        files: [new File(["photo-b"], "photo-b.jpg", { type: "image/jpeg" })],
      },
    });

    await act(async () => {
      photoSaveB.resolve(photoB);
      await photoSaveB.promise;
      await Promise.resolve();
    });

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(savedEntries[savedEntries.length - 1]?.photo).toEqual(photoB);
    expect(screen.getByRole("img")).toHaveAttribute("src", photoB.previewUrl);

    await act(async () => {
      photoSaveA.resolve(photoA);
      await photoSaveA.promise;
      await Promise.resolve();
    });

    expect(savedEntries[savedEntries.length - 1]?.photo).toEqual(photoB);
    expect(screen.getByRole("img")).toHaveAttribute("src", photoB.previewUrl);
  });
});
