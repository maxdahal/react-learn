// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import App from "./App";
import { storageKey } from "./learning";
beforeEach(() => {
  localStorage.clear();
  window.scrollTo = vi.fn();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
function open(seed: object = {}) {
  localStorage.setItem(storageKey, JSON.stringify(seed));
  render(<App />);
  fireEvent.click(
    screen.getByRole("button", {
      name: /Start the walkthrough|Continue where you left off|Revisit lesson/,
    }),
  );
}
function next() {
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
}
function saved() {
  return JSON.parse(localStorage.getItem(storageKey)!);
}
describe("guided Syntax Lab", () => {
  it("shows one activity at a time and navigates both ways", () => {
    open();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "See the transformation",
    );
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.getByText("Step 1")).toBeTruthy();
    next();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "Meet the callback",
    );
    expect(screen.queryByText("GET A NEW ARRAY OF LABELS")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "See the transformation",
    );
  });
  it("keeps help hidden until requested, and closes it on the next step", () => {
    open();
    expect(screen.queryByText(/does not remove items/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "I'm confused" }));
    expect(screen.getByText(/does not remove items/)).toBeTruthy();
    next();
    expect(screen.queryByText(/does not remove items/)).toBeNull();
    expect(
      screen
        .getByRole("button", { name: "I'm confused" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });
  it("preserves examples and updates the parameter binding", () => {
    open();
    fireEvent.change(screen.getByRole("combobox", { name: "Example world" }), {
      target: { value: "dbd" },
    });
    next();
    fireEvent.change(
      screen.getByRole("combobox", { name: "Callback parameter name" }),
      { target: { value: "banana" } },
    );
    fireEvent.click(screen.getByRole("button", { name: /cards\[1\]/ }));
    expect(screen.getByText('{ label: "Lithe" }')).toBeTruthy();
    expect(saved().alias).toBe("banana");
  });
  it("uses the bottom Next and Back controls to trace every execution moment", () => {
    open({ guidedStep: 2 });
    expect(saved().traceStep).toBe(0);
    for (let i = 0; i < 9; i++)
      fireEvent.click(screen.getByRole("button", { name: "Next moment" }));
    expect(
      screen.getByText("Finished. Three calls, three labels, one new array."),
    ).toBeTruthy();
    expect(saved().traced).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(saved().traceStep).toBe(8);
    fireEvent.click(screen.getByRole("button", { name: "Next moment" }));
    next();
    expect(saved().guidedStep).toBe(3);
  });
  it("can autoplay and pause without leaving the trace step", () => {
    vi.useFakeTimers();
    open({ guidedStep: 2 });
    fireEvent.click(screen.getByRole("button", { name: "Auto play" }));
    for (let i = 0; i < 3; i++) act(() => vi.advanceTimersByTime(1000));
    expect(saved().traceStep).toBe(3);
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    act(() => vi.advanceTimersByTime(2000));
    expect(saved().traceStep).toBe(3);
    expect(saved().guidedStep).toBe(2);
  });
  it("updates only the input-change activity, with live output", () => {
    open({ guidedStep: 3 });
    fireEvent.change(screen.getByRole("textbox", { name: "Card 1 label" }), {
      target: { value: "Research" },
    });
    expect(screen.getByText("Research")).toBeTruthy();
    expect(saved().labels[0]).toBe("Research");
    expect(screen.queryByRole("textbox", { name: "Practice code" })).toBeNull();
  });
  it("checks a prediction before continuing", () => {
    open({ guidedStep: 4 });
    const advance = screen.getByRole("button", {
      name: "Next",
    }) as HTMLButtonElement;
    expect(advance.disabled).toBe(true);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "[1,2,3]" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Check prediction" }));
    expect(screen.getByRole("status").textContent).toContain("Not yet");
    expect(advance.disabled).toBe(true);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: '["Discover","Design","Test"]' },
    });
    fireEvent.click(screen.getByRole("button", { name: "Check prediction" }));
    expect(advance.disabled).toBe(false);
    next();
    expect(saved().guidedStep).toBe(5);
  });
  it("accepts a small callback edit and gives live output", () => {
    open({ guidedStep: 5 });
    fireEvent.change(
      screen.getByRole("textbox", { name: "Return expression" }),
      { target: { value: "card.label.toUpperCase()" } },
    );
    expect(screen.getByText('"DISCOVER"')).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Check change" }));
    expect(saved().modified).toBe(true);
    next();
    expect(saved().guidedStep).toBe(6);
  });
  it("offers progressive hints without replacing independent code", () => {
    open({ guidedStep: 6 });
    const editor = screen.getByRole("textbox", {
      name: "Practice code",
    }) as HTMLTextAreaElement;
    expect(editor.value).toBe("");
    fireEvent.click(screen.getByRole("button", { name: "I'm confused" }));
    expect(saved().hint).toBe(1);
    fireEvent.click(screen.getByRole("button", { name: "Another hint" }));
    expect(saved().hint).toBe(2);
    expect(editor.value).toBe("");
    fireEvent.change(editor, {
      target: {
        value: "cards.map((card,index) => `${index + 1}. ${card.label}`)",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Run code" }));
    expect(saved().practiced).toBe(true);
    expect(screen.getByRole("status").textContent).toContain(
      "reusable transformation",
    );
    fireEvent.click(screen.getByRole("button", { name: "Finish lesson" }));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "Pick up the thread",
    );
  });
  it("restores legacy drafts at the independent step and keeps hints hidden", () => {
    open({ section: "Practice", draft: "cards.map(c => c.label)", hint: 2 });
    expect(saved().guidedStep).toBe(6);
    expect(
      (
        screen.getByRole("textbox", {
          name: "Practice code",
        }) as HTMLTextAreaElement
      ).value,
    ).toBe("cards.map(c => c.label)");
    expect(screen.queryByRole("button", { name: "Another hint" })).toBeNull();
  });
  it("collapses navigation and expands nested categories", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(saved().sidebarCollapsed).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "React" }));
    expect(saved().sidebarCollapsed).toBe(false);
    expect(
      screen
        .getByRole("button", { name: /Props & state/ })
        .getAttribute("disabled"),
    ).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Progress" }));
    expect(
      screen.getByRole("heading", { name: "Pick up the thread." }),
    ).toBeTruthy();
  });
  it("can recover when browser storage is unavailable", () => {
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("no storage");
      });
    render(<App />);
    expect(screen.getByText("Saving unavailable")).toBeTruthy();
    spy.mockRestore();
  });
});

describe("exercise revision and motion preferences", () => {
  it("rechecks an edited prediction without erasing completion history", () => {
    open({guidedStep:4,predicted:true,completedSteps:[4],prediction:'["Discover","Design","Test"]'});
    const advance=screen.getByRole('button',{name:'Next'}) as HTMLButtonElement;
    expect(advance.disabled).toBe(false);
    fireEvent.change(screen.getByRole('textbox'),{target:{value:'[1,2,3]'}});
    expect(advance.disabled).toBe(true);
    expect(saved().completedSteps).toContain(4);
  });
  it("requires a valid current modification after completing the edit", () => {
    open({guidedStep:5,modified:true,completedSteps:[5],modifyDraft:'card.label.toUpperCase()'});
    const advance=screen.getByRole('button',{name:'Next'}) as HTMLButtonElement;
    expect(advance.disabled).toBe(false);
    fireEvent.change(screen.getByRole('textbox',{name:'Return expression'}),{target:{value:'card.label'}});
    expect(advance.disabled).toBe(true);
    expect(saved().modified).toBe(true);
  });
  it("does not finish an edited incorrect independent solution", () => {
    open({guidedStep:6,practiced:true,completedSteps:[6],draft:'cards.map((c,i) => `${i + 1}. ${c.label}`)'});
    const finish=screen.getByRole('button',{name:'Finish lesson'}) as HTMLButtonElement;
    expect(finish.disabled).toBe(false);
    fireEvent.change(screen.getByRole('textbox',{name:'Practice code'}),{target:{value:'cards.map(c => c.label)'}});
    expect(finish.disabled).toBe(true);
    expect(saved().practiced).toBe(true);
  });
  it("respects reduced motion when moving between activities", () => {
    const original=window.matchMedia;
    window.matchMedia=vi.fn().mockReturnValue({matches:true});
    try { open(); next(); expect(window.scrollTo).toHaveBeenLastCalledWith({top:0,behavior:'auto'}); }
    finally { window.matchMedia=original; }
  });
});
