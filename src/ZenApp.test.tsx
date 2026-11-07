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
import { zenGenerators, zenMissions } from "./zenLessons";
import {
  emptyZenProgress,
  readZenProgress,
  zenStorageKey,
} from "./zenProgress";
import examples from "./test/zenAnswers.json";
const answers: Record<string, string> = examples;
const audio = vi.hoisted(() => ({ chime: vi.fn() }));
vi.mock("./useZenChime", () => ({
  default: (enabled: boolean) => (enabled ? audio.chime : () => {}),
}));
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  window.matchMedia = vi.fn().mockReturnValue({
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
function seed(generator: number, mission = 0, extra = {}) {
  localStorage.setItem(
    zenStorageKey,
    JSON.stringify({ ...emptyZenProgress(), generator, mission, ...extra }),
  );
}
async function at(generator: number, mission = 0) {
  await waitFor(() =>
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      zenGenerators[generator].missions[mission].question,
    ),
  );
}
async function solve(id: string) {
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: answers[id] },
  });
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  await waitFor(() => expect(readZenProgress().solved).toContain(id));
}
describe("cognitively accessible master flow", () => {
  it("starts with one input, English narration, and no distracting interface", () => {
    render(<ZenApp />);
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
      "const repair = ",
    );
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(document.querySelector("iframe, aside, .monaco-editor")).toBeNull();
    expect(screen.queryByRole("group", { name: "Lesson language" })).toBeNull();
    expect(screen.getByRole("button", { name: "Play narration" })).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Back" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(audio.chime).not.toHaveBeenCalled();
  });
  it("reveals progressive mint hints without erasing a draft or playing a failure sound", async () => {
    render(<ZenApp />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "const repair = function() {}" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText(zenMissions[0].hints[0])).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText(zenMissions[0].hints[1])).toBeTruthy();
    expect(readZenProgress().solved).toEqual([]);
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
      "const repair = function() {}",
    );
    expect(screen.queryByRole("alert")).toBeNull();
    expect(audio.chime).not.toHaveBeenCalled();
  });
  it("uses Enter to check, holds encouragement until Next, and selects the next blank", async () => {
    const user = userEvent.setup();
    render(<ZenApp />);
    await user.type(screen.getByRole("textbox"), "() => {{}", {
      skipClick: true,
    });
    await user.keyboard("{Enter}");
    expect(await screen.findByText(zenMissions[0].success)).toBeTruthy();
    await at(0);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "100",
    );
    expect(audio.chime).toHaveBeenCalledOnce();
    await user.keyboard("{Enter}");
    await at(1);
    const field = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(field.value.slice(field.selectionStart!, field.selectionEnd!)).toBe(
      "_____",
    );
    await user.keyboard("{{ title, isInjured }{Enter}");
    await waitFor(() =>
      expect(readZenProgress().solved).toContain("parameters"),
    );
  });
  it("preserves drafts, Back navigation, and earlier saved work across reloads", async () => {
    localStorage.setItem("zen-fog-progress-v7", '{"completed":[0]}');
    const first = render(<ZenApp />);
    await solve("arrow");
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await at(1);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "my draft" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    await at(0);
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
      answers.arrow,
    );
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await at(1);
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
      "my draft",
    );
    first.unmount();
    render(<ZenApp />);
    await at(1);
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
      "my draft",
    );
    expect(localStorage.getItem("zen-fog-progress-v7")).toBe(
      '{"completed":[0]}',
    );
  });
  it("uses actual functional state updates in the repair meter and resumes partial work", async () => {
    seed(12, 1);
    const first = render(<ZenApp />);
    for (const expected of [25, 50]) {
      fireEvent.click(screen.getByRole("button", { name: "Repair +25" }));
      expect(
        screen
          .getByRole("progressbar", { name: "Live repair meter" })
          .getAttribute("aria-valuenow"),
      ).toBe(String(expected));
    }
    first.unmount();
    render(<ZenApp />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "50",
    );
    fireEvent.click(screen.getByRole("button", { name: "Repair +25" }));
    fireEvent.click(screen.getByRole("button", { name: "Repair +25" }));
    expect(readZenProgress().repairProgress).toBe(100);
    expect(readZenProgress().solved).toContain("state-meter");
    expect(audio.chime).toHaveBeenCalledOnce();
  });
  it("runs every mission, powers the gate only after all 16 generators, and retains review", async () => {
    render(<ZenApp />);
    for (let generator = 0; generator < zenGenerators.length; generator++) {
      for (
        let mission = 0;
        mission < zenGenerators[generator].missions.length;
        mission++
      ) {
        const task = zenGenerators[generator].missions[mission];
        await at(generator, mission);
        if (task.kind === "code") await solve(task.id);
        else if (task.kind === "repair")
          for (let i = 0; i < 4; i++)
            fireEvent.click(screen.getByRole("button", { name: "Repair +25" }));
        else if (task.kind === "platform") {
          fireEvent.click(screen.getByRole("button", { name: "Next" }));
          expect(await screen.findByText(task.hints[0])).toBeTruthy();
          fireEvent.click(
            screen.getByRole("switch", { name: "Native preview" }),
          );
          expect(screen.getByText("<View />")).toBeTruthy();
          fireEvent.click(screen.getByRole("button", { name: "Next" }));
        } else
          fireEvent.click(
            screen.getByRole("button", { name: task.actionLabel }),
          );
        await waitFor(() =>
          expect(readZenProgress().solved).toContain(task.id),
        );
        expect(readZenProgress().escaped).toBe(false);
        fireEvent.click(
          screen.getByRole("button", {
            name: task.id === "compiler" ? "Open Exit Gate" : "Next",
          }),
        );
      }
    }
    expect(
      await screen.findByRole("heading", { name: /The Fog clears/ }),
    ).toBeTruthy();
    expect(readZenProgress().escaped).toBe(true);
    expect(readZenProgress().solved).toHaveLength(25);
    expect(screen.getByRole("button", { name: "Play narration" })).toBeTruthy();
    expect(audio.chime).toHaveBeenCalledTimes(25);
    fireEvent.click(
      screen.getByRole("button", { name: "Return to generator 1" }),
    );
    await at(0);
    expect(readZenProgress().solved).toHaveLength(25);
  });
  it("cannot open the exit with incomplete saved work", async () => {
    seed(15, 2);
    render(<ZenApp />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Reuse eligible calculations and component work",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue repairing" }));
    await at(0);
    expect(readZenProgress().escaped).toBe(false);
  });
  it("lets completion sounds be muted and remembers that preference", async () => {
    render(<ZenApp />);
    fireEvent.click(
      screen.getByRole("button", { name: "Mute completion sound" }),
    );
    await solve("arrow");
    expect(audio.chime).not.toHaveBeenCalled();
    expect(readZenProgress().sound).toBe(false);
  });
  it("remains usable with storage disabled", () => {
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
  it("sanitizes corrupt storage and never invents earned completion", () => {
    localStorage.setItem(zenStorageKey, "broken");
    expect(readZenProgress()).toEqual(emptyZenProgress());
    seed(99, 99, {
      solved: ["arrow", "arrow", "unknown", 2],
      escaped: true,
      repairProgress: -50,
      answers: { arrow: 8, parameters: "draft" },
    });
    expect(readZenProgress()).toMatchObject({
      generator: 15,
      mission: 2,
      solved: ["arrow"],
      escaped: false,
      repairProgress: 0,
      answers: { parameters: "draft" },
    });
  });
});
