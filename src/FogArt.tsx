import { LockKeyhole, Shield, UserRound, Zap } from "lucide-react";
export function GeneratorArt({
  progress,
  perfect = false,
}: {
  progress: number;
  perfect?: boolean;
}) {
  return (
    <div
      className={
        "fog-machine " +
        (progress === 100 ? "powered" : "") +
        (perfect ? " perfect" : "")
      }
      aria-label={"Generator " + progress + " percent repaired"}
    >
      <svg
        viewBox="0 0 300 180"
        role="img"
        aria-label="Generator repair illustration"
      >
        <defs>
          <linearGradient id="engine-metal" x2="1" y2="1">
            <stop stopColor="#48483e" />
            <stop offset="1" stopColor="#202525" />
          </linearGradient>
        </defs>
        <ellipse cx="154" cy="158" rx="115" ry="11" fill="#0005" />
        <path
          d="M47 147h213M63 147V89l35-25h129l22 26v57"
          fill="url(#engine-metal)"
          stroke="#72664c"
          strokeWidth="3"
        />
        <path
          d="M77 88h152v49H77z"
          fill="#181d1b"
          stroke="#66604a"
          strokeWidth="2"
        />
        <path
          d="M97 64V33h17v31M132 64V23h17v41M168 64V32h17v32M204 64V20h17v44"
          fill="#383b34"
          stroke="#79715a"
          strokeWidth="3"
        />
        <path
          d="M67 120H47V66h24M244 122h22V73h-22"
          fill="none"
          stroke="#5e6256"
          strokeWidth="8"
        />
        <circle
          cx="113"
          cy="112"
          r="17"
          fill="#282d27"
          stroke="#877650"
          strokeWidth="2"
        />
        <circle cx="113" cy="112" r="5" fill="currentColor" />
        <path
          d="M109 107l-8-8m16 17l8 8m-16-8l-8 8m16-17l8-8"
          stroke="#6c7058"
          strokeWidth="4"
        />
        <rect
          x="145"
          y="100"
          width="62"
          height="22"
          rx="2"
          fill="#0c1612"
          stroke="#746647"
        />
        <rect
          x="149"
          y="104"
          width={Math.max(2, (54 * progress) / 100)}
          height="14"
          fill="currentColor"
        />
        <path d="M87 147v8m125-8v8" stroke="#857754" strokeWidth="8" />
        <path
          className="fog-machine-cable"
          d="M212 83c29-35 44-25 54-42"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      <span className="fog-machine-signal">
        <i />
        {progress === 100
          ? "POWER ONLINE"
          : progress >= 50
            ? "REPAIR IN PROGRESS"
            : "SIGNAL LOST"}
      </span>
      {perfect && (
        <div className="fog-sparks" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <i
              key={i}
              style={{ "--spark-angle": i * 40 + "deg" } as React.CSSProperties}
            />
          ))}
        </div>
      )}
    </div>
  );
}
export function TrialHUD({
  repaired,
  perfect,
  onExit,
}: {
  repaired: number;
  perfect: number;
  onExit: () => void;
}) {
  return (
    <div className="fog-trial-hud">
      <div className="fog-objective">
        <Zap size={20} />
        <div>
          <span>GENERATORS LEFT</span>
          <strong>{16 - repaired}</strong>
        </div>
        <small>{repaired} / 16 repaired</small>
      </div>
      <div className="fog-team-icons" aria-label="Your survivor team">
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i}>
            <UserRound size={21} />
            <i />
          </span>
        ))}
      </div>
      <div
        className="fog-terror"
        title="Ambient danger indicator; there is no punishment timer"
      >
        <i />
        <span>THE FOG IS WATCHING</span>
      </div>
      <button
        className={"fog-exit-control " + (repaired === 16 ? "unlocked" : "")}
        disabled={repaired !== 16}
        onClick={onExit}
      >
        {repaired === 16 ? <Shield size={16} /> : <LockKeyhole size={16} />}Exit
        gates{perfect > 0 && <small>{perfect} perfect</small>}
      </button>
    </div>
  );
}
