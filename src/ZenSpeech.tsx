import { useEffect, useRef, useState } from "react";
import { Volume2, Pause, Play, RotateCcw } from "lucide-react";

type SpeechState = "idle" | "playing" | "paused" | "ended";
export default function ZenSpeech({
  text,
  onNotice,
}: {
  text: string;
  onNotice: (notice: string) => void;
}) {
  const [state, setState] = useState<SpeechState>("idle");
  const generation = useRef(0);
  const notice = useRef(onNotice);
  notice.current = onNotice;
  useEffect(() => {
    generation.current++;
    setState("idle");
    notice.current("");
    window.speechSynthesis?.cancel();
    return () => {
      generation.current++;
      window.speechSynthesis?.cancel();
    };
  }, [text]);

  function activate() {
    const synth = window.speechSynthesis;
    if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
      onNotice(
        "This browser doesn’t support narration. The written guidance is always here.",
      );
      return;
    }
    if (state === "playing") {
      synth.pause();
      setState("paused");
      return;
    }
    if (state === "paused") {
      synth.resume();
      setState("playing");
      return;
    }
    generation.current++;
    synth.cancel();
    const voices = synth.getVoices();
    const voice =
      voices.find((v) => v.lang.toLowerCase() === "en-us") ??
      voices.find((v) => /^en[-_]/i.test(v.lang));
    if (!voice) {
      onNotice(
        "An English voice isn’t available yet on this device. You can try the speaker again when browser voices are ready.",
      );
      return;
    }
    onNotice("");
    // cancel() empties the queue but does not clear the browser's paused state.
    if (synth.paused) synth.resume();
    const current = generation.current;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.voice = voice;
    utterance.onend = () => {
      if (current === generation.current) setState("ended");
    };
    utterance.onerror = () => {
      if (current !== generation.current) return;
      setState("idle");
      onNotice(
        "Narration couldn’t start this time. You can try the speaker again.",
      );
    };
    setState("playing");
    try {
      synth.speak(utterance);
    } catch {
      utterance.onerror({} as SpeechSynthesisErrorEvent);
    }
  }
  const label =
    state === "playing"
      ? "Pause narration"
      : state === "paused"
        ? "Resume narration"
        : state === "ended"
          ? "Replay narration"
          : "Play narration";
  const Icon =
    state === "playing"
      ? Pause
      : state === "paused"
        ? Play
        : state === "ended"
          ? RotateCcw
          : Volume2;
  return (
    <button
      type="button"
      className="zen-speaker"
      onClick={activate}
      aria-label={label}
      title={label}
    >
      <Icon size={20} aria-hidden="true" />
    </button>
  );
}
