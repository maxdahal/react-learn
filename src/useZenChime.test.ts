// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import useZenChime from "./useZenChime";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("plays two quiet sine notes only on request, and supports mute and cleanup", () => {
  const tones: {
    type: string;
    frequency: { value: number };
    connect: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  }[] = [];
  const levels: number[] = [];
  const audio = {
    currentTime: 0,
    destination: {},
    resume: vi.fn(() => Promise.resolve()),
    suspend: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => Promise.resolve()),
    createOscillator: () => {
      const tone = {
        type: "",
        frequency: { value: 0 },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };
      tones.push(tone);
      return tone;
    },
    createGain: () => ({
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: (value: number) => levels.push(value),
        exponentialRampToValueAtTime: vi.fn(),
      },
    }),
  };
  vi.stubGlobal(
    "AudioContext",
    class {
      constructor() {
        return audio;
      }
    },
  );
  const { result, rerender, unmount } = renderHook(
    ({ enabled }) => useZenChime(enabled),
    { initialProps: { enabled: true } },
  );
  expect(tones).toHaveLength(0);
  act(() => result.current());
  expect(tones).toHaveLength(2);
  expect(tones.every((tone) => tone.type === "sine")).toBe(true);
  expect(levels).toEqual([0.018, 0.018]);
  rerender({ enabled: false });
  expect(audio.suspend).toHaveBeenCalledOnce();
  act(() => result.current());
  expect(tones).toHaveLength(2);
  unmount();
  expect(audio.close).toHaveBeenCalledOnce();
});
it("does not interrupt learning if Web Audio is unavailable", () => {
  vi.stubGlobal("AudioContext", undefined);
  const { result } = renderHook(() => useZenChime(true));
  expect(() => result.current()).not.toThrow();
});
