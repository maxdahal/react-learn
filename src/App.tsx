import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Braces,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Code2,
  FileCode2,
  GitBranch,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Pause,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import {
  checkChallenge,
  checkModification,
  checkPrediction,
  dbdCards,
  lessonSteps,
  loadProgress,
  storageKey,
  uxCards,
} from "./learning";
import type { Card, Progress } from "./learning";
import "./styles.css";

type Page = "dashboard" | "lesson" | "progress";
type FeedbackState = { ok: boolean; message: string; output?: string[] };
const tokenHelp: Record<string, string> = {
  map: ".map() calls your callback once for each item, then collects the returned values into a new array.",
  parameter:
    "A parameter is the name in the function definition. The argument is the actual object passed into that call.",
  arrow:
    "The arrow defines a function. The expression on its right is returned automatically; a block with { } needs an explicit return.",
  index:
    "The second parameter receives the position: 0, 1, then 2. Parameter order matters; the first always receives the item.",
  property:
    "The dot reads the label property of the current object. That string becomes this call’s return value.",
  output:
    "The assignment stores the new array in labels. const keeps that variable from being reassigned; it does not freeze objects.",
};
const stepHelp = [
  ".map() transforms each item; it does not remove items. Three input objects produce three output values in the same order.",
  "You choose the parameter’s name. .map() chooses its value: the current array item is passed as an argument on every call.",
  "Receive assigns the item to the parameter. Return reads its label, then collect places that returned string in the new array.",
  "The original array holds objects. Our callback reads .label from each object, so changing a label changes the corresponding returned string.",
  "Ignore id: the callback returns only item.label. Write three strings in the original order, enclosed in [ ] and double quotes.",
  "Strings have a .toUpperCase() method. Call it on card.label to return a new uppercase string; remember its parentheses.",
  "The first parameter receives the card; the second receives its index. Since indexes start at 0, add 1 for human-friendly numbering.",
];
export function Highlight({ code }: { code: string }) {
  return (
    <>
      {code
        .split(
          /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`|\/\/[^\n]*|\b(?:const|return|let)\b|=>|\b\d+\b|\bmap\b)/g,
        )
        .map((s, i) => (
          <span
            key={i}
            className={
              s.startsWith("//")
                ? "syn-comment"
                : /^["'`]/.test(s)
                  ? "syn-string"
                  : /^(const|return|let)$/.test(s)
                    ? "syn-keyword"
                    : s === "map"
                      ? "syn-method"
                      : s === "=>"
                        ? "syn-keyword"
                        : /^\d+$/.test(s)
                          ? "syn-number"
                          : ""
            }
          >
            {s}
          </span>
        ))}
    </>
  );
}
function CodeEditor({
  value,
  onChange,
  onRun,
}: {
  value: string;
  onChange: (v: string) => void;
  onRun: () => void;
}) {
  const id = useId();
  const pre = useRef<HTMLPreElement>(null);
  return (
    <div className="editor">
      <div className="editor-label">
        <span>
          <FileCode2 size={14} /> your-callback.js
        </span>
        <span>JAVASCRIPT</span>
      </div>
      <div className="editor-input">
        <pre ref={pre} aria-hidden="true">
          <Highlight code={value + "\n"} />
        </pre>
        <label className="sr-only" htmlFor={id}>
          Practice code
        </label>
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="Write your transformation here…"
          onScroll={(e) => {
            if (pre.current) pre.current.scrollTop = e.currentTarget.scrollTop;
          }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              onRun();
            }
          }}
        />
      </div>
      <div className="editor-actions">
        <span>⌘ / Ctrl + Enter to run</span>
        <button className="primary small" onClick={onRun}>
          <Play size={13} /> Run code
        </button>
      </div>
    </div>
  );
}
function Feedback({ result }: { result: FeedbackState | null }) {
  return result ? (
    <div
      className={"feedback " + (result.ok ? "success" : "retry")}
      role="status"
    >
      {result.ok ? <Check size={17} /> : <CircleHelp size={17} />}
      <span>{result.message}</span>
    </div>
  ) : null;
}
function ArrayValues({
  values,
  placeholder = false,
}: {
  values: string[];
  placeholder?: boolean;
}) {
  return (
    <div className={"array-values " + (placeholder ? "placeholder-array" : "")}>
      <span className="bracket">[</span>
      {values.map((v, i) => (
        <span
          className="value-chip"
          key={i}
          style={{ animationDelay: i * 80 + "ms" }}
        >
          {placeholder ? "?" : JSON.stringify(v)}
          {i < values.length - 1 && <i>,</i>}
        </span>
      ))}
      <span className="bracket">]</span>
    </div>
  );
}
function TraceDiagram({
  cards,
  alias,
  tick,
}: {
  cards: Card[];
  alias: string;
  tick: number;
}) {
  const current = tick === 0 ? -1 : Math.min(2, Math.floor((tick - 1) / 3));
  const phase = tick === 0 ? 0 : ((tick - 1) % 3) + 1;
  const collected = Math.floor(tick / 3);
  return (
    <div className="trace-diagram">
      <div className="trace-column">
        <div className="diagram-label">
          INPUT <code>cards</code>
        </div>
        <div className="trace-list">
          {cards.map((c, i) => (
            <div
              className={
                "trace-item " +
                (current === i ? "current" : "") +
                (i < collected ? " processed" : "")
              }
              key={c.id}
            >
              <span className="index">{i}</span>
              <code>
                <span className="object-brace">{"{ label: "}</span>
                <span>{JSON.stringify(c.label)}</span>
                <span className="object-brace">{" }"}</span>
              </code>
              {i < collected ? (
                <Check size={14} />
              ) : current === i ? (
                <ArrowRight size={14} />
              ) : null}
            </div>
          ))}
        </div>
        <span className="diagram-note">Original array stays unchanged</span>
      </div>
      <ArrowRight className="diagram-arrow" size={20} />
      <div className={"callback-box " + (current >= 0 ? "engaged" : "")}>
        <span className="diagram-label">CALLBACK</span>
        <div className="callback-expression">
          <code>
            (<b>{alias}</b>, index) <span className="syn-keyword">=&gt;</span>
            <br />
            &nbsp; {alias}.label
          </code>
        </div>
        <div className="binding">
          <span>{alias}</span>
          <code>
            {current < 0
              ? "waiting…"
              : `{ label: ${JSON.stringify(cards[current].label)} }`}
          </code>
        </div>
        <div className="binding index-binding">
          <span>index</span>
          <code>{current < 0 ? "—" : current}</code>
        </div>
        <div className={"return-slot " + (phase >= 2 ? "returned" : "")}>
          <span>returns</span>
          <code>
            {phase >= 2 && current >= 0
              ? JSON.stringify(cards[current].label)
              : "—"}
          </code>
        </div>
      </div>
      <ArrowRight className="diagram-arrow" size={20} />
      <div className="trace-column">
        <div className="diagram-label">
          NEW ARRAY <code>labels</code>
        </div>
        <div className="trace-list result-list">
          {cards.map((c, i) => (
            <div
              key={c.id}
              className={"result-item " + (collected > i ? "collected" : "")}
            >
              <span className="index">{i}</span>
              {collected > i ? (
                <code key={c.label}>{JSON.stringify(c.label)}</code>
              ) : (
                <span className="empty-result" />
              )}
              {collected > i && <Check size={14} />}
            </div>
          ))}
        </div>
        <span className="diagram-note">{collected} of 3 results collected</span>
      </div>
    </div>
  );
}
function App({ onReturn }: { onReturn?: () => void } = {}) {
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [page, setPage] = useState<Page>("dashboard");
  const [mobile, setMobile] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    JavaScript: true,
    React: false,
    TypeScript: false,
  });
  const [help, setHelp] = useState(false);
  const [helpToken, setHelpToken] = useState("");
  const [solution, setSolution] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [demo, setDemo] = useState(false);
  const [selectedItem, setSelectedItem] = useState(0);
  const [predictionResult, setPredictionResult] =
    useState<FeedbackState | null>(null);
  const [modificationResult, setModificationResult] =
    useState<FeedbackState | null>(null);
  const [practiceResult, setPracticeResult] = useState<FeedbackState | null>(
    null,
  );
  const [saveError, setSaveError] = useState(false);
  const step = progress.guidedStep;
  const tick = progress.traceStep;
  const current = lessonSteps[step];
  const heading = useRef<HTMLHeadingElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const mobileMenu = useRef<HTMLButtonElement>(null);
  const base = progress.preset === "ux" ? uxCards : dbdCards;
  const cards = base.map((c, i) => ({ ...c, label: progress.labels[i] }));
  const alias = progress.alias;
  function update(p: Partial<Progress>) {
    setProgress((old) => ({ ...old, ...p }));
  }
  function markComplete(s: number) {
    setProgress((old) => ({
      ...old,
      completedSteps: [...new Set([...old.completedSteps, s])],
      ...(s === 3 ? { explored: true } : {}),
      ...(s === 2 ? { traced: true } : {}),
      ...(s === 4 ? { predicted: true } : {}),
      ...(s === 5 ? { modified: true } : {}),
      ...(s === 6 ? { practiced: true } : {}),
    }));
  }
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [progress]);
  useEffect(() => {
    if (!playing || page !== "lesson" || step !== 2) return;
    if (tick === 9) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => update({ traceStep: tick + 1 }), 1000);
    return () => clearTimeout(timer);
  }, [playing, tick, page, step]);
  useEffect(() => {
    if (tick === 9 && !progress.completedSteps.includes(2)) markComplete(2);
  }, [tick, progress.completedSteps]);
  useEffect(() => {
    if (!mobile) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const controls = () =>
      Array.from(
        sidebar.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ) ?? [],
      ).filter((el) => el.getClientRects().length > 0);
    controls()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobile(false);
      if (e.key === "Tab") {
        const items = controls(),
          first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      mobileMenu.current?.focus();
    };
  }, [mobile]);
  function focusHeading() {
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
  function navigate(p: Page) {
    setPage(p);
    setMobile(false);
    setPlaying(false);
    setHelp(false);
    setSolution(false);
    focusHeading();
  }
  function goStep(s: number) {
    setPlaying(false);
    setHelp(false);
    setHelpToken("");
    setSolution(false);
    update({
      guidedStep: s,
      section:
        s <= 1 || s === 3
          ? "Explore"
          : s === 2
            ? "Trace"
            : s === 4
              ? "Predict"
              : "Practice",
    });
    focusHeading();
  }
  function next() {
    if (step === 2 && tick < 9) {
      update({ traceStep: tick + 1 });
      setPlaying(false);
      return;
    }
    if (step < 4) markComplete(step);
    if (step < 6) goStep(step + 1);
    else navigate("progress");
  }
  function back() {
    setPlaying(false);
    if (step === 2 && tick > 0) {
      update({ traceStep: tick - 1 });
      return;
    }
    if (step === 0) navigate("dashboard");
    else goStep(step - 1);
  }
  function setPreset(p: "ux" | "dbd") {
    update({
      preset: p,
      labels: (p === "ux" ? uxCards : dbdCards).map((c) => c.label),
      traceStep: 0,
    });
    setDemo(false);
    setSelectedItem(0);
    setPlaying(false);
    setModificationResult(null);
    setPracticeResult(null);
  }
  function inspect(token: string) {
    setHelpToken(token);
    setHelp(true);
  }
  function runPractice() {
    const result = checkChallenge(progress.draft, cards);
    setPracticeResult(result);
    if (result.ok) markComplete(6);
  }
  const liveModification =
    step === 5 ? checkModification(progress.modifyDraft, cards) : null;
  // Completion is historical; navigation validates the answer currently on screen.
  // Keep earned progress when experimenting, without treating an edited draft as correct.
  const canNext =
    step === 4
      ? progress.predicted && checkPrediction(progress.prediction).ok
      : step === 5
        ? progress.modified && liveModification?.ok === true
        : step === 6
          ? progress.practiced && checkChallenge(progress.draft, cards).ok
          : true;
  const allDone = progress.completedSteps.length === 7;
  const traceCurrent = tick === 0 ? -1 : Math.floor((tick - 1) / 3);
  const tracePhase = tick === 0 ? 0 : (tick - 1) % 3;
  const traceCaption =
    tick === 0
      ? "Ready: .map() will pass the first object into your callback."
      : tick === 9
        ? "Finished. Three calls, three labels, one new array."
        : tracePhase === 0
          ? `Receive: ${alias} now holds ${JSON.stringify(cards[traceCurrent].label)}. Index is ${traceCurrent}.`
          : tracePhase === 1
            ? `Return: ${alias}.label gives us ${JSON.stringify(cards[traceCurrent].label)}.`
            : `Collect: put ${JSON.stringify(cards[traceCurrent].label)} into the new array.`;
  const navItems: Record<string, { title: string; disabled?: boolean }[]> = {
    JavaScript: [
      { title: ".map() & callbacks" },
      { title: "Arrow functions", disabled: true },
    ],
    React: [{ title: "Props & state", disabled: true }],
    TypeScript: [{ title: "Giving data a shape", disabled: true }],
  };
  return (
    <div className={"app " + (progress.sidebarCollapsed ? "is-collapsed" : "")}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <aside
        ref={sidebar}
        className={"sidebar " + (mobile ? "mobile-open" : "")}
        aria-label="Sidebar"
      >
        <div className="sidebar-brand">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("dashboard");
            }}
            aria-label="Syntax Lab dashboard"
          >
            <span className="brand-mark">
              <Braces size={22} />
            </span>
            <span className="brand-name">
              syntax<span>lab</span>
            </span>
          </a>
          <button
            className="collapse-button icon-button"
            title={
              progress.sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            aria-label={
              progress.sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            onClick={() =>
              update({ sidebarCollapsed: !progress.sidebarCollapsed })
            }
          >
            {progress.sidebarCollapsed ? (
              <PanelLeftOpen size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
          </button>
          <button
            className="mobile-close icon-button"
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="sidebar-caption">YOUR LEARNING SPACE</div>
        <nav aria-label="Main navigation">
          <button
            className={"nav-item " + (page === "dashboard" ? "active" : "")}
            title="Dashboard"
            onClick={() => navigate("dashboard")}
          >
            <LayoutDashboard size={18} />
            <span className="nav-label">Dashboard</span>
          </button>
          <div className="nav-divider" />
          {Object.keys(navItems).map((category, i) => (
            <div className="category" key={category}>
              <button
                className={
                  "nav-item category-toggle " +
                  (category === "JavaScript" && page === "lesson"
                    ? "category-active"
                    : "")
                }
                title={category}
                aria-label={category}
                aria-expanded={expanded[category]}
                onClick={() => {
                  setExpanded((old) => ({
                    ...old,
                    [category]: progress.sidebarCollapsed
                      ? true
                      : !old[category],
                  }));
                  if (progress.sidebarCollapsed)
                    update({ sidebarCollapsed: false });
                }}
              >
                <span className={"language-icon language-" + i}>
                  {["JS", "R", "TS"][i]}
                </span>
                <span className="nav-label">{category}</span>
                <ChevronDown
                  className={
                    "category-chevron " + (expanded[category] ? "expanded" : "")
                  }
                  size={14}
                />
              </button>
              {expanded[category] && (
                <div className="nested-lessons">
                  {navItems[category].map((l) => (
                    <button
                      key={l.title}
                      className={
                        "nested-item " +
                        (!l.disabled && page === "lesson" ? "current" : "")
                      }
                      disabled={l.disabled}
                      onClick={() => navigate("lesson")}
                    >
                      <span className="lesson-dot" />
                      <span>{l.title}</span>
                      {l.disabled ? (
                        <small>Later</small>
                      ) : allDone ? (
                        <Check size={12} />
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="nav-divider" />
          <button
            className={"nav-item " + (page === "progress" ? "active" : "")}
            title="Progress"
            onClick={() => navigate("progress")}
          >
            <GitBranch size={18} />
            <span className="nav-label">Progress</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <span className={"save-dot " + (saveError ? "save-error" : "")} />
          <span className="save-label">
            {saveError ? "Saving unavailable" : "Your place is saved locally"}
          </span>
        </div>
      </aside>
      {mobile && (
        <button
          className="mobile-scrim"
          aria-label="Dismiss navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              ref={mobileMenu}
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              aria-expanded={mobile}
              onClick={() => setMobile(true)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <b>
              {page === "dashboard"
                ? "Dashboard"
                : page === "progress"
                  ? "Your progress"
                  : "JavaScript"}
            </b>
            {page === "lesson" && (
              <>
                <ChevronRight size={13} />
                <span className="breadcrumb-detail">.map() & callbacks</span>
              </>
            )}
          </div>
          {onReturn && (
            <button className="text-button" onClick={onReturn}>
              <ArrowLeft size={14} /> Back to card deck
            </button>
          )}
          <div className="topbar-note">
            <span className="tiny-spark">✳</span> One small idea at a time.
          </div>
        </header>
        <main
          id="main-content"
          className={
            page === "lesson" ? "main-content lesson-page" : "main-content"
          }
        >
          {page === "dashboard" && (
            <div className="dashboard page-enter">
              <div className="eyebrow">
                <span className="lime-line" />
                YOUR PERSONAL WORKBENCH
              </div>
              <h1 ref={heading} tabIndex={-1}>
                A little less syntax.
                <br />
                <em>A little more sense.</em>
              </h1>
              <p className="dashboard-intro">
                A quiet place to connect what you see with what code does.
              </p>
              <button
                className="lesson-preview"
                onClick={() => navigate("lesson")}
              >
                <div className="preview-graphic" aria-hidden="true">
                  <span>
                    [ <i>●</i> <i>●</i> <i>●</i> ]
                  </span>
                  <div>
                    <ArrowDown size={15} />
                    <code>.map()</code>
                    <ArrowDown size={15} />
                  </div>
                  <span>
                    [ <b>◇</b> <b>◇</b> <b>◇</b> ]
                  </span>
                </div>
                <div className="preview-content">
                  <span className="eyebrow">JAVASCRIPT · GUIDED LESSON</span>
                  <h2>The magic inside .map()</h2>
                  <p>
                    Follow the data. Change a little code. Then write your own.
                  </p>
                  <span className="lesson-meta">
                    7 small steps <i /> ~15–20 min <i /> UX + Dead by Daylight
                    examples
                  </span>
                  <div className="preview-bottom">
                    <span>
                      {allDone
                        ? "Revisit lesson"
                        : progress.completedSteps.length
                          ? "Continue where you left off"
                          : "Start the walkthrough"}
                      <ArrowRight size={16} />
                    </span>
                    <small>
                      {progress.completedSteps.length
                        ? "Step " + (step + 1) + " of 7"
                        : "No experience with callbacks needed"}
                    </small>
                  </div>
                </div>
              </button>
              <div className="dashboard-footnote">
                <span>
                  <Braces size={17} /> React & TypeScript will come next. For
                  now, one useful idea.
                </span>
                <span>No streaks. No rush.</span>
              </div>
            </div>
          )}
          {page === "progress" && (
            <div className="progress-page page-enter">
              <div className="eyebrow">
                <span className="lime-line" />
                YOUR LEARNING THREAD
              </div>
              <h1 ref={heading} tabIndex={-1}>
                {allDone ? "A concept made clearer." : "Pick up the thread."}
              </h1>
              <p className="page-intro">
                Your answers, code, and place in the lesson stay on this device.
              </p>
              <div className="progress-lesson-title">
                <span className="language-icon language-0">JS</span>
                <h2>.map() & callbacks</h2>
                <span>{progress.completedSteps.length} of 7 explored</span>
              </div>
              <ol className="progress-list">
                {lessonSteps.map((s, i) => (
                  <li key={s.title}>
                    <button
                      onClick={() => {
                        goStep(i);
                        navigate("lesson");
                      }}
                      aria-label={"Review step " + (i + 1) + ": " + s.title}
                    >
                      <span
                        className={
                          "progress-check " +
                          (progress.completedSteps.includes(i) ? "done" : "")
                        }
                      >
                        {progress.completedSteps.includes(i) ? (
                          <Check size={14} />
                        ) : (
                          i + 1
                        )}
                      </span>
                      <span>{s.title}</span>
                      <small>
                        {progress.completedSteps.includes(i)
                          ? "Explored"
                          : i === step
                            ? "Your place"
                            : "Not yet"}
                      </small>
                      <ChevronRight size={14} />
                    </button>
                  </li>
                ))}
              </ol>
              <div className="progress-actions">
                <button
                  className="secondary"
                  onClick={() => {
                    goStep(0);
                    update({ traceStep: 0 });
                    navigate("lesson");
                  }}
                >
                  Review from the start
                </button>
                <button className="primary" onClick={() => navigate("lesson")}>
                  {allDone ? "Return to lesson" : "Continue learning"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
          {page === "lesson" && (
            <div className="walkthrough">
              <div className="step-header">
                <span>
                  <span className="step-counter">
                    Step {step + 1} <span>of 7</span>
                  </span>
                  <span className="step-header-divider" />
                  <span className="step-lesson-title">.map() & callbacks</span>
                </span>
                <div
                  className="step-track"
                  aria-label={"Step " + (step + 1) + " of 7"}
                >
                  {lessonSteps.map((s, i) => (
                    <i
                      key={s.title}
                      className={
                        i === step
                          ? "current"
                          : progress.completedSteps.includes(i)
                            ? "done"
                            : ""
                      }
                    />
                  ))}
                </div>
              </div>
              <section
                className="step-content page-enter"
                key={step}
                aria-labelledby="step-title"
              >
                <div className="step-intro">
                  <div className="eyebrow">
                    <span className="activity-dot" />
                    {String(step + 1).padStart(2, "0")} / {current.kind}
                  </div>
                  <h1 ref={heading} tabIndex={-1} id="step-title">
                    {current.title}
                    {step < 4 && <span className="title-period">.</span>}
                  </h1>
                  <p>{current.description}</p>
                </div>
                {step === 0 && (
                  <div className="demo-step">
                    <div className="example-picker">
                      <span>EXAMPLE WORLD</span>
                      <select
                        aria-label="Example world"
                        value={progress.preset}
                        onChange={(e) =>
                          setPreset(e.target.value as "ux" | "dbd")
                        }
                      >
                        <option value="ux">UX design process</option>
                        <option value="dbd">Dead by Daylight perks</option>
                      </select>
                    </div>
                    <div className="demo-diagram">
                      <div className="diagram-label">
                        START WITH OBJECTS <code>cards</code>
                      </div>
                      <div className="object-row">
                        {cards.map((c, i) => (
                          <div
                            className="object-tile"
                            key={c.id}
                            style={
                              { "--item-color": c.color } as React.CSSProperties
                            }
                          >
                            <span>{i}</span>
                            <code>
                              {"{ label: "}
                              <b>{JSON.stringify(c.label)}</b>
                              {" }"}
                            </code>
                          </div>
                        ))}
                      </div>
                      <div className="transform-path">
                        <div />
                        <ArrowDown size={19} />
                        <button
                          className={
                            "transform-button " + (demo ? "has-run" : "")
                          }
                          onClick={() => setDemo(!demo)}
                        >
                          {demo ? <RotateCcw size={14} /> : <Play size={13} />}
                          <code>.map(card =&gt; card.label)</code>
                        </button>
                        <ArrowDown size={19} />
                        <div />
                      </div>
                      <div className="demo-output" aria-live="polite">
                        <div className="diagram-label">
                          GET A NEW ARRAY OF LABELS
                        </div>
                        <ArrayValues
                          key={demo ? "result" : "waiting"}
                          values={cards.map((c) => c.label)}
                          placeholder={!demo}
                        />
                      </div>
                    </div>
                    <span className="quiet-caption">
                      {demo
                        ? "Same order. One returned label for every object."
                        : "Click the callback to see the transformation."}
                    </span>
                  </div>
                )}
                {step === 1 && (
                  <div className="parameter-step">
                    <div className="parameter-input">
                      <span className="diagram-label">
                        CLICK AN ITEM IN THE ARRAY
                      </span>
                      <div className="selectable-items">
                        {cards.map((c, i) => (
                          <button
                            className={selectedItem === i ? "chosen" : ""}
                            key={c.id}
                            onClick={() => setSelectedItem(i)}
                          >
                            <span>cards[{i}]</span>
                            <code>
                              {"{ label: "}
                              <b>{JSON.stringify(c.label)}</b>
                              {" }"}
                            </code>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="parameter-binding" aria-live="polite">
                      <ArrowDown size={19} />
                      <div className="binding-connection">
                        <span>
                          ARGUMENT<small>The actual value passed in</small>
                        </span>
                        <code>
                          {"{ label: " +
                            JSON.stringify(cards[selectedItem].label) +
                            " }"}
                        </code>
                        <span className="binding-equals">→</span>
                        <span className="parameter-name">
                          <b>{alias}</b>
                          <small>PARAMETER · your local name</small>
                        </span>
                      </div>
                    </div>
                    <div className="inspect-code">
                      <code>
                        <button onClick={() => inspect("output")}>
                          <span className="syn-keyword">const</span> labels
                        </button>{" "}
                        = cards.
                        <button
                          className="syn-method"
                          onClick={() => inspect("map")}
                        >
                          map
                        </button>
                        ((
                        <button
                          className="syn-param"
                          onClick={() => inspect("parameter")}
                        >
                          {alias}
                        </button>
                        ,{" "}
                        <button onClick={() => inspect("index")}>index</button>){" "}
                        <button
                          className="syn-keyword"
                          onClick={() => inspect("arrow")}
                        >
                          =&gt;
                        </button>{" "}
                        <button
                          className="syn-string"
                          onClick={() => inspect("property")}
                        >
                          {alias}.label
                        </button>
                        );
                      </code>
                    </div>
                    <div className="rename-row">
                      <label htmlFor="alias">Try a different name</label>
                      <select
                        id="alias"
                        aria-label="Callback parameter name"
                        value={alias}
                        onChange={(e) => update({ alias: e.target.value })}
                      >
                        <option>card</option>
                        <option>item</option>
                        <option>banana</option>
                      </select>
                      <span>The name changes. The value doesn’t.</span>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="trace-step">
                    <div className="trace-topline">
                      <span>
                        CALL{" "}
                        {tick === 0
                          ? "—"
                          : Math.min(3, Math.floor((tick - 1) / 3) + 1)}{" "}
                        / 3 <i />{" "}
                        <b>
                          {tick === 0
                            ? "READY"
                            : tick === 9
                              ? "COMPLETE"
                              : ["RECEIVE", "RETURN", "COLLECT"][
                                  (tick - 1) % 3
                                ]}
                        </b>
                      </span>
                      <div>
                        <button
                          className="icon-button"
                          aria-label="Reset execution"
                          title="Reset execution"
                          onClick={() => {
                            update({ traceStep: 0 });
                            setPlaying(false);
                          }}
                        >
                          <RotateCcw size={15} />
                        </button>
                        <button
                          className="text-button"
                          onClick={() => {
                            if (tick === 9) update({ traceStep: 0 });
                            setPlaying(!playing);
                          }}
                        >
                          {playing ? <Pause size={13} /> : <Play size={13} />}{" "}
                          {playing ? "Pause" : "Auto play"}
                        </button>
                      </div>
                    </div>
                    <TraceDiagram cards={cards} alias={alias} tick={tick} />
                    <div className="trace-caption" aria-live="polite">
                      <span>
                        {tick === 9 ? (
                          <Check size={17} />
                        ) : (
                          <ArrowRight size={17} />
                        )}
                      </span>
                      <p>{traceCaption}</p>
                    </div>
                    <div
                      className="execution-track"
                      aria-label={"Execution moment " + tick + " of 9"}
                    >
                      {Array.from({ length: 9 }, (_, i) => (
                        <i key={i} className={i < tick ? "filled" : ""} />
                      ))}
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="change-input-step">
                    <div className="input-labels">
                      <span className="diagram-label">
                        ORIGINAL OBJECTS · EDIT THEIR LABELS
                      </span>
                      <div className="editable-label-row">
                        {cards.map((c, i) => (
                          <label key={c.id}>
                            <span>cards[{i}].label</span>
                            <input
                              aria-label={"Card " + (i + 1) + " label"}
                              value={c.label}
                              maxLength={40}
                              style={
                                {
                                  "--item-color": c.color,
                                } as React.CSSProperties
                              }
                              onChange={(e) => {
                                update({
                                  labels: progress.labels.map((v, j) =>
                                    i === j ? e.target.value : v,
                                  ),
                                });
                                setPracticeResult(null);
                                setModificationResult(null);
                              }}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="fixed-callback">
                      <ArrowDown size={18} />
                      <code>
                        <Highlight
                          code={`cards.map(${alias} => ${alias}.label)`}
                        />
                      </code>
                      <ArrowDown size={18} />
                    </div>
                    <div className="input-result" aria-live="polite">
                      <span className="diagram-label">
                        THE RETURNED ARRAY · UPDATED LIVE
                      </span>
                      <ArrayValues values={cards.map((c) => c.label)} />
                    </div>
                    <div className="mini-interface">
                      {cards.map((c, i) => (
                        <div
                          key={c.id}
                          style={
                            { "--item-color": c.color } as React.CSSProperties
                          }
                        >
                          <span>0{i + 1}</span>
                          <b>{c.label || "Untitled"}</b>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {step === 4 && (
                  <div className="predict-step">
                    <div className="example-code">
                      <div className="code-caption">
                        <Code2 size={14} /> predict-the-output.js{" "}
                        <span>FIXED EXAMPLE</span>
                      </div>
                      <pre>
                        <Highlight
                          code={
                            'const cards = [\n  { id: 1, label: "Discover" },\n  { id: 2, label: "Design" },\n  { id: 3, label: "Test" }\n];\n\nconst result = cards.map(item => item.label);'
                          }
                        />
                      </pre>
                    </div>
                    <div className="prediction-answer">
                      <label htmlFor="prediction">
                        What does <code>result</code> contain?
                      </label>
                      <textarea
                        id="prediction"
                        spellCheck={false}
                        autoCapitalize="off"
                        value={progress.prediction}
                        placeholder={'["…", "…", "…"]'}
                        onChange={(e) => {
                          update({ prediction: e.target.value });
                          setPredictionResult(null);
                        }}
                      />
                      <button
                        className="primary small"
                        disabled={!progress.prediction.trim()}
                        onClick={() => {
                          const result = checkPrediction(progress.prediction);
                          setPredictionResult(result);
                          if (result.ok) markComplete(4);
                        }}
                      >
                        Check prediction
                        <ArrowRight size={14} />
                      </button>
                    </div>
                    <Feedback result={predictionResult} />
                  </div>
                )}
                {step === 5 && (
                  <div className="modify-step">
                    <div className="modification-input">
                      <span className="diagram-label">INPUT LABELS</span>
                      <ArrayValues values={cards.map((c) => c.label)} />
                    </div>
                    <div className="inline-code-editor">
                      <div className="code-caption">
                        <FileCode2 size={14} /> Change only the return
                        expression
                      </div>
                      <div className="editable-expression">
                        <code>
                          cards.<span className="syn-method">map</span>(card{" "}
                          <span className="syn-keyword">=&gt;</span>
                        </code>
                        <label className="sr-only" htmlFor="modify-expression">
                          Return expression
                        </label>
                        <input
                          id="modify-expression"
                          spellCheck={false}
                          autoCapitalize="off"
                          value={progress.modifyDraft}
                          onChange={(e) => {
                            update({ modifyDraft: e.target.value });
                            setModificationResult(null);
                          }}
                        />
                        <code>);</code>
                      </div>
                    </div>
                    <div className="modification-output">
                      <span className="diagram-label">YOUR OUTPUT · LIVE</span>
                      {liveModification?.output.length ? (
                        <ArrayValues values={liveModification.output} />
                      ) : (
                        <span className="incomplete-expression">
                          Finish the expression to preview its result.
                        </span>
                      )}
                    </div>
                    <button
                      className="primary small"
                      onClick={() => {
                        const result = checkModification(
                          progress.modifyDraft,
                          cards,
                        );
                        setModificationResult(result);
                        if (result.ok) markComplete(5);
                      }}
                    >
                      Check change
                      <Check size={14} />
                    </button>
                    <Feedback result={modificationResult} />
                  </div>
                )}
                {step === 6 && (
                  <div className="practice-step">
                    <div className="challenge-target">
                      <div>
                        <span className="diagram-label">INPUT · cards</span>
                        <code>
                          {cards
                            .map((c) => JSON.stringify({ label: c.label }))
                            .join(", ")}
                        </code>
                      </div>
                      <ArrowRight size={18} />
                      <div>
                        <span className="diagram-label">TARGET</span>
                        <code className="syn-string">
                          {JSON.stringify(
                            cards.map((c, i) => `${i + 1}. ${c.label}`),
                          )}
                        </code>
                      </div>
                    </div>
                    <CodeEditor
                      value={progress.draft}
                      onChange={(draft) => {
                        update({ draft });
                        setPracticeResult(null);
                      }}
                      onRun={runPractice}
                    />
                    {practiceResult && (
                      <>
                        <div className="practice-output">
                          <span className="diagram-label">YOUR OUTPUT</span>
                          {practiceResult.output?.length ? (
                            <ArrayValues values={practiceResult.output} />
                          ) : (
                            <code>No result yet.</code>
                          )}
                        </div>
                        <Feedback result={practiceResult} />
                      </>
                    )}
                  </div>
                )}
                <div className="contextual-help">
                  <button
                    className={"confused-button " + (help ? "open" : "")}
                    aria-expanded={help}
                    aria-controls="step-help"
                    onClick={() => {
                      setHelp(!help);
                      setHelpToken("");
                      if (!help && step === 6 && progress.hint === 0)
                        update({ hint: 1 });
                    }}
                  >
                    <CircleHelp size={15} />
                    {help ? "Hide help" : "I'm confused"}
                    <ChevronDown size={13} />
                  </button>
                  {help && (
                    <div className="help-content page-enter" id="step-help">
                      <div>
                        <span className="help-marker">?</span>
                        <p>
                          {helpToken
                            ? tokenHelp[helpToken]
                            : step === 6
                              ? progress.hint >= 3
                                ? 'Join (index + 1), ". ", and card.label using + or a template literal. Inside { }, use return.'
                                : progress.hint === 2
                                  ? 'Build one string from three parts: index + 1, the text ". ", and card.label. Template literals use backticks and ${…} placeholders.'
                                  : stepHelp[6]
                              : stepHelp[step]}
                        </p>
                      </div>
                      {step === 6 && (
                        <div className="more-help">
                          {progress.hint < 3 && (
                            <button
                              className="text-button"
                              onClick={() =>
                                update({ hint: Math.min(3, progress.hint + 1) })
                              }
                            >
                              Another hint <ArrowRight size={13} />
                            </button>
                          )}
                          <button
                            className="text-button muted"
                            aria-expanded={solution}
                            onClick={() => setSolution(!solution)}
                          >
                            {solution
                              ? "Hide solution"
                              : "Compare a worked solution"}
                          </button>
                        </div>
                      )}
                      {step === 6 && solution && (
                        <pre className="solution-code">
                          <Highlight
                            code={
                              "cards.map((card, index) => {\n  return `${index + 1}. ${card.label}`;\n})"
                            }
                          />
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </section>
              <footer className="step-navigation">
                <button className="back-button" onClick={back}>
                  <ArrowLeft size={16} />
                  Back
                </button>
                <span className="navigation-note">
                  {step === 2 && tick < 9
                    ? `Execution ${tick} of 9 · Next moves one moment forward`
                    : !canNext
                      ? "Check your answer to continue."
                      : saveError
                        ? "Local saving is unavailable."
                        : "Your place is saved."}
                </span>
                <button
                  className="primary next-button"
                  disabled={!canNext}
                  onClick={next}
                >
                  {step === 6
                    ? "Finish lesson"
                    : step === 2 && tick < 9
                      ? "Next moment"
                      : "Next"}
                  <ArrowRight size={16} />
                </button>
              </footer>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
export default App;
