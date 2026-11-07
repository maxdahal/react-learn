// @vitest-environment jsdom
import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ZenSpeech from "./ZenSpeech";
const voices = [
  { lang: "en-US", name: "English" },
  { lang: "ne-NP", name: "Nepali" },
] as SpeechSynthesisVoice[];
const synth = {
  getVoices: vi.fn(() => voices),
  cancel: vi.fn(),
  speak: vi.fn(),
  paused: false,
  pause: vi.fn(() => {
    synth.paused = true;
  }),
  resume: vi.fn(() => {
    synth.paused = false;
  }),
};
class Utterance {
  text: string;
  constructor(text: string) {
    this.text = text;
  }
}
beforeEach(() => {
  vi.clearAllMocks();
  synth.paused = false;
  synth.getVoices.mockReturnValue(voices);
  vi.stubGlobal("speechSynthesis", synth);
  vi.stubGlobal("SpeechSynthesisUtterance", Utterance);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("plays, pauses, resumes, and replays with a single control at 0.85x in English", () => {
  render(
    <ZenSpeech text="Take your time. One steady step." onNotice={vi.fn()} />,
  );
  expect(synth.speak).not.toHaveBeenCalled();
  expect(screen.getAllByRole("button")).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Play narration" }));
  const utterance = synth.speak.mock.calls[0][0] as SpeechSynthesisUtterance;
  expect(utterance).toMatchObject({
    text: "Take your time. One steady step.",
    lang: "en-US",
    rate: 0.85,
    voice: voices[0],
  });
  fireEvent.click(screen.getByRole("button", { name: "Pause narration" }));
  expect(synth.pause).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole("button", { name: "Resume narration" }));
  expect(synth.resume).toHaveBeenCalledOnce();
  act(() => utterance.onend?.({} as SpeechSynthesisEvent));
  fireEvent.click(screen.getByRole("button", { name: "Replay narration" }));
  expect(synth.speak).toHaveBeenCalledTimes(2);
});
it("cancels paused or playing speech on a new card and ignores cancelled events", () => {
  const { rerender, unmount } = render(
    <ZenSpeech text="First question." onNotice={vi.fn()} />,
  );
  fireEvent.click(screen.getByRole("button"));
  const stale = synth.speak.mock.calls[0][0] as SpeechSynthesisUtterance;
  fireEvent.click(screen.getByRole("button"));
  const before = synth.cancel.mock.calls.length;
  rerender(<ZenSpeech text="Second question." onNotice={vi.fn()} />);
  expect(synth.cancel.mock.calls.length).toBeGreaterThan(before);
  act(() => stale.onend?.({} as SpeechSynthesisEvent));
  expect(screen.getByRole("button", { name: "Play narration" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Play narration" }));
  expect(synth.resume).toHaveBeenCalledOnce();
  expect(synth.speak).toHaveBeenCalledTimes(2);
  expect(synth.paused).toBe(false);
  const last = synth.cancel.mock.calls.length;
  unmount();
  expect(synth.cancel.mock.calls.length).toBeGreaterThan(last);
});
it("explains unavailable voices without using a non-English voice and retries later", () => {
  const onNotice = vi.fn();
  synth.getVoices.mockReturnValue([voices[1]]);
  render(<ZenSpeech text="A question." onNotice={onNotice} />);
  fireEvent.click(screen.getByRole("button"));
  expect(synth.speak).not.toHaveBeenCalled();
  expect(onNotice).toHaveBeenLastCalledWith(
    expect.stringContaining("English voice isn’t available"),
  );
  synth.getVoices.mockReturnValue(voices);
  fireEvent.click(screen.getByRole("button"));
  expect(synth.speak).toHaveBeenCalledOnce();
});
it("keeps written guidance available without browser speech support", () => {
  vi.stubGlobal("speechSynthesis", undefined);
  const onNotice = vi.fn();
  render(<ZenSpeech text="A question." onNotice={onNotice} />);
  fireEvent.click(screen.getByRole("button"));
  expect(onNotice).toHaveBeenLastCalledWith(
    expect.stringContaining("doesn’t support narration"),
  );
});
