// @vitest-environment jsdom
import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  act,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FogExplore from "./FogExplore";
import DeckApp, { deckLessons, deckStorageKey } from "./DeckApp";
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
function preview() {
  return within(screen.getByRole("region", { name: "Visual preview" }));
}
function demo(index: number) {
  const done = vi.fn();
  render(<FogExplore index={index} onComplete={done} />);
  return done;
}
describe("survivor field drills", () => {
  it("shows exactly one generator with its own concept", () => {
    render(<DeckApp />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      deckLessons[0][1],
    );
    expect(screen.getByText("GENERATORS LEFT")).toBeTruthy();
  });
  it("converts the repair action and executes its return value", () => {
    const done = demo(0);
    fireEvent.click(screen.getByRole("button", { name: "Repair" }));
    expect(done).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Arrow" }));
    fireEvent.click(screen.getByRole("button", { name: "Repair" }));
    expect(preview().getByRole("status").textContent).toBe("Repair started");
    expect(done).toHaveBeenCalled();
  });
  it("unpacks both equipped perks", () => {
    const done = demo(1);
    fireEvent.click(screen.getByRole("button", { name: "Destructure" }));
    expect(preview().getByText("Sprint Burst")).toBeTruthy();
    expect(preview().getByText("Lithe")).toBeTruthy();
    expect(done).toHaveBeenCalled();
  });
  it("copies inventory without changing the original", () => {
    const done = demo(2);
    fireEvent.click(
      screen.getByRole("button", { name: "Add Medkit using spread" }),
    );
    expect(preview().getByText("Medkit")).toBeTruthy();
    expect(
      preview().getByText("Original unchanged · new array reference"),
    ).toBeTruthy();
    expect(done).toHaveBeenCalled();
  });
  it("updates survivor identifiers live", () => {
    const done = demo(3);
    fireEvent.change(screen.getByRole("textbox", { name: "Survivor ID" }), {
      target: { value: "7" },
    });
    expect(
      preview().getByRole("heading", { name: "Survivor #7" }),
    ).toBeTruthy();
    expect(preview().getByText("survivor-7")).toBeTruthy();
    expect(done).toHaveBeenCalled();
  });
  it("maps exactly four survivors into the HUD", () => {
    const done = demo(4);
    fireEvent.click(
      screen.getByRole("button", { name: "Render all 4 survivors" }),
    );
    expect(preview().getAllByRole("button")).toHaveLength(4);
    fireEvent.click(preview().getByRole("button", { name: /Claudette/ }));
    expect(preview().getByText(/survivor =.*Claudette/)).toBeTruthy();
    expect(done).toHaveBeenCalled();
  });
  it("filters only injured survivors", () => {
    const done = demo(5);
    fireEvent.click(screen.getByRole("button", { name: "Injured" }));
    expect(preview().getByText("Meg")).toBeTruthy();
    expect(preview().getByText("Dwight")).toBeTruthy();
    expect(preview().queryByText("Claudette")).toBeNull();
    expect(done).toHaveBeenCalled();
  });
  it("collects chest loot into a flat list", () => {
    const done = demo(6);
    fireEvent.click(
      screen.getByRole("button", { name: "Collect with flatMap" }),
    );
    expect(preview().getAllByText("Medkit")).toHaveLength(2);
    expect(done).toHaveBeenCalled();
  });
  it("chooses the injured health badge", () => {
    const done = demo(7);
    fireEvent.click(screen.getByRole("switch", { name: "isInjured" }));
    expect(preview().getByRole("heading", { name: "Injured!" })).toBeTruthy();
    expect(done).toHaveBeenCalled();
  });
  it("compares mutation before preserving game state", () => {
    const done = demo(8);
    fireEvent.click(screen.getByRole("button", { name: "Run update" }));
    expect(preview().getByRole("status").textContent).toContain(
      "original inventory changed",
    );
    expect(done).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Immutable" }));
    fireEvent.click(screen.getByRole("button", { name: "Run update" }));
    expect(preview().getByRole("status").textContent).toContain(
      "original untouched",
    );
    expect(done).toHaveBeenCalled();
  });
  it("waits for a real local promise timer while the HUD responds", async () => {
    vi.useFakeTimers();
    const done = demo(9);
    fireEvent.click(screen.getByRole("button", { name: "Hold gate switch" }));
    expect(
      preview().getByRole("heading", { name: "Awaiting gate timer…" }),
    ).toBeTruthy();
    fireEvent.click(
      preview().getByRole("button", { name: /HUD stays responsive/ }),
    );
    await act(async () => {
      vi.advanceTimersByTime(900);
    });
    expect(
      preview().getByRole("heading", { name: "Gate timer complete" }),
    ).toBeTruthy();
    expect(done).toHaveBeenCalled();
  });
  it("matches module exports and imports", () => {
    const done = demo(10);
    fireEvent.click(screen.getByRole("button", { name: "Named" }));
    fireEvent.click(screen.getByRole("button", { name: /Perk.jsx exports/ }));
    expect(
      screen.getByRole("region", { name: "Code example" }).textContent,
    ).toContain("export function SprintBurst");
    expect(done).toHaveBeenCalled();
  });
  it("composes perk and health components", () => {
    const done = demo(11);
    fireEvent.click(screen.getByRole("checkbox", { name: "PerkIcon" }));
    expect(done).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("checkbox", { name: "HealthBar" }));
    expect(preview().getByLabelText("Health bar")).toBeTruthy();
    expect(done).toHaveBeenCalled();
  });
  it("preserves actual row state with stable survivor IDs", () => {
    const done = demo(12);
    fireEvent.click(screen.getByRole("button", { name: "Stable IDs" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Note for Meg" }), {
      target: { value: "Keep this with Meg" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Rotate squad" }));
    expect(
      (
        screen.getByRole("textbox", {
          name: "Note for Meg",
        }) as HTMLInputElement
      ).value,
    ).toBe("Keep this with Meg");
    expect(done).toHaveBeenCalled();
  });
  it("updates the practice meter through four renders", () => {
    const done = demo(13);
    for (let i = 0; i < 4; i++)
      fireEvent.click(screen.getByRole("button", { name: "Repair +25" }));
    expect(
      preview().getByRole("progressbar").getAttribute("aria-valuenow"),
    ).toBe("100");
    expect(done).toHaveBeenCalledTimes(1);
  });
  it("models a server fallback before syncing the client HUD", () => {
    vi.useFakeTimers();
    const done = demo(14);
    fireEvent.click(screen.getByRole("button", { name: "Entity server" }));
    fireEvent.click(screen.getByRole("button", { name: "Load match stats" }));
    expect(preview().getByRole("status").textContent).toContain(
      "LoadingBloodweb",
    );
    act(() => vi.advanceTimersByTime(900));
    fireEvent.click(screen.getByRole("button", { name: "Sync HUD" }));
    expect(done).toHaveBeenCalled();
  });
  it("distinguishes native primitives from DOM views", () => {
    const done = demo(15);
    fireEvent.click(screen.getByRole("button", { name: "iOS" }));
    expect(
      screen.getByRole("region", { name: "Code example" }).textContent,
    ).toContain("react-native");
    fireEvent.click(screen.getByRole("button", { name: "Repair HUD" }));
    expect(
      preview().getByRole("button", { name: "Repair +25 ✓" }),
    ).toBeTruthy();
    expect(done).toHaveBeenCalled();
  });
  it("nests topics in the generator index and closes it with Escape", () => {
    render(<DeckApp />);
    fireEvent.click(screen.getByRole("button", { name: "Lesson list" }));
    fireEvent.click(
      screen.getByRole("button", { name: /06.*Array filtering/ }),
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      deckLessons[5][1],
    );
    fireEvent.click(screen.getByRole("button", { name: "Lesson list" }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(
      screen.queryByRole("navigation", { name: "Card navigation" }),
    ).toBeNull();
  });
});
