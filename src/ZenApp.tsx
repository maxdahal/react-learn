import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Leaf } from "lucide-react";
import ZenSpeech from "./ZenSpeech";
import { zenLessons } from "./zenLessons";
import {
  readZenProgress,
  zenStorageKey,
  type ZenProgress,
} from "./zenProgress";
import "./zen.css";

function GeneratorCard({
  progress,
  setProgress,
}: {
  progress: ZenProgress;
  setProgress: React.Dispatch<React.SetStateAction<ZenProgress>>;
}) {
  const { index, language } = progress;
  const lesson = zenLessons[index];
  const nepali = language === "ne-NP";
  const [hintLevel, setHintLevel] = useState(0);
  const [notice, setNotice] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const primary = useRef<HTMLButtonElement>(null);
  const checking = useRef(false);
  const value = progress.answers[index] ?? lesson.starter;
  const hint = hintLevel
    ? lesson.hints[language][
        Math.min(hintLevel - 1, lesson.hints[language].length - 1)
      ]
    : "";

  useEffect(() => {
    const field = input.current;
    if (!field) {
      primary.current?.focus();
      return;
    }
    field.focus({ preventScroll: true });
    const blank = field.value.indexOf("_____");
    if (blank >= 0) field.setSelectionRange(blank, blank + 5);
    else field.setSelectionRange(field.value.length, field.value.length);
  }, []);

  function advance() {
    setProgress((previous) =>
      previous.index !== index
        ? previous
        : {
            ...previous,
            completed: [...new Set([...previous.completed, index])],
            index: Math.min(index + 1, zenLessons.length - 1),
            escaped:
              index === zenLessons.length - 1 &&
              previous.completed.filter((i) => i !== index).length ===
                zenLessons.length - 1,
          },
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (checking.current) return;
    checking.current = true;
    try {
      const correct =
        lesson.kind === "code"
          ? (await import("./zenValidation")).checkZenAnswer(index, value)
          : lesson.kind === "principle" || progress.nativeSeen;
      if (correct) advance();
      else setHintLevel((level) => level + 1);
    } catch {
      setNotice(
        nepali
          ? "अहिले उत्तर जाँच्न सकेनौँ। फेरि प्रयास गर्नुहोस्।"
          : "We couldn’t load the answer checker. Please try Continue again.",
      );
    } finally {
      checking.current = false;
    }
  }

  return (
    <article className="zen-card rounded-3xl" aria-labelledby="zen-question">
      <span className="zen-eyebrow">
        {nepali ? "एउटा सानो कदम" : "One small step"}
      </span>
      <div className="zen-question-row">
        <h1 id="zen-question">{lesson.question[language]}</h1>
        <ZenSpeech
          text={`${lesson.question[language]} ${lesson.description[language]}`}
          language={language}
          onNotice={setNotice}
        />
      </div>
      <p className="zen-description">{lesson.description[language]}</p>
      {lesson.context && <code className="zen-context">{lesson.context}</code>}
      <form onSubmit={submit} className="zen-form">
        {lesson.kind === "code" && (
          <input
            ref={input}
            className="zen-input"
            aria-label={nepali ? "तपाईंको कोड" : "Your code"}
            aria-describedby={hint ? "zen-hint" : undefined}
            value={value}
            maxLength={2000}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            onChange={(event) => {
              const answer = event.target.value;
              setProgress((previous) => ({
                ...previous,
                answers: { ...previous.answers, [index]: answer },
              }));
            }}
          />
        )}
        {lesson.kind === "platform" && (
          <button
            type="button"
            role="switch"
            aria-checked={progress.platform === "native"}
            aria-label={nepali ? "Native दृश्य" : "Native view"}
            className="zen-platform"
            onClick={() => {
              setProgress((previous) => ({
                ...previous,
                platform: previous.platform === "web" ? "native" : "web",
                nativeSeen: true,
              }));
              primary.current?.focus();
            }}
          >
            <span className="zen-platform-labels">
              <span className={progress.platform === "web" ? "selected" : ""}>
                Web
              </span>
              <span
                className={progress.platform === "native" ? "selected" : ""}
              >
                Native
              </span>
            </span>
            <code>{progress.platform === "web" ? "<div />" : "<View />"}</code>
          </button>
        )}
        <div className="zen-feedback" aria-live="polite" aria-atomic="true">
          {hint && (
            <p id="zen-hint" className="zen-hint">
              {hint}
            </p>
          )}
          {notice && <p className="zen-notice">{notice}</p>}
        </div>
        <button ref={primary} className="zen-primary" type="submit">
          <span>
            {lesson.kind === "principle"
              ? nepali
                ? "रियाक्टलाई नयाँ अब्जेक्ट रेफरेन्स दिनुहोस्"
                : "Give React a new object reference"
              : lesson.kind === "platform"
                ? nepali
                  ? "कुहिरो हट्न दिनुहोस्"
                  : "Let the Fog clear"
                : nepali
                  ? "अगाडि बढ्नुहोस्"
                  : "Continue"}
          </span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
        <span className="zen-enter" aria-hidden="true">
          {nepali ? "वा Enter थिच्नुहोस्" : "or press Enter"} <span>↵</span>
        </span>
      </form>
    </article>
  );
}

export default function ZenApp() {
  const [progress, setProgress] = useState(readZenProgress);
  const [saving, setSaving] = useState(true);
  const reducedMotion = useReducedMotion();
  const nepali = progress.language === "ne-NP";
  const complete = progress.escaped;
  const count = zenLessons.length;

  useEffect(() => {
    try {
      localStorage.setItem(zenStorageKey, JSON.stringify(progress));
      setSaving(true);
    } catch {
      setSaving(false);
    }
  }, [progress]);
  useEffect(() => {
    document.documentElement.lang = nepali ? "ne" : "en";
  }, [nepali]);

  return (
    <div className="zen-shell min-h-svh bg-slate-900 text-slate-50">
      <div
        className="zen-progress-track"
        role="progressbar"
        aria-label={nepali ? "सिकाइको प्रगति" : "Learning progress"}
        aria-valuemin={0}
        aria-valuemax={count}
        aria-valuenow={progress.completed.length}
        aria-valuetext={
          complete
            ? nepali
              ? "१६ चरण पूरा"
              : "All 16 generators complete"
            : `Generator ${progress.index + 1} of ${count}`
        }
      >
        <div
          style={{ width: `${(progress.completed.length / count) * 100}%` }}
        />
      </div>
      <header className="zen-header">
        <a
          className="zen-brand"
          href="#main"
          aria-label="Zen Fog: React & JS Survival"
        >
          <Leaf size={18} aria-hidden="true" />
          <span>
            Zen Fog<span className="zen-subtitle">React & JS Survival</span>
          </span>
        </a>
        <div className="zen-language" role="group" aria-label="Lesson language">
          <button
            type="button"
            aria-label="English"
            aria-pressed={!nepali}
            onClick={() =>
              setProgress((previous) => ({ ...previous, language: "en-US" }))
            }
          >
            EN
          </button>
          <button
            type="button"
            aria-label="नेपाली"
            aria-pressed={nepali}
            onClick={() =>
              setProgress((previous) => ({ ...previous, language: "ne-NP" }))
            }
          >
            NP
          </button>
        </div>
      </header>
      <main id="main" className="zen-main">
        <div className="zen-step-line">
          <span>
            {complete
              ? nepali
                ? "१६ चरण पूरा"
                : "All 16 generators complete"
              : nepali
                ? `जेनेरेटर ${progress.index + 1} / ${count}`
                : `Generator ${progress.index + 1} of ${count}`}
          </span>
          {!complete && progress.index > 0 && (
            <button
              className="zen-back"
              type="button"
              onClick={() =>
                setProgress((previous) => ({
                  ...previous,
                  index: Math.max(0, previous.index - 1),
                }))
              }
            >
              <ArrowLeft size={14} aria-hidden="true" />
              {nepali ? "पछाडि" : "Previous"}
            </button>
          )}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            className="zen-transition"
            key={complete ? "complete" : progress.index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.18 }}
          >
            {complete ? (
              <article
                className="zen-card zen-complete rounded-3xl"
                aria-labelledby="zen-finish"
              >
                <div className="zen-complete-icon">
                  <Check size={24} aria-hidden="true" />
                </div>
                <h1 id="zen-finish">
                  {nepali ? "कुहिरो हट्यो।" : "The Fog clears."}
                </h1>
                <p className="zen-description">
                  {nepali
                    ? "हरेक सानो कदमले तपाईंलाई यहाँ ल्यायो। जहिले पनि फर्कन सक्नुहुन्छ।"
                    : "One small step at a time brought you here. You can return whenever you like."}
                </p>
                <button
                  type="button"
                  className="zen-primary"
                  autoFocus
                  onClick={() =>
                    setProgress((previous) => ({
                      ...previous,
                      index: 0,
                      escaped: false,
                    }))
                  }
                >
                  {nepali
                    ? "पहिलो जेनेरेटरमा फर्कनुहोस्"
                    : "Return to generator 1"}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </article>
            ) : (
              <GeneratorCard progress={progress} setProgress={setProgress} />
            )}
          </motion.div>
        </AnimatePresence>
        <p className="zen-save-note">
          {saving
            ? nepali
              ? "यही उपकरणमा प्रगति सुरक्षित छ। आफ्नो गतिमा सिक्नुहोस्।"
              : "Saved on this device. Take your time."
            : nepali
              ? "अहिले यो ट्याबमा सिक्न सक्नुहुन्छ। प्रगति सुरक्षित गर्न ब्राउजरको भण्डारण खोल्नुहोस्।"
              : "You can keep learning here. Enable browser storage to save for later."}
        </p>
      </main>
    </div>
  );
}
