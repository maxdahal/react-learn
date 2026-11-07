import { useEffect, useRef, useState } from "react";
import { Volume2, Square } from "lucide-react";
import type { ZenLanguage } from "./zenLessons";

export default function ZenSpeech({
  text,
  language,
  onNotice,
}: {
  text: string;
  language: ZenLanguage;
  onNotice: (notice: string) => void;
}) {
  const [speaking, setSpeaking] = useState(false);
  const generation = useRef(0);
  const notice = useRef(onNotice);
  notice.current = onNotice;

  useEffect(() => {
    generation.current++;
    setSpeaking(false);
    notice.current("");
    window.speechSynthesis?.cancel();
    return () => {
      generation.current++;
      window.speechSynthesis?.cancel();
    };
  }, [text, language]);

  function toggleSpeech() {
    const synth = window.speechSynthesis;
    if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
      onNotice(
        language === "ne-NP"
          ? "यस ब्राउजरमा वाचन उपलब्ध छैन। यहाँको पाठ पढ्न सक्नुहुन्छ।"
          : "This browser doesn’t support narration. The text is here whenever you need it.",
      );
      return;
    }
    generation.current++;
    synth.cancel();
    if (speaking) {
      setSpeaking(false);
      return;
    }
    const voices = synth.getVoices();
    const voice =
      voices.find((v) => v.lang.toLowerCase() === language.toLowerCase()) ??
      voices.find(
        (v) => v.lang.toLowerCase().split(/[-_]/)[0] === language.split("-")[0],
      );
    if (!voice) {
      onNotice(
        language === "ne-NP"
          ? "यस उपकरणमा नेपाली आवाज उपलब्ध छैन। नेपाली पाठ यहाँ पढ्न सक्नुहुन्छ।"
          : "An English voice isn’t available yet on this device. You can try again when your browser’s voices are ready.",
      );
      return;
    }
    onNotice("");
    const current = generation.current;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.voice = voice;
    utterance.rate = 0.85;
    utterance.onend = () => {
      if (current === generation.current) setSpeaking(false);
    };
    utterance.onerror = () => {
      if (current !== generation.current) return;
      setSpeaking(false);
      onNotice(
        language === "ne-NP"
          ? "अहिले वाचन चल्न सकेन। चाहनुहुन्छ भने फेरि प्रयास गर्नुहोस्।"
          : "Narration couldn’t start this time. You can try the speaker again.",
      );
    };
    setSpeaking(true);
    try {
      synth.speak(utterance);
    } catch {
      utterance.onerror({} as SpeechSynthesisErrorEvent);
    }
  }

  return (
    <button
      type="button"
      className="zen-speaker"
      onClick={toggleSpeech}
      aria-label={
        speaking
          ? language === "ne-NP"
            ? "वाचन रोक्नुहोस्"
            : "Stop narration"
          : language === "ne-NP"
            ? "यो चरण सुन्नुहोस्"
            : "Read this step aloud"
      }
      aria-pressed={speaking}
      title={
        language === "ne-NP" ? "यो चरण सुन्नुहोस्" : "Read this step aloud"
      }
    >
      {speaking ? (
        <Square size={17} aria-hidden="true" />
      ) : (
        <Volume2 size={19} aria-hidden="true" />
      )}
    </button>
  );
}
