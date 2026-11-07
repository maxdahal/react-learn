import { useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import { zenGenerators } from "./zenLessons";

type Props = {
  generator: number;
  mission: number;
  solved: string[];
  onSelect: (generator: number, mission: number) => void;
  onClose: () => void;
};
export default function ZenDrawer({
  generator,
  mission,
  solved,
  onSelect,
  onClose,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (typeof element.showModal === "function") element.showModal();
    else element.setAttribute("open", "");
    close.current?.focus();
    return () => {
      if (typeof element.close === "function" && element.open) element.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      id="zen-drawer"
      className="zen-drawer"
      aria-labelledby="zen-drawer-title"
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
        if (event.key !== "Tab") return;
        const buttons = [
          ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
            "button:not([disabled])",
          ),
        ];
        const first = buttons[0],
          last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
    >
      <div className="zen-drawer-panel">
        <div className="zen-drawer-heading">
          <h2 id="zen-drawer-title">Your learning path</h2>
          <button
            ref={close}
            type="button"
            className="zen-icon-button"
            aria-label="Close lesson menu"
            onClick={onClose}
          >
            <X size={21} aria-hidden="true" />
          </button>
        </div>
        <p className="zen-drawer-intro">
          Jump to any topic. Your place and drafts are saved.
        </p>
        <nav aria-label="Generators and missions">
          {[
            { title: "Part 1 · JavaScript", start: 0, end: 10 },
            { title: "Part 2 · React", start: 10, end: 16 },
          ].map((phase) => (
            <section
              key={phase.start}
              className="zen-drawer-phase"
              aria-label={phase.title}
            >
              <h3>
                <button
                  type="button"
                  className="zen-phase-link"
                  onClick={() => onSelect(phase.start, 0)}
                >
                  {phase.title}
                  <span>Jump to section →</span>
                </button>
              </h3>
              <ol start={phase.start + 1} className="zen-drawer-generators">
                {zenGenerators
                  .slice(phase.start, phase.end)
                  .map((group, offset) => {
                    const index = phase.start + offset;
                    return (
                      <li key={index}>
                        <h4>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          {group.topic}
                        </h4>
                        <ul>
                          {group.missions.map((task, step) => (
                            <li key={task.id}>
                              <button
                                type="button"
                                aria-current={
                                  index === generator && step === mission
                                    ? "step"
                                    : undefined
                                }
                                onClick={() => onSelect(index, step)}
                              >
                                <span>{task.question}</span>
                                {solved.includes(task.id) && (
                                  <>
                                    <Check size={15} aria-hidden="true" />
                                    <span className="sr-only">Completed</span>
                                  </>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  })}
              </ol>
            </section>
          ))}
        </nav>
      </div>
    </dialog>
  );
}
