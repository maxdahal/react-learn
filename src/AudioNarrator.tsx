import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import type { Language } from "./narration";
export type AudioPreferences = {
  language: Language;
  rate: number;
  autoplay: boolean;
};
export function readAudioPreferences(): AudioPreferences {
  try {
    const p = JSON.parse(localStorage.getItem("deep-dive-audio-v5") || "null");
    return {
      language: p?.language === "ne-NP" ? "ne-NP" : "en-US",
      rate: [0.8, 1, 1.25].includes(p?.rate) ? p.rate : 0.8,
      autoplay: p?.autoplay === true,
    };
  } catch {
    return { language: "en-US", rate: 0.8, autoplay: false };
  }
}
export default function AudioNarrator({
  text,
  preferences,
  onChange,
  lessonKey,
}: {
  text: string;
  preferences: AudioPreferences;
  onChange: (p: AudioPreferences) => void;
  lessonKey: string;
}) {
  const supported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined";
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [status, setStatus] = useState<"idle" | "playing" | "paused" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const [transcript, setTranscript] = useState(false);
  const generation = useRef(0);
  const utterance = useRef<SpeechSynthesisUtterance | undefined>(undefined);
  const selected =
    voices.find(
      (v) => v.lang.toLowerCase() === preferences.language.toLowerCase(),
    ) ||
    voices.find((v) =>
      v.lang.toLowerCase().startsWith(preferences.language.slice(0, 2)),
    );
  useEffect(() => {
    if (!supported) return;
    const update = () => setVoices(window.speechSynthesis.getVoices());
    update();
    window.speechSynthesis.addEventListener("voiceschanged", update);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", update);
  }, [supported]);
  function stop() {
    generation.current++;
    if (supported) window.speechSynthesis.cancel();
    utterance.current = undefined;
    setStatus("idle");
  }
  function speak() {
    if (!supported || !selected) return;
    const id = ++generation.current;
    window.speechSynthesis.cancel();
    const message = new SpeechSynthesisUtterance(text);
    message.lang = preferences.language;
    message.voice = selected;
    message.rate = preferences.rate;
    utterance.current = message;
    setError("");
    message.onstart = () => {
      if (id === generation.current) setStatus("playing");
    };
    message.onend = () => {
      if (id === generation.current) setStatus("idle");
    };
    message.onerror = (e) => {
      if (
        id !== generation.current ||
        ["canceled", "interrupted"].includes(e.error)
      )
        return;
      setStatus("error");
      setError(
        e.error === "not-allowed"
          ? "Your browser requires a Play click before speaking."
          : "Narration could not start. Try Replay or read the transcript.",
      );
    };
    window.speechSynthesis.speak(message);
  }
  const speakRef = useRef(speak);
  speakRef.current = speak;
  useEffect(() => {
    stop();
    setError("");
    setTranscript(false);
    if (preferences.autoplay && selected) speakRef.current();
    return () => {
      generation.current++;
      if (supported) window.speechSynthesis.cancel();
    };
  }, [
    lessonKey,
    text,
    preferences.language,
    preferences.rate,
    preferences.autoplay,
    selected,
    supported,
  ]);
  function pause() {
    if (!supported) return;
    if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("playing");
    } else if (status === "playing") {
      window.speechSynthesis.pause();
      setStatus("paused");
    }
  }
  return (
    <section className="audio-narrator" aria-label="Lesson narration">
      <div className="audio-top">
        <span>
          <Volume2 size={15} />
          SURVIVOR COMMS
        </span>
        <label className="sr-only" htmlFor="narration-language">
          Narration language
        </label>
        <select
          id="narration-language"
          value={preferences.language}
          onChange={(e) =>
            onChange({ ...preferences, language: e.target.value as Language })
          }
        >
          <option value="en-US">English (US)</option>
          <option value="ne-NP">नेपाली (ne-NP)</option>
        </select>
      </div>
      <div className="audio-controls">
        <button
          aria-label="Play narration"
          disabled={!supported || !selected}
          onClick={speak}
        >
          <Play size={14} />
          Play
        </button>
        <button
          aria-label={
            status === "paused" ? "Resume narration" : "Pause narration"
          }
          disabled={!["playing", "paused"].includes(status)}
          onClick={pause}
        >
          {status === "paused" ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <button
          aria-label="Replay narration"
          disabled={!supported || !selected}
          onClick={speak}
        >
          <RotateCcw size={14} />
        </button>
        <label>
          <span className="sr-only">Playback speed</span>
          <select
            aria-label="Playback speed"
            value={preferences.rate}
            onChange={(e) =>
              onChange({ ...preferences, rate: Number(e.target.value) })
            }
          >
            <option value={0.8}>0.8x</option>
            <option value={1}>1.0x</option>
            <option value={1.25}>1.25x</option>
          </select>
        </label>
        <span
          className={"audio-wave " + (status === "playing" ? "speaking" : "")}
          aria-label={"Narration " + status}
        >
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>
      <label className="audio-autoplay">
        <input
          type="checkbox"
          checked={preferences.autoplay}
          onChange={(e) =>
            onChange({ ...preferences, autoplay: e.target.checked })
          }
        />
        Auto-play on the next task
      </label>
      {(!supported || !selected || error) && (
        <p className="audio-notice" role="status">
          {!supported
            ? "Speech is unavailable in this browser. Read the transcript below."
            : error ||
              `${preferences.language === "ne-NP" ? "Nepali" : "English"} narration needs a matching system voice. The script is available below.`}
        </p>
      )}
      <button
        className="audio-transcript-toggle"
        aria-expanded={transcript}
        onClick={() => setTranscript(!transcript)}
      >
        {transcript ? "Hide transcript" : "Read narration script"}
      </button>
      {transcript && (
        <p className="audio-transcript" lang={preferences.language}>
          {text}
        </p>
      )}
    </section>
  );
}
