import { useEffect, useRef, useState } from "react";
import { Check, Play, Shield, Zap } from "lucide-react";
import { scoreSkillCheck } from "./fogGame";
import type { SkillResult } from "./fogGame";
export default function SkillCheck({
  eligible,
  repaired,
  perfect = false,
  assisted,
  onAssist,
  onResult,
}: {
  eligible: boolean;
  repaired: boolean;
  perfect?: boolean;
  assisted: boolean;
  onAssist: (v: boolean) => void;
  onResult: (r: SkillResult) => void;
}) {
  const [phase, setPhase] = useState<
    "idle" | "running" | "miss" | "good" | "perfect"
  >("idle");
  const [position, setPosition] = useState(0);
  const needle = useRef(0);
  const start = useRef(0);
  const raf = useRef(0);
  const latest = useRef(onResult);
  latest.current = onResult;
  useEffect(() => {
    if (!eligible || assisted || repaired) {
      cancelAnimationFrame(raf.current);
      setPhase("idle");
    }
  }, [eligible, assisted, repaired]);
  useEffect(() => {
    if (phase !== "running") return;
    function tick(now: number) {
      const p = Math.min(1, (now - start.current) / 3400);
      needle.current = p;
      setPosition(p);
      if (p === 1) {
        setPhase("miss");
        latest.current("miss");
      } else raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [phase]);
  function hit() {
    if (!eligible || repaired || phase !== "running") return;
    const score = scoreSkillCheck(needle.current);
    cancelAnimationFrame(raf.current);
    setPhase(score);
    latest.current(score);
  }
  const hitRef = useRef(hit);
  hitRef.current = hit;
  useEffect(() => {
    if (phase !== "running") return;
    const key = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        target.closest(
          'input,textarea,select,[contenteditable="true"],.monaco-editor',
        )
      )
        return;
      e.preventDefault();
      hitRef.current();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [phase]);
  if (repaired)
    return (
      <div className="fog-skill repaired" role="status">
        <Check size={23} />
        <div>
          <b>{perfect ? "PERFECT SKILL CHECK" : "GENERATOR REPAIRED"}</b>
          <p>Verified code. Power restored.</p>
        </div>
        <Zap size={28} />
      </div>
    );
  return (
    <section
      className={"fog-skill " + phase}
      aria-label="Generator skill check"
    >
      <div className="fog-skill-heading">
        <span>
          <Zap size={15} />
          FINAL SKILL CHECK
        </span>
        <label>
          <input
            type="checkbox"
            checked={assisted}
            onChange={(e) => onAssist(e.target.checked)}
          />
          <Shield size={12} />
          Assist · no timing
        </label>
      </div>
      <div className="fog-skill-body">
        {!assisted && (
          <div className="fog-skill-dial" aria-hidden="true">
            <div className="fog-skill-ring" />
            <div
              className="fog-skill-needle"
              style={{ transform: `rotate(${position * 360}deg)` }}
            />
            <span>
              <Zap size={20} />
            </span>
          </div>
        )}
        <div>
          <p>
            {!eligible
              ? "Verify the repair blueprint to arm this check."
              : assisted
                ? "Blueprint verified. Complete an untimed check."
                : phase === "running"
                  ? "Stop in the marked sector. The gold center is perfect."
                  : phase === "miss"
                    ? "Missed the sector. Your code is safe—try again or use Assist."
                    : "Blueprint verified. Start the needle, then press Space or Hit."}
          </p>
          {assisted ? (
            <button
              className="d-action"
              disabled={!eligible}
              onClick={() => {
                setPhase("good");
                onResult("good");
              }}
            >
              <Check size={15} />
              Complete assisted skill check
            </button>
          ) : phase === "running" ? (
            <button className="d-action fog-hit" onClick={hit}>
              <Zap size={15} />
              Hit · Space
            </button>
          ) : (
            <button
              className="d-action"
              disabled={!eligible}
              onClick={() => {
                needle.current = 0;
                setPosition(0);
                start.current = performance.now();
                setPhase("running");
              }}
            >
              <Play size={13} />
              {phase === "miss" ? "Retry skill check" : "Start skill check"}
            </button>
          )}
          <span className="fog-skill-legend">
            {assisted
              ? "Same repair credit. No reaction-speed requirement."
              : "Marked sector = success · gold = perfect · no progress lost on a miss"}
          </span>
        </div>
      </div>
      <div className="sr-only" role="status">
        {phase === "running"
          ? "Skill check active. Press Space to stop."
          : phase === "miss"
            ? "Missed skill check. Retry is available."
            : ""}
      </div>
    </section>
  );
}
