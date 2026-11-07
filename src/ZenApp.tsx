import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  type RefObject,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BellOff,
  Check,
  Leaf,
  Menu,
  Sparkles,
} from "lucide-react";
import ZenSpeech from "./ZenSpeech";
import ZenDrawer from "./ZenDrawer";
import useZenChime from "./useZenChime";
import {
  allGeneratorsComplete,
  generatorComplete,
  zenGenerators,
} from "./zenLessons";
import {
  adjacentMission,
  readZenProgress,
  zenStorageKey,
  type ZenProgress,
} from "./zenProgress";
import "./zen.css";

type ProgressSetter = Dispatch<SetStateAction<ZenProgress>>;
function GeneratorCard({
  progress,
  setProgress,
  chime,
  menuOpen,
  activeMission,
}: {
  progress: ZenProgress;
  setProgress: ProgressSetter;
  chime: () => void;
  menuOpen: boolean;
  activeMission: RefObject<string>;
}) {
  const { generator, mission } = progress;
  const group = zenGenerators[generator];
  const task = group.missions[mission];
  const solved = progress.solved.includes(task.id);
  const [hintLevel, setHintLevel] = useState(0);
  const [notice, setNotice] = useState("");
  const [justSolved, setJustSolved] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const primary = useRef<HTMLButtonElement>(null);
  const choice = useRef<HTMLSelectElement>(null);
  const checking = useRef(false);
  const value = progress.answers[task.id] ?? task.starter ?? "";
  const latestValue = useRef(value);
  latestValue.current = value;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    window.scrollTo({ top: 0, behavior: "auto" });
    return () => {
      mounted.current = false;
    };
  }, []);
  const hint = hintLevel
    ? task.hints[Math.min(hintLevel - 1, task.hints.length - 1)]
    : "";
  const finalMission =
    generator === zenGenerators.length - 1 &&
    mission === group.missions.length - 1;
  const completed = group.missions.filter((m) =>
    progress.solved.includes(m.id),
  ).length;
  const meter =
    task.kind === "repair"
      ? progress.repairProgress
      : Math.round((completed / group.missions.length) * 100);

  useEffect(() => {
    if (solved || !input.current) {
      if (!solved && choice.current)
        choice.current.focus({ preventScroll: true });
      else primary.current?.focus({ preventScroll: true });
      return;
    }
    const field = input.current;
    field.focus({ preventScroll: true });
    const blank = field.value.indexOf("_____");
    field.setSelectionRange(
      blank >= 0 ? blank : field.value.length,
      blank >= 0 ? blank + 5 : field.value.length,
    );
  }, [solved]);

  useLayoutEffect(() => {
    const field = input.current;
    if (!field) return;
    const resize = () => {
      field.style.height = "auto";
      field.style.height = `${field.scrollHeight + 2}px`;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [value]);

  function earnMission() {
    setProgress((previous) =>
      previous.generator !== generator || previous.mission !== mission
        ? previous
        : { ...previous, solved: [...new Set([...previous.solved, task.id])] },
    );
    setHintLevel(0);
    setJustSolved(true);
    chime();
  }
  function next() {
    setProgress((previous) => {
      if (previous.generator !== generator || previous.mission !== mission)
        return previous;
      if (finalMission) {
        if (allGeneratorsComplete(previous.solved))
          return { ...previous, escaped: true };
        const generator = zenGenerators.findIndex(
          (group) => !generatorComplete(group, previous.solved),
        );
        const mission = zenGenerators[generator].missions.findIndex(
          (task) => !previous.solved.includes(task.id),
        );
        return { ...previous, generator, mission };
      }
      return { ...previous, ...adjacentMission(generator, mission, 1) };
    });
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (checking.current) return;
    if (solved) {
      next();
      return;
    }
    if (task.kind === "repair") {
      // This is actual React state, updated from its previous value on each event.
      setProgress((previous) => {
        const repairProgress = Math.min(100, previous.repairProgress + 25);
        return {
          ...previous,
          repairProgress,
          solved:
            repairProgress === 100
              ? [...new Set([...previous.solved, task.id])]
              : previous.solved,
        };
      });
      if (progress.repairProgress === 75) {
        setJustSolved(true);
        chime();
      }
      return;
    }
    checking.current = true;
    try {
      const validator =
        task.kind === "code" ? await import("./zenValidation") : null;
      if (
        !mounted.current ||
        activeMission.current !== task.id ||
        latestValue.current !== value
      )
        return;
      const correct =
        task.kind === "code"
          ? validator!.checkZenAnswer(task.id, value)
          : task.kind === "choice"
            ? value === task.correctChoice
            : task.kind === "principle" || progress.nativeSeen;
      if (correct) earnMission();
      else setHintLevel((level) => level + 1);
    } catch {
      if (!mounted.current || activeMission.current !== task.id) return;
      setNotice(
        "The answer checker couldn’t load. Your draft is safe; try Next again when you’re ready.",
      );
    } finally {
      checking.current = false;
    }
  }

  return (
    <article className="zen-card rounded-3xl" aria-labelledby="zen-question">
      <div className="zen-eyebrow">
        {group.topic}
        {group.missions.length > 1 && (
          <span>
            {" "}
            · {mission + 1} of {group.missions.length}
          </span>
        )}
      </div>
      <section className="zen-tip" aria-labelledby="zen-tip-label">
        <div className="zen-tip-heading">
          <span id="zen-tip-label">Tip & concept</span>
          <ZenSpeech
            text={`${task.concept.join(" ")} ${task.question} ${task.description}`}
            suspend={menuOpen}
            onNotice={setNotice}
          />
        </div>
        <p id="zen-concept" className="zen-concept">
          {task.concept.join(" ")}
        </p>
      </section>
      <h1 id="zen-question">{task.question}</h1>
      <p id="zen-instruction" className="zen-description">
        {task.description}
      </p>
      {task.context && <code className="zen-context">{task.context}</code>}
      <form onSubmit={submit} className="zen-form">
        {task.kind === "code" && (
          <textarea
            rows={1}
            ref={input}
            className="zen-input"
            aria-label="Your code"
            value={value}
            aria-describedby={`zen-concept zen-instruction${hint ? " zen-hint" : ""}`}
            readOnly={solved}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            maxLength={2000}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            onChange={(event) => {
              const answer = event.target.value;
              setProgress((previous) => ({
                ...previous,
                answers: { ...previous.answers, [task.id]: answer },
              }));
            }}
          />
        )}
        {task.kind === "choice" && (
          <select
            ref={choice}
            className="zen-input zen-select"
            aria-label="RSC data fetching pattern"
            aria-describedby={`zen-concept zen-instruction${hint ? " zen-hint" : ""}`}
            value={value}
            disabled={solved}
            onChange={(event) => {
              const answer = event.target.value;
              setProgress((previous) => ({
                ...previous,
                answers: { ...previous.answers, [task.id]: answer },
              }));
            }}
          >
            <option value="">Choose a pattern…</option>
            {task.choices?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        {task.kind === "platform" && (
          <button
            type="button"
            role="switch"
            aria-checked={progress.platform === "native"}
            aria-label="Native preview"
            className="zen-platform"
            onClick={() => {
              setProgress((previous) => ({
                ...previous,
                platform: previous.platform === "web" ? "native" : "web",
                nativeSeen: true,
              }));
              primary.current?.focus({ preventScroll: true });
            }}
          >
            <span>
              <span className="zen-platform-name">
                {progress.platform === "web"
                  ? "Web (DOM)"
                  : "Mobile Native View"}
              </span>
              <span className="zen-platform-detail">
                {progress.platform === "web"
                  ? "DOM HTML"
                  : "iOS / Android View"}
              </span>
            </span>
            <code>{progress.platform === "web" ? "<div />" : "<View />"}</code>
          </button>
        )}
        <div className="zen-feedback" aria-live="polite" aria-atomic="true">
          {hint && !solved && (
            <p id="zen-hint" className="zen-hint">
              {hint}
            </p>
          )}
          {solved && (
            <p className="zen-success">
              <Check size={18} aria-hidden="true" />
              <span>{task.success}</span>
            </p>
          )}
          {notice && <p className="zen-notice">{notice}</p>}
        </div>
        <div className="zen-meter-label">
          <span>
            {task.kind === "repair"
              ? "Live repair meter"
              : generatorComplete(group, progress.solved)
                ? "Generator repaired"
                : "Generator progress"}
          </span>
          <span>{meter}%</span>
        </div>
        <div
          className={`zen-meter ${justSolved ? "zen-meter-earned" : ""}`}
          role="progressbar"
          aria-label={
            task.kind === "repair" ? "Live repair meter" : "Generator progress"
          }
          aria-valuenow={meter}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div style={{ width: `${meter}%` }} />
          {justSolved && (
            <Sparkles
              className="zen-spark"
              style={{ left: `calc(${meter}% - 9px)` }}
              size={18}
              aria-hidden="true"
            />
          )}
        </div>
        <div className="zen-actions">
          <button
            type="button"
            className="zen-back"
            disabled={generator === 0 && mission === 0}
            onClick={() =>
              setProgress((previous) => ({
                ...previous,
                ...adjacentMission(previous.generator, previous.mission, -1),
              }))
            }
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Back
          </button>
          <button ref={primary} type="submit" className="zen-primary">
            {solved
              ? finalMission
                ? allGeneratorsComplete(progress.solved)
                  ? "Open Exit Gate"
                  : "Continue repairing"
                : "Next"
              : task.kind === "repair" || task.kind === "principle"
                ? task.actionLabel
                : "Next"}
            {task.kind !== "repair" || solved ? (
              <ArrowRight size={18} aria-hidden="true" />
            ) : null}
          </button>
        </div>
        <span className="zen-enter" aria-hidden="true">
          {solved
            ? "Continue when you’re ready"
            : task.kind === "code"
              ? "Enter to check your code"
              : "Enter to continue"}{" "}
          <span>↵</span>
        </span>
      </form>
    </article>
  );
}

function Completion({
  onReturn,
  menuOpen,
}: {
  onReturn: () => void;
  menuOpen: boolean;
}) {
  const [notice, setNotice] = useState("");
  const heading = "The Fog clears.";
  const concept =
    "Small practice steps build familiarity over time. Revisiting a concept helps you use it more independently.";
  const description =
    "All 16 generators are repaired, and the Exit Gate is open. Your work is here whenever you want to return.";
  return (
    <article
      className="zen-card zen-complete rounded-3xl"
      aria-labelledby="zen-finish"
    >
      <div className="zen-complete-icon">
        <Leaf size={26} aria-hidden="true" />
      </div>
      <section className="zen-tip" aria-labelledby="zen-tip-label">
        <div className="zen-tip-heading">
          <span id="zen-tip-label">Tip & concept</span>
          <ZenSpeech
            text={`${concept} ${heading} ${description}`}
            suspend={menuOpen}
            onNotice={setNotice}
          />
        </div>
        <p id="zen-concept" className="zen-concept">
          {concept}
        </p>
      </section>
      <h1 id="zen-finish">{heading}</h1>
      <p className="zen-description">{description}</p>
      {notice && (
        <p className="zen-notice" role="status">
          {notice}
        </p>
      )}
      <button
        type="button"
        className="zen-primary"
        autoFocus
        onClick={onReturn}
      >
        Return to generator 1<ArrowRight size={18} aria-hidden="true" />
      </button>
    </article>
  );
}

export default function ZenApp() {
  const [progress, setProgress] = useState(readZenProgress);
  const [saving, setSaving] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeMission = useRef("");
  activeMission.current = progress.escaped
    ? "complete"
    : zenGenerators[progress.generator].missions[progress.mission].id;
  const reducedMotion = useReducedMotion();
  const chime = useZenChime(progress.sound);
  const repaired = zenGenerators.filter((generator) =>
    generatorComplete(generator, progress.solved),
  ).length;
  useEffect(() => {
    try {
      localStorage.setItem(zenStorageKey, JSON.stringify(progress));
      setSaving(true);
    } catch {
      setSaving(false);
    }
  }, [progress]);
  useEffect(() => {
    document.documentElement.lang = "en";
    document.title = "React & JS Zen Fog";
  }, []);

  return (
    <div className="zen-shell min-h-svh bg-slate-900 text-slate-50">
      <header className="zen-header">
        <a className="zen-brand" href="#main" aria-label="React & JS Zen Fog">
          <Leaf size={22} aria-hidden="true" />
          <span>
            Zen Fog<span className="zen-subtitle">React & JS</span>
          </span>
        </a>
        <div className="zen-header-actions">
          <button
            type="button"
            className="zen-sound"
            aria-label={
              progress.sound
                ? "Mute completion sound"
                : "Enable completion sound"
            }
            aria-pressed={progress.sound}
            onClick={() =>
              setProgress((previous) => ({
                ...previous,
                sound: !previous.sound,
              }))
            }
          >
            {progress.sound ? (
              <Bell size={18} aria-hidden="true" />
            ) : (
              <BellOff size={18} aria-hidden="true" />
            )}
            <span>Sound {progress.sound ? "on" : "off"}</span>
          </button>
          <button
            type="button"
            className="zen-icon-button"
            aria-label="Open lesson menu"
            aria-expanded={menuOpen}
            aria-controls="zen-drawer"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>
      </header>
      <main id="main" className="zen-main">
        <div className="zen-step-line">
          <span>
            {progress.escaped
              ? "All 16 generators repaired"
              : `Generator ${progress.generator + 1} of ${zenGenerators.length}`}
          </span>
          <span className="zen-pace">
            {progress.escaped ? "Exit Gate powered" : "At your pace"}
          </span>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={
              progress.escaped
                ? "complete"
                : `${progress.generator}:${progress.mission}`
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.16 }}
          >
            {progress.escaped ? (
              <Completion
                menuOpen={menuOpen}
                onReturn={() =>
                  setProgress((previous) => ({
                    ...previous,
                    generator: 0,
                    mission: 0,
                    escaped: false,
                  }))
                }
              />
            ) : (
              <GeneratorCard
                progress={progress}
                setProgress={setProgress}
                chime={chime}
                menuOpen={menuOpen}
                activeMission={activeMission}
              />
            )}
          </motion.div>
        </AnimatePresence>
        <p className="zen-save-note">
          {saving
            ? "Your place is saved on this device."
            : "You can keep learning here. Enable browser storage to save for later."}
        </p>
        <span className="sr-only" role="status">
          {repaired} of 16 generators repaired
        </span>
      </main>
      {menuOpen && (
        <ZenDrawer
          generator={progress.generator}
          mission={progress.mission}
          solved={progress.solved}
          onClose={() => setMenuOpen(false)}
          onSelect={(generator, mission) => {
            setProgress((previous) => ({
              ...previous,
              generator,
              mission,
              escaped: false,
            }));
            setMenuOpen(false);
          }}
        />
      )}
    </div>
  );
}
