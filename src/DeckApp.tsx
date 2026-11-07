import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import AudioNarrator, { readAudioPreferences } from "./AudioNarrator";
import FogExplore from "./FogExplore";
import SkillCheck from "./SkillCheck";
import ExitGates from "./ExitGates";
import { GeneratorArt, TrialHUD } from "./FogArt";
import {
  readTrial,
  repairGenerator,
  verifiedRepairs,
  trialStorageKey,
} from "./fogGame";
import useFogSound from "./useFogSound";
import { deckLessons } from "./fogCurriculum";
export { deckLessons } from "./fogCurriculum";
import { missions } from "./missions";
import { narration } from "./narration";
import { readMissionProgress, missionStorageKey } from "./missionProgress";
const CodeMission = lazy(() => import("./CodeMission"));
import {
  ArrowLeft,
  ArrowRight,
  Braces,
  Check,
  ChevronRight,
  Lightbulb,
  List,
  Moon,
  Sun,
  X,
} from "lucide-react";
import MapLab, { Highlight } from "./App";
import "./deck.css";
import "./v5.css";
import "./fog.css";
export const deckStorageKey = "fog-survival-deck-v6";
type SavedDeck = { card: number; completed: number[]; theme: "dark" | "light" };
function loadDeck(): SavedDeck {
  try {
    const p = JSON.parse(localStorage.getItem(deckStorageKey) || "null");
    return {
      card: Number.isInteger(p?.card) ? Math.min(15, Math.max(0, p.card)) : 0,
      completed: Array.isArray(p?.completed)
        ? [
            ...new Set<number>(
              p.completed.filter(
                (n: unknown) =>
                  typeof n === "number" &&
                  Number.isInteger(n) &&
                  n >= 0 &&
                  n < 16,
              ),
            ),
          ]
        : [],
      theme: p?.theme === "light" ? "light" : "dark",
    };
  } catch {
    return { card: 0, completed: [], theme: "dark" };
  }
}
export default function DeckApp() {
  const [saved, setSaved] = useState(loadDeck);
  const [menu, setMenu] = useState(false);
  const [help, setHelp] = useState(false);
  const [lab, setLab] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [trial, setTrial] = useState(readTrial);
  const [exitView, setExitView] = useState(false);
  const sound = useFogSound(trial.effects);
  const [progress, setProgress] = useState(readMissionProgress);
  const [audio, setAudio] = useState(readAudioPreferences);
  const [solution, setSolution] = useState(false);
  const [codeValid, setCodeValid] = useState(false);
  const reducedMotion = useReducedMotion();
  const heading = useRef<HTMLHeadingElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLElement>(null);
  const card = saved.card;
  const task = progress.tasks[card] || 0;
  const script = narration[audio.language][card];
  const taskText = task === 0 ? script.explore : script.challenge;
  const repairs = verifiedRepairs(trial, progress);
  const isRepaired = repairs.includes(card);
  const currentRepair = isRepaired
    ? 100
    : progress.explored.includes(card)
      ? progress.solved.includes(card)
        ? 75
        : 50
      : 0;
  const completion = Math.round((repairs.length / 16) * 100);
  useEffect(() => {
    try {
      localStorage.setItem(trialStorageKey, JSON.stringify(trial));
    } catch {
      setSaveError(true);
    }
  }, [trial]);
  function skillResult(result: import("./fogGame").SkillResult) {
    sound(result);
    setTrial((old) =>
      repairGenerator(
        old,
        card,
        result,
        codeValid && progress.explored.includes(card),
      ),
    );
  }
  const exploreComplete = useCallback(
    () =>
      setProgress((old) =>
        old.explored.includes(card)
          ? old
          : { ...old, explored: [...old.explored, card] },
      ),
    [card],
  );
  const codeComplete = useCallback(() => {
    setCodeValid(true);
    setProgress((old) =>
      old.solved.includes(card)
        ? old
        : { ...old, solved: [...old.solved, card] },
    );
  }, [card]);
  useEffect(() => {
    try {
      localStorage.setItem(missionStorageKey, JSON.stringify(progress));
      localStorage.setItem("deep-dive-audio-v5", JSON.stringify(audio));
    } catch {
      setSaveError(true);
    }
  }, [progress, audio]);
  useEffect(() => {
    try {
      localStorage.setItem(deckStorageKey, JSON.stringify(saved));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [saved]);
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        menuButton.current?.focus();
      }
    };
    const outside = (e: PointerEvent) => {
      if (
        e.target instanceof Node &&
        !menuPanel.current?.contains(e.target) &&
        !menuButton.current?.contains(e.target)
      )
        setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", outside);
    };
  }, [menu]);
  function go(next: number) {
    setSaved((v) => ({ ...v, card: next }));
    setHelp(false);
    setMenu(false);
    setExitView(false);
    setSolution(false);
    setCodeValid(false);
    requestAnimationFrame(() =>
      heading.current?.focus({ preventScroll: true }),
    );
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
  function previous() {
    if (task === 1) {
      setProgress((p) => ({ ...p, tasks: { ...p.tasks, [card]: 0 } }));
      setHelp(false);
      setSolution(false);
      setCodeValid(false);
    } else if (card > 0) go(card - 1);
  }
  function next() {
    if (task === 0) {
      if (!progress.explored.includes(card)) return;
      setProgress((p) => ({ ...p, tasks: { ...p.tasks, [card]: 1 } }));
      setHelp(false);
      setSolution(false);
      setCodeValid(false);
      return;
    }
    if (!isRepaired) return;
    setSaved((v) => ({
      ...v,
      completed: [...new Set([...v.completed, card])],
    }));
    if (repairs.length === 16) {
      setExitView(true);
      return;
    }
    if (card < 15) go(card + 1);
    else setMenu(true);
  }
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (
        lab ||
        menu ||
        exitView ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (
        target?.closest(
          'input, textarea, select, [contenteditable="true"], .monaco-editor',
        )
      )
        return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        previous();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [
    card,
    task,
    lab,
    menu,
    exitView,
    codeValid,
    progress.explored,
    isRepaired,
    repairs.length,
  ]);
  if (lab) return <MapLab onReturn={() => setLab(false)} />;
  return (
    <div
      className={
        "deck-app fog-game " + (saved.theme === "light" ? "deck-light" : "")
      }
    >
      <a href="#deck-card" className="skip-link">
        Skip to learning card
      </a>
      <header className="d-topbar">
        <a
          className="d-brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go(0);
          }}
        >
          <span>
            <Braces size={22} />
          </span>
          <span className="v5-brand">
            React & JS <b>Fog Survival</b>
          </span>
        </a>
        <span className="d-product-name">
          Escape the Fog. Understand the code.
        </span>
        <div>
          <button
            className="fog-effects-toggle"
            role="switch"
            aria-label="Sound effects"
            aria-checked={trial.effects}
            onClick={() => setTrial((t) => ({ ...t, effects: !t.effects }))}
          >
            SFX {trial.effects ? "ON" : "OFF"}
          </button>
          <button
            className="d-icon-button"
            aria-label={
              saved.theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            onClick={() =>
              setSaved((v) => ({
                ...v,
                theme: v.theme === "dark" ? "light" : "dark",
              }))
            }
          >
            {saved.theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            ref={menuButton}
            className="d-outline-button"
            aria-label="Lesson list"
            aria-expanded={menu}
            aria-controls="deck-index"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={15} /> : <List size={16} />}
            <span>Lesson list</span>
          </button>
        </div>
      </header>
      {menu && (
        <nav
          ref={menuPanel}
          className="d-index"
          id="deck-index"
          aria-label="Card navigation"
        >
          <div className="d-index-title">
            Choose a generator
            <button
              aria-label="Close lesson list"
              onClick={() => {
                setMenu(false);
                menuButton.current?.focus();
              }}
            >
              <X size={17} />
            </button>
          </div>
          {["JS survivor prerequisites", "Core React · survivor HUD"].map(
            (phase, p) => (
              <div key={phase}>
                <h2>{phase}</h2>
                {deckLessons.map(
                  (lesson, i) =>
                    (p === 0 ? i < 11 : i >= 11) && (
                      <button
                        key={lesson[0]}
                        aria-current={card === i ? "step" : undefined}
                        onClick={() => go(i)}
                      >
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        {lesson[0]}
                        {repairs.includes(i) ? (
                          <Check size={13} />
                        ) : (
                          <ChevronRight size={13} />
                        )}
                      </button>
                    ),
                )}
              </div>
            ),
          )}
          <button
            className="d-link fog-legacy-link"
            onClick={() => {
              setLab(true);
              setMenu(false);
            }}
          >
            Previous callback practice
          </button>
        </nav>
      )}
      <TrialHUD
        repaired={repairs.length}
        perfect={trial.perfect.filter((i) => repairs.includes(i)).length}
        onExit={() => setExitView(true)}
      />
      {exitView && repairs.length === 16 ? (
        <ExitGates
          unlocked
          escaped={trial.escaped}
          onReturn={() => setExitView(false)}
          onEscape={() => {
            if (repairs.length !== 16) return;
            setTrial((t) => ({ ...t, escaped: true }));
            sound("escape");
          }}
        />
      ) : (
        <main className="d-main">
          <div className="d-progress-heading">
            <span>
              <b>Generator {card + 1}</b> of 16{" "}
              <span className="v5-step-separator">•</span> Step {task + 1} of 2
            </span>
            <span>{currentRepair}% REPAIRED</span>
          </div>
          <div
            className="d-progress-bar"
            role="progressbar"
            aria-label="Trial generator power"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={completion}
          >
            <i style={{ width: completion + "%" }} />
          </div>
          <motion.article
            id="deck-card"
            className="d-lesson-card v5-card"
            key={card + ":" + task}
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="v5-layout">
              <div className="v5-guidance">
                <div className="d-card-intro">
                  <div className="d-topic-label">
                    <span>{card < 11 ? "JS" : "R"}</span>
                    {deckLessons[card][0]}
                  </div>
                  <GeneratorArt
                    progress={currentRepair}
                    perfect={trial.perfect.includes(card) && isRepaired}
                  />
                  <h1 ref={heading} tabIndex={-1}>
                    {deckLessons[card][1]}
                  </h1>
                  <p lang={audio.language}>{script.concept}</p>
                </div>
                <div className="v5-task">
                  <span>
                    STEP {task + 1} / {task === 0 ? "EXPLORE" : "CODE"}
                  </span>
                  <p lang={audio.language}>{taskText}</p>
                </div>
                <AudioNarrator
                  text={script.concept + " " + taskText}
                  preferences={audio}
                  onChange={setAudio}
                  lessonKey={card + ":" + task}
                />
              </div>
              <div className="v5-workspace">
                {task === 0 ? (
                  <>
                    <FogExplore index={card} onComplete={exploreComplete} />
                    <div
                      className={
                        "v5-explore-result " +
                        (progress.explored.includes(card) ? "complete" : "")
                      }
                      role="status"
                    >
                      {progress.explored.includes(card) ? (
                        <>
                          <Check size={16} />
                          Field drill complete · generator 50% restored.
                        </>
                      ) : (
                        <>
                          Complete the field drill to restore the first power
                          segment.
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Suspense
                      fallback={
                        <div className="micro-editor-loading">
                          Loading local editor…
                        </div>
                      }
                    >
                      <CodeMission
                        index={card}
                        drafts={progress.drafts[card]}
                        onChange={(files) => {
                          setCodeValid(false);
                          setProgress((p) => ({
                            ...p,
                            drafts: { ...p.drafts, [card]: files },
                          }));
                        }}
                        onSolved={codeComplete}
                        onValidity={setCodeValid}
                        theme={saved.theme}
                      />
                    </Suspense>
                    <SkillCheck
                      eligible={codeValid && progress.explored.includes(card)}
                      repaired={isRepaired}
                      perfect={trial.perfect.includes(card)}
                      assisted={trial.assisted}
                      onAssist={(assisted) =>
                        setTrial((t) => ({ ...t, assisted }))
                      }
                      onResult={skillResult}
                    />
                  </>
                )}
              </div>
            </div>
            <div className="d-card-help">
              <button
                className="d-help-button"
                aria-expanded={help}
                aria-controls="deck-help"
                onClick={() => {
                  setHelp(!help);
                  if (!help && task === 1 && !progress.hints[card])
                    setProgress((p) => ({
                      ...p,
                      hints: { ...p.hints, [card]: 1 },
                    }));
                }}
              >
                <Lightbulb size={15} />
                {help ? "Hide explanation" : "I'm confused"}
                <ChevronRight size={13} className={help ? "rotated" : ""} />
              </button>
              {help && (
                <p id="deck-help" className="d-help-text">
                  {task === 0
                    ? deckLessons[card][3]
                    : missions[card].hints[
                        Math.max(0, (progress.hints[card] || 1) - 1)
                      ]}
                </p>
              )}
              {help && task === 1 && (
                <div className="v5-more-help">
                  {(progress.hints[card] || 1) < 3 ? (
                    <button
                      className="d-link"
                      onClick={() =>
                        setProgress((p) => ({
                          ...p,
                          hints: {
                            ...p.hints,
                            [card]: Math.min(3, (p.hints[card] || 1) + 1),
                          },
                        }))
                      }
                    >
                      Another hint
                      <ArrowRight size={13} />
                    </button>
                  ) : (
                    <button
                      className="d-link"
                      onClick={() => setSolution(!solution)}
                    >
                      {solution ? "Hide" : "Compare a"} worked solution
                    </button>
                  )}
                  {solution && (
                    <pre>
                      <Highlight code={missions[card].solution} />
                    </pre>
                  )}
                </div>
              )}
            </div>
          </motion.article>
          <footer className="d-bottom-nav">
            <button
              className="d-previous"
              disabled={card === 0 && task === 0}
              onClick={previous}
            >
              <ArrowLeft size={16} />
              Previous
            </button>
            <span>
              {saveError
                ? "Local saving unavailable."
                : task === 0
                  ? progress.explored.includes(card)
                    ? "Field drill complete. Repair the blueprint next."
                    : "Complete the field drill to continue."
                  : isRepaired
                    ? "Generator repaired. Power restored."
                    : codeValid
                      ? "Blueprint ready. Complete the skill check."
                      : "Repair and test the blueprint to arm the skill check."}
            </span>
            <button
              className="d-next"
              disabled={
                task === 0 ? !progress.explored.includes(card) : !isRepaired
              }
              onClick={next}
            >
              {task === 0
                ? "Repair blueprint"
                : repairs.length === 16
                  ? "Open exit gates"
                  : card === 15
                    ? "Find remaining generators"
                    : "Next generator"}
              <ArrowRight size={16} />
            </button>
          </footer>
        </main>
      )}
      <div className="d-footer-note">
        16 generators. One concept at a time. No progress lost on a missed
        check. ← Previous · Next →
      </div>
    </div>
  );
}
