// @vitest-environment jsdom
import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  readTrial,
  repairGenerator,
  scoreSkillCheck,
  trialStorageKey,
  verifiedRepairs,
} from "./fogGame";
import SkillCheck from "./SkillCheck";
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("skill check scoring and repair integrity", () => {
  it("distinguishes misses, good checks, and the perfect sector", () => {
    expect(scoreSkillCheck(0.61)).toBe("miss");
    expect(scoreSkillCheck(0.62)).toBe("good");
    expect(scoreSkillCheck(0.73)).toBe("perfect");
    expect(scoreSkillCheck(0.77)).toBe("perfect");
    expect(scoreSkillCheck(0.84)).toBe("good");
    expect(scoreSkillCheck(0.85)).toBe("miss");
    expect(scoreSkillCheck(NaN)).toBe("miss");
  });
  it("does not award failed, unverified, or duplicate repairs", () => {
    const trial = readTrial();
    expect(repairGenerator(trial, 0, "perfect", false)).toBe(trial);
    expect(repairGenerator(trial, 0, "miss", true)).toBe(trial);
    const repaired = repairGenerator(trial, 0, "perfect", true);
    expect(repaired.repaired).toEqual([0]);
    expect(repaired.perfect).toEqual([0]);
    expect(repairGenerator(repaired, 0, "good", true)).toBe(repaired);
    expect(verifiedRepairs(repaired, { explored: [], solved: [0] })).toEqual(
      [],
    );
  });
  it("sanitizes saved trial data and defaults to assist for reduced motion", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    localStorage.setItem(
      trialStorageKey,
      JSON.stringify({
        repaired: [0, 0, 16, -1],
        perfect: [0, 1],
        assisted: false,
      }),
    );
    expect(readTrial()).toMatchObject({
      repaired: [0],
      perfect: [0],
      assisted: true,
    });
    localStorage.setItem(trialStorageKey, "bad");
    expect(readTrial().repaired).toEqual([]);
  });
  it("scores a perfect timed Space press", () => {
    let frame: FrameRequestCallback = () => {};
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((fn: FrameRequestCallback) => {
        frame = fn;
        return 1;
      }),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.spyOn(performance, "now").mockReturnValue(0);
    const result = vi.fn();
    render(
      <SkillCheck
        eligible
        repaired={false}
        assisted={false}
        onAssist={() => {}}
        onResult={result}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start skill check" }));
    act(() => frame(3400 * 0.75));
    fireEvent.keyDown(document.body, { code: "Space" });
    expect(result).toHaveBeenCalledWith("perfect");
    expect(result).toHaveBeenCalledTimes(1);
  });
  it("allows an untimed assisted check after a timed miss", () => {
    let frame: FrameRequestCallback = () => {};
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((fn: FrameRequestCallback) => {
        frame = fn;
        return 1;
      }),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.spyOn(performance, "now").mockReturnValue(0);
    const result = vi.fn();
    const view = render(
      <SkillCheck
        eligible
        repaired={false}
        assisted={false}
        onAssist={() => {}}
        onResult={result}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start skill check" }));
    act(() => frame(3400));
    expect(result).toHaveBeenCalledWith("miss");
    view.rerender(
      <SkillCheck
        eligible
        repaired={false}
        assisted
        onAssist={() => {}}
        onResult={result}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Complete assisted skill check" }),
    );
    expect(result).toHaveBeenLastCalledWith("good");
  });
});
