// @vitest-environment jsdom
import { act, renderHook, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import useFogSound from "./useFogSound";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("optional Fog effects", () => {
  it("creates no audio context while effects are off", () => {
    const ctor = vi.fn();
    vi.stubGlobal("AudioContext", ctor);
    const { result } = renderHook(() => useFogSound(false));
    act(() => result.current("perfect"));
    expect(ctor).not.toHaveBeenCalled();
  });
  it("plays short quiet notes only after an enabled interaction and closes on unmount", () => {
    const gains: ReturnType<typeof vi.fn>[] = [];
    const oscillators: unknown[] = [];
    const close = vi.fn().mockResolvedValue(undefined);
    const ctor = vi.fn(function () {
      return {
        currentTime: 0,
        destination: {},
        resume: vi.fn().mockResolvedValue(undefined),
        suspend: vi.fn().mockResolvedValue(undefined),
        close,
        createOscillator: () => {
          const oscillator = {
            type: "sine",
            frequency: { value: 0 },
            connect: vi.fn(),
            start: vi.fn(),
            stop: vi.fn(),
          };
          oscillators.push(oscillator);
          return oscillator;
        },
        createGain: () => {
          const gain = vi.fn();
          gains.push(gain);
          return {
            gain: {
              setValueAtTime: vi.fn(),
              linearRampToValueAtTime: gain,
              exponentialRampToValueAtTime: vi.fn(),
            },
            connect: vi.fn(),
          };
        },
      };
    });
    vi.stubGlobal("AudioContext", ctor);
    const { result, unmount } = renderHook(() => useFogSound(true));
    expect(ctor).not.toHaveBeenCalled();
    act(() => result.current("perfect"));
    expect(oscillators).toHaveLength(3);
    expect(gains.every((g) => g.mock.calls[0][0] === 0.025)).toBe(true);
    unmount();
    expect(close).toHaveBeenCalled();
  });
});
