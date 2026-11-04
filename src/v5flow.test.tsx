// @vitest-environment jsdom
import React, { useEffect } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DeckApp from "./DeckApp";
import { missionStorageKey } from "./missionProgress";
vi.mock("./CodeMission", () => ({
  default: ({
    drafts,
    onChange,
    onSolved,
    onValidity,
  }: {
    drafts?: Record<string, string>;
    onChange: (f: Record<string, string>) => void;
    onSolved: () => void;
    onValidity: (v: boolean) => void;
  }) => {
    useEffect(() => onValidity(false), [onValidity]);
    return (
      <div>
        <textarea
          aria-label="Test mission draft"
          value={drafts?.["App.jsx"] || ""}
          onChange={(e) => {
            onChange({ "App.jsx": e.target.value });
            onValidity(false);
          }}
        />
        <button
          onClick={() => {
            onValidity(true);
            onSolved();
          }}
        >
          Validate test mission
        </button>
      </div>
    );
  },
}));
beforeEach(() => {
  localStorage.clear();
  window.scrollTo = vi.fn();
  window.matchMedia = vi
    .fn()
    .mockReturnValue({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
});
afterEach(cleanup);
function progress() {
  return JSON.parse(localStorage.getItem(missionStorageKey)!);
}
describe("v5 guided tasks", () => {
  it("requires a real exploration action before advancing to the editor", async () => {
    render(<DeckApp />);
    const next = screen.getByRole("button", {
      name: "Next task",
    }) as HTMLButtonElement;
    expect(next.disabled).toBe(true);
    fireEvent.change(screen.getByRole("textbox", { name: "Greeting name" }), {
      target: { value: "Ada" },
    });
    await waitFor(() => expect(next.disabled).toBe(false));
    expect(progress().explored).toEqual([0]);
    fireEvent.click(next);
    await screen.findByRole("button", { name: "Validate test mission" });
    expect(
      (screen.getByRole("button", { name: "Next card" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    fireEvent.click(
      screen.getByRole("button", { name: "Validate test mission" }),
    );
    expect(progress().solved).toEqual([0]);
    expect(screen.getByText("First mission")).toBeTruthy();
  });
  it("saves drafts and returns to the same task after reload", async () => {
    localStorage.setItem(
      missionStorageKey,
      JSON.stringify({
        explored: [0],
        tasks: { 0: 1 },
        drafts: { 0: { "App.jsx": "my saved code" } },
      }),
    );
    const view = render(<DeckApp />);
    expect(
      (
        (await screen.findByRole("textbox", {
          name: "Test mission draft",
        })) as HTMLTextAreaElement
      ).value,
    ).toBe("my saved code");
    fireEvent.change(
      screen.getByRole("textbox", { name: "Test mission draft" }),
      { target: { value: "my edited code" } },
    );
    view.unmount();
    render(<DeckApp />);
    expect(
      (
        (await screen.findByRole("textbox", {
          name: "Test mission draft",
        })) as HTMLTextAreaElement
      ).value,
    ).toBe("my edited code");
  });
  it("handles arrow shortcuts without hijacking form controls", () => {
    localStorage.setItem(missionStorageKey, JSON.stringify({ explored: [0] }));
    render(<DeckApp />);
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Greeting name" }), {
      key: "ArrowRight",
    });
    expect(progress().tasks[0]).toBe(0);
    fireEvent.keyDown(document.body, { key: "ArrowRight" });
    expect(progress().tasks[0]).toBe(1);
    fireEvent.keyDown(document.body, { key: "ArrowLeft" });
    expect(progress().tasks[0]).toBe(0);
  });
  it("switches task scripts to Nepali and persists audio preferences", () => {
    render(<DeckApp />);
    fireEvent.change(
      screen.getByRole("combobox", { name: "Narration language" }),
      { target: { value: "ne-NP" } },
    );
    expect(
      screen.getByText("एरो सिन्ट्याक्स छान्नुहोस् र आफ्नो नाम लेख्नुहोस्।"),
    ).toBeTruthy();
    fireEvent.change(screen.getByRole("combobox", { name: "Playback speed" }), {
      target: { value: "1.25" },
    });
    expect(
      JSON.parse(localStorage.getItem("deep-dive-audio-v5")!),
    ).toMatchObject({ language: "ne-NP", rate: 1.25 });
  });
});
