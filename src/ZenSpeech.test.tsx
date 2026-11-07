// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
};
class Utterance {
  text: string;
  constructor(text: string) {
    this.text = text;
  }
}
beforeEach(() => {
  vi.clearAllMocks();
  synth.getVoices.mockReturnValue(voices);
  vi.stubGlobal("speechSynthesis", synth);
  vi.stubGlobal("SpeechSynthesisUtterance", Utterance);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("uses one manual speaker control, fixed calm rate, and the matching voice", () => {
  const onNotice = vi.fn();
  render(
    <ZenSpeech text="Take your time." language="en-US" onNotice={onNotice} />,
  );
  expect(synth.speak).not.toHaveBeenCalled();
  expect(screen.getAllByRole("button")).toHaveLength(1);
  fireEvent.click(screen.getByRole("button"));
  expect(synth.speak.mock.calls[0][0]).toMatchObject({
    text: "Take your time.",
    lang: "en-US",
    rate: 0.85,
    voice: voices[0],
  });
  fireEvent.click(screen.getByRole("button", { name: "Stop narration" }));
  expect(synth.cancel).toHaveBeenCalled();
  expect(synth.speak).toHaveBeenCalledTimes(1);
});
it("cancels stale speech when language or question changes and on unmount", () => {
  const onNotice = vi.fn();
  const { rerender, unmount } = render(
    <ZenSpeech text="Hello" language="en-US" onNotice={onNotice} />,
  );
  fireEvent.click(screen.getByRole("button"));
  const before = synth.cancel.mock.calls.length;
  rerender(<ZenSpeech text="नमस्ते" language="ne-NP" onNotice={onNotice} />);
  expect(synth.cancel.mock.calls.length).toBeGreaterThan(before);
  fireEvent.click(screen.getByRole("button"));
  expect(synth.speak.mock.calls[1][0]).toMatchObject({
    lang: "ne-NP",
    rate: 0.85,
    voice: voices[1],
  });
  const last = synth.cancel.mock.calls.length;
  unmount();
  expect(synth.cancel.mock.calls.length).toBeGreaterThan(last);
});
it("explains missing Nepali voices without falling back to English and retries loaded voices", () => {
  const onNotice = vi.fn();
  synth.getVoices.mockReturnValue([voices[0]]);
  render(<ZenSpeech text="नमस्ते" language="ne-NP" onNotice={onNotice} />);
  fireEvent.click(screen.getByRole("button"));
  expect(synth.speak).not.toHaveBeenCalled();
  expect(onNotice).toHaveBeenLastCalledWith(
    expect.stringContaining("नेपाली आवाज उपलब्ध छैन"),
  );
  synth.getVoices.mockReturnValue(voices);
  fireEvent.click(screen.getByRole("button"));
  expect(synth.speak.mock.calls[0][0]).toMatchObject({ voice: voices[1] });
});
it("handles browsers without speech support quietly", () => {
  vi.stubGlobal("speechSynthesis", undefined);
  const onNotice = vi.fn();
  render(<ZenSpeech text="Hello" language="en-US" onNotice={onNotice} />);
  fireEvent.click(screen.getByRole("button"));
  expect(onNotice).toHaveBeenLastCalledWith(
    expect.stringContaining("doesn’t support narration"),
  );
});
