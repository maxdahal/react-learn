// @vitest-environment jsdom
import React, { useEffect } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DeckApp, { deckStorageKey } from "./DeckApp";
import { missionStorageKey } from "./missionProgress";
import { trialStorageKey } from "./fogGame";
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
          aria-label="Test blueprint"
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
          Verify test blueprint
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
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
function progress() {
  return JSON.parse(localStorage.getItem(missionStorageKey)!);
}
function seed() {
  localStorage.setItem(
    missionStorageKey,
    JSON.stringify({ explored: [0], tasks: { 0: 1 } }),
  );
  localStorage.setItem(trialStorageKey, JSON.stringify({ assisted: true }));
}
describe("Fog trial flow", () => {
  it("gates the repair blueprint on a completed field drill", async () => {
    render(<DeckApp />);
    const next = screen.getByRole("button", {
      name: "Repair blueprint",
    }) as HTMLButtonElement;
    expect(next.disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Arrow" }));
    fireEvent.click(screen.getByRole("button", { name: "Repair" }));
    await waitFor(() => expect(next.disabled).toBe(false));
    expect(progress().explored).toEqual([0]);
    fireEvent.click(next);
    await screen.findByRole("button", { name: "Verify test blueprint" });
    expect(
      (
        screen.getByRole("button", {
          name: "Next generator",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });
  it("requires verified code and a skill check before repairing a generator", async () => {
    seed();
    render(<DeckApp />);
    await screen.findByRole("button", { name: "Verify test blueprint" });
    const complete = screen.getByRole("button", {
      name: "Complete assisted skill check",
    }) as HTMLButtonElement;
    expect(complete.disabled).toBe(true);
    fireEvent.click(
      screen.getByRole("button", { name: "Verify test blueprint" }),
    );
    expect(complete.disabled).toBe(false);
    expect(JSON.parse(localStorage.getItem(trialStorageKey)!).repaired).toEqual(
      [],
    );
    fireEvent.click(complete);
    expect(screen.getByText("GENERATOR REPAIRED")).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(trialStorageKey)!).repaired).toEqual(
      [0],
    );
    expect(
      (
        screen.getByRole("button", {
          name: "Next generator",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
  });
  it("keeps a repaired generator navigable when its preview state resets on reload", async () => {
    seed();
    localStorage.setItem(
      missionStorageKey,
      JSON.stringify({ explored: [0], solved: [0], tasks: { 0: 1 } }),
    );
    localStorage.setItem(
      trialStorageKey,
      JSON.stringify({ repaired: [0], assisted: true }),
    );
    render(<DeckApp />);
    await screen.findByRole("button", { name: "Verify test blueprint" });
    expect(
      (
        screen.getByRole("button", {
          name: "Next generator",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Next generator" }));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Unpacking loadouts",
    );
  });
  it("saves blueprints and keeps previous-version work untouched", async () => {
    seed();
    localStorage.setItem("deep-dive-missions-v5", "old work");
    localStorage.setItem(
      missionStorageKey,
      JSON.stringify({
        explored: [0],
        tasks: { 0: 1 },
        drafts: { 0: { "App.jsx": "saved blueprint" } },
      }),
    );
    const view = render(<DeckApp />);
    expect(
      (
        (await screen.findByRole("textbox", {
          name: "Test blueprint",
        })) as HTMLTextAreaElement
      ).value,
    ).toBe("saved blueprint");
    fireEvent.change(screen.getByRole("textbox", { name: "Test blueprint" }), {
      target: { value: "edited blueprint" },
    });
    view.unmount();
    render(<DeckApp />);
    expect(
      (
        (await screen.findByRole("textbox", {
          name: "Test blueprint",
        })) as HTMLTextAreaElement
      ).value,
    ).toBe("edited blueprint");
    expect(localStorage.getItem("deep-dive-missions-v5")).toBe("old work");
  });
  it("does not unlock exit gates from unverified repair data", () => {
    localStorage.setItem(
      trialStorageKey,
      JSON.stringify({
        repaired: Array.from({ length: 16 }, (_, i) => i),
        escaped: true,
      }),
    );
    render(<DeckApp />);
    expect(
      (screen.getByRole("button", { name: /Exit gates/ }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(
      screen.queryByRole("heading", { name: "You escaped the Fog." }),
    ).toBeNull();
  });
  it("opens and completes the exit sequence only after all sixteen repairs", async () => {
    vi.useFakeTimers();
    const ids = Array.from({ length: 16 }, (_, i) => i);
    localStorage.setItem(
      missionStorageKey,
      JSON.stringify({ explored: ids, solved: ids }),
    );
    localStorage.setItem(trialStorageKey, JSON.stringify({ repaired: ids }));
    render(<DeckApp />);
    fireEvent.click(screen.getByRole("button", { name: /Exit gates/ }));
    expect(
      screen.getByRole("heading", { name: "Power the exit gates." }),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Hold exit gate switch" }),
    );
    expect(
      screen.queryByRole("heading", { name: "You escaped the Fog." }),
    ).toBeNull();
    act(() => vi.advanceTimersByTime(1500));
    expect(
      screen.getByRole("heading", { name: "You escaped the Fog." }),
    ).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(trialStorageKey)!).escaped).toBe(
      true,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Return to generators" }),
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Survivor actions",
    );
  });
  it("supports keyboard navigation without hijacking form controls", () => {
    localStorage.setItem(missionStorageKey, JSON.stringify({ explored: [0] }));
    render(<DeckApp />);
    fireEvent.keyDown(
      screen.getByRole("combobox", { name: "Narration language" }),
      { key: "ArrowRight" },
    );
    expect(progress().tasks[0]).toBe(0);
    fireEvent.keyDown(document.body, { key: "ArrowRight" });
    expect(progress().tasks[0]).toBe(1);
    fireEvent.keyDown(document.body, { key: "ArrowLeft" });
    expect(progress().tasks[0]).toBe(0);
  });
  it("switches to Nepali survivor narration and stores the rate", () => {
    render(<DeckApp />);
    fireEvent.change(
      screen.getByRole("combobox", { name: "Narration language" }),
      { target: { value: "ne-NP" } },
    );
    expect(
      screen.getByText(
        "Arrow छान्नुहोस् र Repair थिचेर सर्भाइभरको काम चलाउनुहोस्।",
      ),
    ).toBeTruthy();
    fireEvent.change(screen.getByRole("combobox", { name: "Playback speed" }), {
      target: { value: "1.25" },
    });
    expect(
      JSON.parse(localStorage.getItem("deep-dive-audio-v5")!),
    ).toMatchObject({ language: "ne-NP", rate: 1.25 });
  });
});
