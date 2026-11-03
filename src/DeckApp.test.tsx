// @vitest-environment jsdom
import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DeckApp, { deckLessons, deckStorageKey } from "./DeckApp";
import { storageKey } from "./learning";
beforeEach(() => {
  localStorage.clear();
  window.scrollTo = vi.fn();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
function open(card = 0) {
  localStorage.setItem(deckStorageKey, JSON.stringify({ card, completed: [] }));
  return render(<DeckApp />);
}
function preview() {
  return within(screen.getByRole("region", { name: "Visual preview" }));
}
function select(name: string) {
  fireEvent.click(screen.getByRole("button", { name: "Lesson list" }));
  fireEvent.click(screen.getByRole("button", { name: new RegExp(name) }));
}
describe("v3 concept deck", () => {
  it("renders only one concept with a short code example on every card", () => {
    for (let i = 0; i < 16; i++) {
      const { container } = open(i);
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
        deckLessons[i][1],
      );
      expect(
        container.querySelector(".d-source pre")!.textContent!.split("\n")
          .length,
      ).toBeLessThan(10);
      cleanup();
    }
  });
  it("navigates forward/back and resumes the current card after reload", () => {
    const view = open();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      deckLessons[1][1],
    );
    expect(JSON.parse(localStorage.getItem(deckStorageKey)!).completed).toEqual(
      [0],
    );
    view.unmount();
    render(<DeckApp />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      deckLessons[1][1],
    );
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      deckLessons[0][1],
    );
  });
  it("changes syntax while preserving output and accepts a live input", () => {
    open();
    fireEvent.change(screen.getByRole("textbox", { name: "Greeting name" }), {
      target: { value: "Ada" },
    });
    expect(
      preview().getByRole("heading", { name: "Hello, Ada!" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Standard" }));
    expect(
      preview().getByRole("heading", { name: "Hello, Ada!" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("region", { name: "Code example" }).textContent,
    ).toContain("function greet");
  });
  it("switches object/array destructuring and direct access", () => {
    open(1);
    fireEvent.click(screen.getByRole("button", { name: "Array" }));
    expect(preview().getByText("setterName")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Direct access" }));
    expect(
      screen.getByRole("region", { name: "Code example" }).textContent,
    ).toContain("pair[1]");
  });
  it("creates fresh copies without changing the original and demonstrates rest", () => {
    open(2);
    fireEvent.click(screen.getByRole("button", { name: "Create copy" }));
    expect(
      preview().getByText("Original !== copy · distinct references"),
    ).toBeTruthy();
    expect(preview().getByText('"Test"')).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Object" }));
    fireEvent.click(screen.getByRole("button", { name: "Set active in copy" }));
    expect(preview().getByText('{"name":"Ada","status":"away"}')).toBeTruthy();
    expect(
      preview().getByText('{"name":"Ada","status":"active"}'),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Rest" }));
    expect(preview().getByText('{"role":"Designer","id":7}')).toBeTruthy();
  });
  it("updates dynamic string attributes immediately", () => {
    open(3);
    fireEvent.change(screen.getByRole("textbox", { name: "User ID" }), {
      target: { value: "99" },
    });
    expect(preview().getByText("user-card-99")).toBeTruthy();
    fireEvent.click(screen.getByRole("switch", { name: "isActive" }));
    expect(preview().getByText('"btn "')).toBeTruthy();
  });
  it("adds and removes mapped list items with stable IDs", () => {
    open(4);
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(preview().getByRole("button", { name: /^3 Ship/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Remove Ship" }));
    expect(preview().queryByRole("button", { name: /^3 Ship/ })).toBeNull();
  });
  it("filters task subsets live", () => {
    open(5);
    fireEvent.click(screen.getByRole("button", { name: "Completed" }));
    expect(preview().getByText("RENDERED LIST · 1 ITEMS")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Active" }));
    expect(preview().getByText("RENDERED LIST · 2 ITEMS")).toBeTruthy();
  });
  it("flattens nested categories with either method", () => {
    open(6);
    fireEvent.click(screen.getByRole("button", { name: "reduce" }));
    fireEvent.click(screen.getByRole("switch", { name: "Include “Ship”" }));
    expect(preview().getByText("One level · 5 strings")).toBeTruthy();
    expect(
      screen.getByRole("region", { name: "Code example" }).textContent,
    ).toContain("reduce");
  });
  it("renders conditional branches and errors independently", () => {
    open(7);
    fireEvent.click(screen.getByRole("switch", { name: "isLoggedIn" }));
    expect(
      preview().getByRole("heading", { name: "Welcome back, Ada." }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("switch", { name: "hasError" }));
    expect(preview().getByRole("status")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss error" }));
    expect(preview().queryByRole("status")).toBeNull();
  });
  it("shows the actual push return value and mutation vs pure transformation", () => {
    open(8);
    fireEvent.click(screen.getByRole("button", { name: "push" }));
    fireEvent.click(screen.getByRole("button", { name: "Run transformation" }));
    expect(preview().getByText("3")).toBeTruthy();
    expect(preview().getByRole("status").textContent).toContain(
      "input array changed",
    );
    fireEvent.click(screen.getByRole("button", { name: "concat" }));
    fireEvent.click(screen.getByRole("button", { name: "Run transformation" }));
    expect(preview().getByRole("status").textContent).toContain(
      "input unchanged",
    );
  });
  it("keeps UI responsive during async success and failure", async () => {
    vi.useFakeTimers();
    open(9);
    fireEvent.click(screen.getByRole("button", { name: "Fetch data" }));
    expect(preview().getByRole("status").textContent).toContain("Loading");
    fireEvent.click(screen.getByRole("button", { name: /Still clickable/ }));
    expect(
      preview().getByRole("button", { name: /Still clickable/ }).textContent,
    ).toContain("1");
    await act(async () => {
      vi.advanceTimersByTime(900);
    });
    expect(preview().getByRole("status").textContent).toContain("Data loaded");
    fireEvent.click(screen.getByRole("switch", { name: "Simulate failure" }));
    fireEvent.click(screen.getByRole("button", { name: "Fetch data" }));
    await act(async () => {
      vi.advanceTimersByTime(900);
    });
    expect(preview().getByRole("status").textContent).toContain(
      "Request failed",
    );
  });
  it("connects module files using matching import/export syntax", () => {
    open(10);
    fireEvent.click(screen.getByRole("button", { name: "Named" }));
    expect(
      screen.getByRole("region", { name: "Code example" }).textContent,
    ).toContain("import { Button }");
    fireEvent.click(screen.getByRole("button", { name: /Button.jsx exports/ }));
    expect(
      screen.getByRole("region", { name: "Code example" }).textContent,
    ).toContain("export function Button");
  });
  it("composes UI pieces through checkboxes and supports local like state", () => {
    open(11);
    fireEvent.click(screen.getByRole("button", { name: "♡ Like" }));
    expect(preview().getByRole("button", { name: "♥ Liked" })).toBeTruthy();
    fireEvent.click(screen.getByRole("checkbox", { name: "Thumbnail" }));
    expect(preview().queryByText("<Thumbnail />")).toBeNull();
    fireEvent.click(screen.getByRole("checkbox", { name: "LikeButton" }));
    expect(preview().queryByRole("button", { name: "♥ Liked" })).toBeNull();
  });
  it("demonstrates state identity with real React keys", () => {
    open(12);
    fireEvent.change(
      screen.getByRole("textbox", { name: "Note for Research" }),
      { target: { value: "My research" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Move first to end" }));
    expect(
      (
        screen.getByRole("textbox", {
          name: "Note for Research",
        }) as HTMLInputElement
      ).value,
    ).toBe("My research");
    fireEvent.click(screen.getByRole("button", { name: "Index" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Note for Design" }), {
      target: { value: "My design" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Move first to end" }));
    expect(
      (
        screen.getByRole("textbox", {
          name: "Note for Test",
        }) as HTMLInputElement
      ).value,
    ).toBe("My design");
  });
  it("updates React state and renders matching titles", () => {
    open(13);
    fireEvent.change(screen.getByRole("textbox", { name: "Search videos" }), {
      target: { value: "state" },
    });
    expect(preview().getByText("React renders 1 result")).toBeTruthy();
    expect(preview().getByText("State as a snapshot")).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox", { name: "Search videos" }), {
      target: { value: "xyz" },
    });
    expect(preview().getByText("No matching videos.")).toBeTruthy();
  });
  it("steps through framework loading and makes final UI interactive", () => {
    vi.useFakeTimers();
    open(14);
    fireEvent.click(screen.getByRole("button", { name: "Server + Suspense" }));
    fireEvent.click(screen.getByRole("button", { name: "Run request" }));
    expect(preview().getByText("Suspense fallback…")).toBeTruthy();
    act(() => vi.advanceTimersByTime(750));
    act(() => vi.advanceTimersByTime(750));
    fireEvent.click(screen.getByRole("button", { name: "♡ Save talk" }));
    expect(preview().getByRole("button", { name: "♥ Saved" })).toBeTruthy();
  });
  it("switches renderer primitives and completes/restarts the deck", () => {
    open(15);
    fireEvent.click(screen.getByRole("button", { name: "iOS" }));
    expect(
      screen.getByRole("region", { name: "Code example" }).textContent,
    ).toContain("react-native");
    fireEvent.click(screen.getByRole("button", { name: "Explore" }));
    expect(preview().getByRole("button", { name: "Explored ✓" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Finish deck" }));
    expect(screen.getByRole("status").textContent).toContain("end of the deck");
    fireEvent.click(screen.getByRole("button", { name: "Explore again" }));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      deckLessons[0][1],
    );
  });
  it("opens the old map lab without losing its saved code, then returns", () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ guidedStep: 6, draft: "cards.map(c => c.label)" }),
    );
    open(4);
    fireEvent.click(screen.getByRole("button", { name: /Open detailed/ }));
    fireEvent.click(
      screen.getByRole("button", { name: /Start the walkthrough/ }),
    );
    expect(
      (
        screen.getByRole("textbox", {
          name: "Practice code",
        }) as HTMLTextAreaElement
      ).value,
    ).toBe("cards.map(c => c.label)");
    fireEvent.click(screen.getByRole("button", { name: "Back to card deck" }));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      deckLessons[4][1],
    );
  });
  it("keeps help hidden, supports lesson selection, and saves the theme", () => {
    open();
    expect(screen.queryByText(/A function body with/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "I'm confused" }));
    expect(screen.getByText(/A function body with/)).toBeTruthy();
    select("Array filtering");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      deckLessons[5][1],
    );
    expect(screen.queryByText(/A function body with/)).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Switch to light theme" }),
    );
    expect(JSON.parse(localStorage.getItem(deckStorageKey)!).theme).toBe(
      "light",
    );
  });
});

describe("deck navigation resilience", () => {
  it("closes the index on Escape or outside interaction and restores keyboard focus", () => {
    open();
    const trigger = screen.getByRole("button", { name: "Lesson list" });
    fireEvent.click(trigger);
    expect(
      screen.getByRole("navigation", { name: "Card navigation" }),
    ).toBeTruthy();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(
      screen.queryByRole("navigation", { name: "Card navigation" }),
    ).toBeNull();
    expect(document.activeElement).toBe(trigger);
    fireEvent.click(trigger);
    fireEvent.pointerDown(screen.getByRole("heading", { level: 1 }));
    expect(
      screen.queryByRole("navigation", { name: "Card navigation" }),
    ).toBeNull();
  });
  it("recovers from corrupt progress and bounds saved card positions", () => {
    localStorage.setItem(deckStorageKey, "not JSON");
    const view = render(<DeckApp />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      deckLessons[0][1],
    );
    view.unmount();
    localStorage.setItem(
      deckStorageKey,
      JSON.stringify({
        card: 999,
        completed: [-1, 0, 0, 100, "1"],
        theme: "unknown",
      }),
    );
    render(<DeckApp />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      deckLessons[15][1],
    );
    expect(JSON.parse(localStorage.getItem(deckStorageKey)!).completed).toEqual(
      [0],
    );
  });
});
