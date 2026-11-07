// @vitest-environment jsdom
import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ZenApp from "./ZenApp";
import { zenLessons } from "./zenLessons";
import { readZenProgress, zenStorageKey } from "./zenProgress";

const solutions: Record<number, string> = {
  0: "const run = () => {};",
  1: "const { perk } = survivorLoadout;",
  2: "[...prev, 'Medkit']",
  3: "`survivor-${id}`",
  4: "survivors.map(name => <li>{name}</li>)",
  5: "survivors.filter(s => s.isInjured)",
  6: "chests.flatMap(c => c.items)",
  7: "isInjured ? 'Injured' : 'Healthy'",
  9: "await openExitGate()",
  10: "export default SurvivorHUD;",
  11: "<VideoList><Thumbnail /><LikeButton /></VideoList>",
  12: "key={survivor.id}",
  13: "const [progress, setProgress] = useState(0);",
  14: "<Suspense fallback={<Loading />}><MatchStats /></Suspense>",
};
beforeEach(() => {
  localStorage.clear();
  window.matchMedia = vi
    .fn()
    .mockReturnValue({
      matches: true,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
async function step(index: number) {
  await waitFor(() =>
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      zenLessons[index].question["en-US"],
    ),
  );
}
function seed(index: number, extra = {}) {
  localStorage.setItem(
    zenStorageKey,
    JSON.stringify({ ...readZenProgress(), index, ...extra }),
  );
}
async function answer(index: number) {
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: solutions[index] },
  });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  await step(index + 1);
}
describe("one calm generator at a time", () => {
  it("starts with one input and no old game controls", () => {
    render(<ZenApp />);
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe(
      "const run = ",
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(document.querySelector("iframe, aside, textarea")).toBeNull();
    expect(screen.queryByText("GENERATORS LEFT")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Read this step aloud" }),
    ).toBeTruthy();
  });
  it("reveals progressive hints without changing a draft or completion", async () => {
    render(<ZenApp />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "const run = function() {}" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      await screen.findByText(
        "Place an arrow between the parentheses and the body.",
      ),
    ).toBeTruthy();
    expect(readZenProgress().completed).toEqual([]);
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe(
      "const run = function() {}",
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      await screen.findByText("Try () => {} after const run =."),
    ).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it("advances with Enter and selects the next missing piece", async () => {
    const user = userEvent.setup();
    render(<ZenApp />);
    await user.type(screen.getByRole("textbox"), "() => {{}", {
      skipClick: true,
    });
    await user.keyboard("{Enter}");
    await step(1);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value.slice(input.selectionStart!, input.selectionEnd!)).toBe(
      "_____",
    );
    await user.keyboard("perk{Enter}");
    await step(2);
    expect(readZenProgress().completed).toEqual([0, 1]);
  });
  it("keeps drafts, previous navigation, language, and prior versions across remounts", async () => {
    localStorage.setItem("fog-survival-trial-v6", '{"repairs":[0]}');
    const { unmount } = render(<ZenApp />);
    await answer(0);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "my draft" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    await step(0);
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe(
      solutions[0],
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await step(1);
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe(
      "my draft",
    );
    fireEvent.click(screen.getByRole("button", { name: "नेपाली" }));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      zenLessons[1].question["ne-NP"],
    );
    unmount();
    render(<ZenApp />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      zenLessons[1].question["ne-NP"],
    );
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe(
      "my draft",
    );
    expect(localStorage.getItem("fog-survival-trial-v6")).toBe(
      '{"repairs":[0]}',
    );
  });
  it("completes all sixteen generators and allows a calm review", async () => {
    render(<ZenApp />);
    for (let i = 0; i < 15; i++) {
      await step(i);
      if (i === 8) {
        expect(screen.queryByRole("textbox")).toBeNull();
        fireEvent.click(
          screen.getByRole("button", {
            name: "Give React a new object reference",
          }),
        );
        await step(9);
      } else await answer(i);
    }
    expect(screen.getByText("<div />")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Let the Fog clear" }));
    expect(
      await screen.findByText(
        "Switch to Native once to see View instead of div.",
      ),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("switch", { name: "Native view" }));
    expect(screen.getByText("<View />")).toBeTruthy();
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe(
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "Let the Fog clear" }));
    expect(
      await screen.findByRole("heading", { name: "The Fog clears." }),
    ).toBeTruthy();
    expect(readZenProgress().completed).toHaveLength(16);
    expect(readZenProgress().escaped).toBe(true);
    fireEvent.click(
      screen.getByRole("button", { name: "Return to generator 1" }),
    );
    await step(0);
    expect(readZenProgress().completed).toHaveLength(16);
  });
  it("is usable when saving is unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw Error("disabled");
    });
    render(<ZenApp />);
    expect(
      screen.getByText(
        "You can keep learning here. Enable browser storage to save for later.",
      ),
    ).toBeTruthy();
    expect(screen.getByRole("textbox")).toBeTruthy();
  });
  it("recovers safely from corrupt storage", () => {
    localStorage.setItem(zenStorageKey, "broken");
    expect(readZenProgress().index).toBe(0);
    seed(99, {
      completed: [0, 0, -1, "1", 99],
      escaped: true,
      answers: { 0: 4, 1: "draft" },
    });
    expect(readZenProgress()).toMatchObject({
      index: 15,
      completed: [0],
      escaped: false,
      answers: { 1: "draft" },
    });
  });
});
