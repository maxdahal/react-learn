import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LockKeyhole,
  Shield,
} from "lucide-react";
export default function ExitGates({
  unlocked,
  escaped,
  onEscape,
  onReturn,
}: {
  unlocked: boolean;
  escaped: boolean;
  onEscape: () => void;
  onReturn: () => void;
}) {
  const [opening, setOpening] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <main
      className={
        "fog-exit-scene " +
        (escaped ? "escaped" : "") +
        " " +
        (opening ? "opening" : "")
      }
    >
      <span className="fog-exit-kicker">
        {escaped ? "TRIAL COMPLETE" : "ALL GENERATORS RESTORED"}
      </span>
      <h1>{escaped ? "You escaped the Fog." : "Power the exit gates."}</h1>
      <p>
        {escaped
          ? "Sixteen concepts repaired. Your code powered the way out."
          : "The final switch is ready. Hold it and let the gate timer finish."}
      </p>
      <div className="fog-final-gates" aria-hidden="true">
        <div className="fog-final-door left">
          {Array.from({ length: 7 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
        <div className="fog-final-light" />
        <div className="fog-final-door right">
          {Array.from({ length: 7 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
        <div className="fog-exit-emblem">
          {escaped ? <Shield size={50} /> : <LockKeyhole size={45} />}
        </div>
      </div>
      {escaped ? (
        <div className="fog-escape-success" role="status">
          <Check size={18} />
          ESCAPED · 16 / 16 VERIFIED REPAIRS
        </div>
      ) : (
        <button
          className="d-next"
          disabled={!unlocked || opening}
          onClick={() => {
            if (!unlocked) return;
            setOpening(true);
            timer.current = setTimeout(() => {
              setOpening(false);
              onEscape();
            }, 1500);
          }}
        >
          {opening ? "Opening gates…" : "Hold exit gate switch"}
          <ArrowRight size={16} />
        </button>
      )}
      <button className="d-link" onClick={onReturn}>
        <ArrowLeft size={14} />
        Return to generators
      </button>
      <span className="fog-exit-save">
        All repair progress stays saved on this device.
      </span>
    </main>
  );
}
