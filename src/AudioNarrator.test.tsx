// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AudioNarrator, { readAudioPreferences } from "./AudioNarrator";
import { narration } from "./narration";
const voices = [
  { lang: "en-US", name: "English" },
  { lang: "ne-NP", name: "Nepali" },
] as SpeechSynthesisVoice[];
let spoken: SpeechSynthesisUtterance[] = [];
const synth = {
  getVoices: vi.fn(() => voices),
  speak: vi.fn((u: SpeechSynthesisUtterance) => {
    spoken.push(u);
    u.onstart?.({} as SpeechSynthesisEvent);
  }),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};
class Utterance {
  text: string;
  lang = "";
  rate = 1;
  voice: SpeechSynthesisVoice | null = null;
  onstart?: () => void;
  onend?: () => void;
  onerror?: () => void;
  constructor(text: string) {
    this.text = text;
  }
}
beforeEach(() => {
  localStorage.clear();
  spoken = [];
  vi.clearAllMocks();
  synth.getVoices.mockReturnValue(voices);
  vi.stubGlobal("speechSynthesis", synth);
  vi.stubGlobal("SpeechSynthesisUtterance", Utterance);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("bilingual narration", () => {
  it("has English and Nepali concept and task scripts for every card", () => {
    for (const lang of ["en-US", "ne-NP"] as const) {
      expect(narration[lang]).toHaveLength(16);
      for (const s of narration[lang])
        for (const value of Object.values(s))
          expect(value.length).toBeGreaterThan(15);
    }
    expect(
      narration["ne-NP"].every((s) => /[\u0900-\u097f]/.test(s.concept)),
    ).toBe(true);
  });
  it("plays, pauses, resumes, and replays using the requested rate and language", () => {
    render(
      <AudioNarrator
        lessonKey="0:0"
        text="Hello"
        preferences={{ language: "en-US", rate: 0.8, autoplay: false }}
        onChange={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Play narration" }));
    expect(spoken[0]).toMatchObject({
      lang: "en-US",
      rate: 0.8,
      text: "Hello",
    });
    fireEvent.click(screen.getByRole("button", { name: "Pause narration" }));
    expect(synth.pause).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Resume narration" }));
    expect(synth.resume).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Replay narration" }));
    expect(spoken).toHaveLength(2);
  });
  it("cancels stale narration and auto-plays the new Nepali script", () => {
    const { rerender, unmount } = render(
      <AudioNarrator
        lessonKey="0:0"
        text="Hello"
        preferences={{ language: "en-US", rate: 1, autoplay: true }}
        onChange={() => {}}
      />,
    );
    rerender(
      <AudioNarrator
        lessonKey="1:0"
        text="नमस्ते"
        preferences={{ language: "ne-NP", rate: 1.25, autoplay: true }}
        onChange={() => {}}
      />,
    );
    expect(spoken.at(-1)).toMatchObject({
      lang: "ne-NP",
      rate: 1.25,
      text: "नमस्ते",
      voice: voices[1],
    });
    const count = synth.cancel.mock.calls.length;
    unmount();
    expect(synth.cancel.mock.calls.length).toBeGreaterThan(count);
  });
  it("does not silently read Nepali with an English voice", () => {
    synth.getVoices.mockReturnValue([voices[0]]);
    render(
      <AudioNarrator
        lessonKey="0"
        text="नमस्ते"
        preferences={{ language: "ne-NP", rate: 1, autoplay: true }}
        onChange={() => {}}
      />,
    );
    expect(
      (
        screen.getByRole("button", {
          name: "Play narration",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(synth.speak).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: "Read narration script" }),
    );
    expect(screen.getByText("नमस्ते")).toBeTruthy();
  });
  it("recovers from corrupt saved preferences", () => {
    localStorage.setItem("deep-dive-audio-v5", "bad");
    expect(readAudioPreferences()).toEqual({
      language: "en-US",
      rate: 0.8,
      autoplay: false,
    });
  });
});
