import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  Heart,
  Package,
  Play,
  Plus,
  RotateCcw,
  Shield,
  UserRound,
  Zap,
} from "lucide-react";
import { Highlight } from "./App";
export const squad = [
  { id: 1, name: "Meg", isInjured: true },
  { id: 2, name: "Claudette", isInjured: false },
  { id: 3, name: "Dwight", isInjured: true },
  { id: 4, name: "Feng", isInjured: false },
];
export function FogWorkbench({
  code,
  controls,
  children,
  file = "survivor.jsx",
}: {
  code: string;
  controls?: React.ReactNode;
  children: React.ReactNode;
  file?: string;
}) {
  return (
    <>
      <div className="d-workbench">
        <section className="d-code-panel" aria-label="Code example">
          <div className="d-panel-title">
            <span>
              <Zap size={13} />
              {file}
            </span>
            <small>REPAIR BLUEPRINT</small>
          </div>
          <div className="d-source">
            <div className="d-lines" aria-hidden="true">
              {code.split("\n").map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            <pre>
              <code>
                <Highlight code={code} />
              </code>
            </pre>
          </div>
        </section>
        <section className="d-preview" aria-label="Visual preview">
          <div className="d-panel-title">
            <span>
              <Play size={12} />
              SURVIVOR PLAYGROUND
            </span>
            <span className="d-live">
              <i />
              LIVE
            </span>
          </div>
          <div className="d-preview-body">{children}</div>
        </section>
      </div>
      {controls && <div className="d-controls">{controls}</div>}
    </>
  );
}
function Choice({
  values,
  value,
  onChange,
  label,
}: {
  values: string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="d-toggle" role="group" aria-label={label}>
      {values.map((v) => (
        <button
          key={v}
          aria-pressed={value === v}
          className={value === v ? "chosen" : ""}
          onClick={() => onChange(v)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
function Loot({ items }: { items: string[] }) {
  return (
    <div className="fog-loot">
      {items.map((item, i) => (
        <span key={i}>
          <Package size={14} />
          {item}
        </span>
      ))}
    </div>
  );
}
function Action({ done }: { done: () => void }) {
  const [mode, setMode] = useState("Standard");
  const [fired, setFired] = useState(false);
  const code =
    mode === "Arrow"
      ? 'const repair = () => "Repair started";\n\nrepair();'
      : 'function repair() {\n  return "Repair started";\n}\nrepair();';
  return (
    <FogWorkbench
      code={code}
      file="actions.js"
      controls={
        <Choice
          label="Action syntax"
          values={["Standard", "Arrow"]}
          value={mode}
          onChange={(m) => {
            setMode(m);
            setFired(false);
          }}
        />
      }
    >
      <div className="fog-action-preview">
        <Zap size={40} />
        <h2>Survivor action</h2>
        <button
          className="d-action"
          onClick={() => {
            setFired(true);
            if (mode === "Arrow") done();
          }}
        >
          Repair
          <ArrowRight size={14} />
        </button>
        <p role="status">{fired ? "Repair started" : "Action ready"}</p>
      </div>
    </FogWorkbench>
  );
}
function Loadout({ done }: { done: () => void }) {
  const [mode, setMode] = useState("Direct access");
  return (
    <FogWorkbench
      code={
        mode === "Destructure"
          ? 'function Loadout({ perk1, perk2 }) {\n  return [perk1, perk2];\n}\nLoadout({ perk1: "Sprint Burst", perk2: "Lithe" });'
          : 'function Loadout(loadout) {\n  return [loadout.perk1, loadout.perk2];\n}\nLoadout({ perk1: "Sprint Burst", perk2: "Lithe" });'
      }
      file="loadout.js"
      controls={
        <Choice
          label="Loadout access"
          values={["Direct access", "Destructure"]}
          value={mode}
          onChange={(v) => {
            setMode(v);
            if (v === "Destructure") done();
          }}
        />
      }
    >
      <div className="fog-perk-loadout">
        <span className="d-label">EQUIPPED PERKS → LOCAL PARAMETERS</span>
        {["Sprint Burst", "Lithe"].map((p, i) => (
          <div key={p}>
            <span className="fog-perk">
              <Zap size={20} />
            </span>
            <code>perk{i + 1}</code>
            <ArrowRight size={15} />
            <b>{p}</b>
          </div>
        ))}
      </div>
    </FogWorkbench>
  );
}
function Inventory({ done }: { done: () => void }) {
  const [copied, setCopied] = useState(false);
  const inventory = ["Flashlight", "Toolbox"];
  const next = copied ? [...inventory, "Medkit"] : [];
  return (
    <FogWorkbench
      code={
        'const inventory = ["Flashlight", "Toolbox"];\nconst next = [...inventory, "Medkit"];\ninventory === next; // false'
      }
      file="inventory.js"
      controls={
        <button
          className="d-action"
          onClick={() => {
            setCopied(true);
            done();
          }}
        >
          <Plus size={14} />
          Add Medkit using spread
        </button>
      }
    >
      <div className="fog-inventory">
        <span className="d-label">ORIGINAL · REFERENCE A</span>
        <Loot items={inventory} />
        <ArrowDown size={18} />
        <span className="d-label">NEW INVENTORY · REFERENCE B</span>
        <Loot items={next} />
        <small>
          {copied
            ? "Original unchanged · new array reference"
            : "Create the copy to collect a Medkit."}
        </small>
      </div>
    </FogWorkbench>
  );
}
function Tags({ done }: { done: () => void }) {
  const [id, setId] = useState("4");
  return (
    <FogWorkbench
      code={
        "const id = " +
        JSON.stringify(id) +
        ";\nconst tag = `survivor-${id}`;\nconst label = `Survivor #${id}`;"
      }
      file="status-tags.js"
      controls={
        <label>
          Survivor ID
          <input
            aria-label="Survivor ID"
            value={id}
            maxLength={12}
            onChange={(e) => {
              setId(e.target.value);
              if (e.target.value && e.target.value !== "4") done();
            }}
          />
        </label>
      }
    >
      <div className="fog-player-tag">
        <UserRound size={45} />
        <h2>Survivor #{id || "?"}</h2>
        <code>{`survivor-${id}`}</code>
      </div>
    </FogWorkbench>
  );
}
function Squad({ done }: { done: () => void }) {
  const [rendered, setRendered] = useState(false);
  const [selected, setSelected] = useState(0);
  return (
    <FogWorkbench
      code={
        "const survivors = [Meg, Claudette, Dwight, Feng];\nconst hud = survivors.map(survivor => (\n  <li key={survivor.id}>{survivor.name}</li>\n));"
      }
      controls={
        <button
          className="d-action"
          onClick={() => {
            setRendered(true);
            done();
          }}
        >
          Render all 4 survivors
          <Play size={13} />
        </button>
      }
    >
      <div>
        <div className="fog-squad">
          {(rendered ? squad : []).map((s, i) => (
            <button
              key={s.id}
              className={selected === i ? "selected" : ""}
              onClick={() => setSelected(i)}
            >
              <UserRound size={27} />
              <b>{s.name}</b>
              <span className={s.isInjured ? "injured" : "healthy"}>
                {s.isInjured ? "Injured" : "Healthy"}
              </span>
            </button>
          ))}
        </div>
        {rendered ? (
          <div className="fog-binding">
            <code>survivor = {JSON.stringify(squad[selected])}</code>
          </div>
        ) : (
          <p className="d-empty">
            The HUD is waiting for your mapped elements.
          </p>
        )}
      </div>
    </FogWorkbench>
  );
}
function Injured({ done }: { done: () => void }) {
  const [filter, setFilter] = useState("All");
  const visible = squad.filter((s) => filter === "All" || s.isInjured);
  return (
    <FogWorkbench
      code={
        "const injured = survivors.filter(s => s.isInjured);\n// Meg and Dwight are kept; the squad is unchanged."
      }
      file="injured-survivors.js"
      controls={
        <Choice
          label="Survivor filter"
          values={["All", "Injured"]}
          value={filter}
          onChange={(v) => {
            setFilter(v);
            if (v === "Injured") done();
          }}
        />
      }
    >
      <div className="fog-survivor-list">
        {visible.map((s) => (
          <div key={s.id}>
            <Heart size={17} />
            <b>{s.name}</b>
            <span>{s.isInjured ? "Injured" : "Healthy"}</span>
          </div>
        ))}
        <small>{visible.length} of 4 survivors shown</small>
      </div>
    </FogWorkbench>
  );
}
function Chests({ done }: { done: () => void }) {
  const [flat, setFlat] = useState(false);
  const chests = [
    { name: "Basement", items: ["Medkit", "Map"] },
    { name: "Shack", items: ["Key", "Toolbox"] },
  ];
  return (
    <FogWorkbench
      code={
        flat
          ? "const loot = chests.flatMap(chest => chest.items);"
          : "const loot = chests.map(chest => chest.items);\n// This returns arrays inside an array."
      }
      file="chest-loot.js"
      controls={
        <button
          className="d-action"
          onClick={() => {
            setFlat(true);
            done();
          }}
        >
          Collect with flatMap
          <ArrowDown size={14} />
        </button>
      }
    >
      <div className="fog-chests">
        <div className="d-groups">
          {chests.map((c) => (
            <div key={c.name}>
              <span>{c.name} chest</span>
              <Loot items={c.items} />
            </div>
          ))}
        </div>
        <ArrowDown size={17} />
        {flat ? (
          <Loot items={chests.flatMap((c) => c.items)} />
        ) : (
          <code>[["Medkit", "Map"], ["Key", "Toolbox"]]</code>
        )}
      </div>
    </FogWorkbench>
  );
}
function Health({ done }: { done: () => void }) {
  const [injured, setInjured] = useState(false);
  return (
    <FogWorkbench
      code={
        "const isInjured = " +
        injured +
        ';\nconst status = isInjured ? "Injured!" : "Healthy";'
      }
      file="health-status.js"
      controls={
        <button
          className="d-switch"
          role="switch"
          aria-checked={injured}
          onClick={() => {
            setInjured(!injured);
            if (!injured) done();
          }}
        >
          <i />
          isInjured
        </button>
      }
    >
      <div className={"fog-health " + (injured ? "injured" : "healthy")}>
        <Heart size={50} />
        <h2>{injured ? "Injured!" : "Healthy"}</h2>
        <span>
          {injured ? "One health state remaining" : "Ready to help your team"}
        </span>
      </div>
    </FogWorkbench>
  );
}
function GameState({ done }: { done: () => void }) {
  const [mode, setMode] = useState("Mutation");
  const [ran, setRan] = useState(false);
  const sawMutation = useRef(false);
  const original = ["Flashlight", "Toolbox"];
  let inventory = [...original];
  let next: string[] = [];
  if (ran) {
    if (mode === "Mutation") {
      inventory.push("Medkit");
      next = inventory;
    } else next = [...inventory, "Medkit"];
  }
  return (
    <FogWorkbench
      code={
        mode === "Mutation"
          ? 'const next = inventory;\nnext.push("Medkit");\n// Original inventory changed.'
          : 'const next = [...inventory, "Medkit"];\n// Original inventory stays unchanged.'
      }
      file="game-state.js"
      controls={
        <>
          <Choice
            label="Inventory update"
            values={["Mutation", "Immutable"]}
            value={mode}
            onChange={(v) => {
              setMode(v);
              setRan(false);
            }}
          />
          <button
            className="d-action"
            onClick={() => {
              setRan(true);
              if (mode === "Mutation") sawMutation.current = true;
              else if (sawMutation.current) done();
            }}
          >
            Run update
            <Play size={13} />
          </button>
        </>
      }
    >
      <div className="fog-inventory">
        <span className="d-label">ORIGINAL INVENTORY</span>
        <Loot items={inventory} />
        <span className="d-label">NEXT INVENTORY</span>
        <Loot items={next} />
        {ran && (
          <div
            className={
              "d-integrity " + (mode === "Mutation" ? "warning" : "safe")
            }
            role="status"
          >
            {mode === "Mutation"
              ? "Mutation: original inventory changed."
              : "Safe: original untouched, new reference created."}
          </div>
        )}
      </div>
    </FogWorkbench>
  );
}
function GateTimer({ done }: { done: () => void }) {
  const [status, setStatus] = useState("idle");
  const [clicks, setClicks] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const request = useRef(0);
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      request.current++;
    },
    [],
  );
  return (
    <FogWorkbench
      code={
        'async function escape() {\n  setStatus("opening");\n  await openExitGate();\n  setStatus("open");\n}'
      }
      file="open-exit-gate.js"
      controls={
        <button
          className="d-action"
          disabled={status === "opening"}
          onClick={async () => {
            const id = ++request.current;
            setStatus("opening");
            await new Promise<void>((resolve) => {
              timer.current = setTimeout(resolve, 900);
            });
            if (id === request.current) {
              setStatus("open");
              done();
            }
          }}
        >
          <Play size={13} />
          {status === "opening" ? "Switch held…" : "Hold gate switch"}
        </button>
      }
    >
      <div className="fog-gate-demo">
        <div className={"fog-gate-bars " + (status === "open" ? "open" : "")}>
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <h3 aria-live="polite">
          {status === "idle"
            ? "Gate switch ready"
            : status === "opening"
              ? "Awaiting gate timer…"
              : "Gate timer complete"}
        </h3>
        <button
          className="d-responsive-button"
          onClick={() => setClicks((c) => c + 1)}
        >
          HUD stays responsive<b>{clicks}</b>
        </button>
        <small>
          Local timer demonstration. The trial exit still needs all 16
          generators.
        </small>
      </div>
    </FogWorkbench>
  );
}
function PerkModules({ done }: { done: () => void }) {
  const [file, setFile] = useState("Loadout.jsx");
  const [named, setNamed] = useState(false);
  const perk = named
    ? "export function SprintBurst() {\n  return <button>Sprint Burst</button>;\n}"
    : "export default function SprintBurst() {\n  return <button>Sprint Burst</button>;\n}";
  const app =
    (named
      ? 'import { SprintBurst } from "./Perk";'
      : 'import SprintBurst from "./Perk";') +
    "\nexport default function Loadout() {\n  return <SprintBurst />;\n}";
  return (
    <FogWorkbench
      code={file === "Perk.jsx" ? perk : app}
      file={file}
      controls={
        <Choice
          label="Perk export"
          values={["Default", "Named"]}
          value={named ? "Named" : "Default"}
          onChange={(v) => {
            setNamed(v === "Named");
            if (v === "Named" && file === "Perk.jsx") done();
          }}
        />
      }
    >
      <div className="d-modules">
        <div className="d-file-tree">
          <span className="d-label">SURVIVOR LOADOUT</span>
          {["Perk.jsx", "Loadout.jsx"].map((f) => (
            <button
              key={f}
              aria-pressed={file === f}
              onClick={() => {
                setFile(f);
                if (f === "Perk.jsx" && named) done();
              }}
            >
              {f}
              <span>{f === "Perk.jsx" ? "exports" : "imports"}</span>
            </button>
          ))}
        </div>
        <div className="d-module-path">
          <code>Perk.jsx</code>
          <ArrowRight size={15} />
          <code>Loadout.jsx</code>
        </div>
        <span className="fog-perk standalone">
          <Zap size={26} />
        </span>
        <p>Sprint Burst equipped</p>
      </div>
    </FogWorkbench>
  );
}
function HUD({ done }: { done: () => void }) {
  const [perk, setPerk] = useState(false);
  const [health, setHealth] = useState(false);
  return (
    <FogWorkbench
      code={
        "function SurvivorHUD() {\n  return <article>\n" +
        (perk ? "    <PerkIcon />\n" : "") +
        (health ? "    <HealthBar />\n" : "") +
        "  </article>;\n}"
      }
      controls={
        <>
          <label className="d-checkbox">
            <input
              type="checkbox"
              checked={perk}
              onChange={(e) => {
                setPerk(e.target.checked);
                if (e.target.checked && health) done();
              }}
            />
            PerkIcon
          </label>
          <label className="d-checkbox">
            <input
              type="checkbox"
              checked={health}
              onChange={(e) => {
                setHealth(e.target.checked);
                if (e.target.checked && perk) done();
              }}
            />
            HealthBar
          </label>
        </>
      }
    >
      <div className="fog-built-hud">
        <span className="d-render-tag">&lt;SurvivorHUD /&gt;</span>
        <div>
          <UserRound size={42} />
          <h3>Meg Thomas</h3>
          {perk && (
            <span className="fog-perk">
              <Zap size={22} />
            </span>
          )}
          {health && (
            <div className="fog-healthbar" aria-label="Health bar">
              <i />
              <i />
            </div>
          )}
          {!perk && !health && <p>Add components to assemble the HUD.</p>}
        </div>
      </div>
    </FogWorkbench>
  );
}
function SurvivorRow({
  survivor,
  onEdited,
}: {
  survivor: (typeof squad)[number];
  onEdited: () => void;
}) {
  const [note, setNote] = useState(survivor.name + " note");
  return (
    <div className="d-key-row">
      <span>
        {survivor.name}
        <small>id: {survivor.id}</small>
      </span>
      <input
        aria-label={"Note for " + survivor.name}
        value={note}
        maxLength={30}
        onChange={(e) => {
          setNote(e.target.value);
          onEdited();
        }}
      />
    </div>
  );
}
function HookStates({ done }: { done: () => void }) {
  const [mode, setMode] = useState("Index");
  const [survivors, setSurvivors] = useState(squad.slice(0, 3));
  const [edited, setEdited] = useState(false);
  return (
    <FogWorkbench
      code={
        "{survivors.map((survivor, index) => (\n  <SurvivorRow key={" +
        (mode === "Stable IDs" ? "survivor.id" : "index") +
        "} survivor={survivor} />\n))}"
      }
      controls={
        <>
          <Choice
            label="Survivor keys"
            values={["Index", "Stable IDs"]}
            value={mode}
            onChange={(v) => {
              setMode(v);
              setEdited(false);
            }}
          />
          <button
            className="d-action"
            onClick={() => {
              setSurvivors([...survivors.slice(1), survivors[0]]);
              if (mode === "Stable IDs" && edited) done();
            }}
          >
            <RotateCcw size={14} />
            Rotate squad
          </button>
        </>
      }
    >
      <div className="d-keys">
        <span className="d-label">SURVIVOR NOTE STATE · EDIT THEN REORDER</span>
        <div key={mode}>
          {survivors.map((s, i) => (
            <SurvivorRow
              key={mode === "Stable IDs" ? s.id : i}
              survivor={s}
              onEdited={() => setEdited(true)}
            />
          ))}
        </div>
        <small>
          {mode === "Stable IDs"
            ? "Stable survivor IDs keep each note with its survivor."
            : "Index keys can attach notes to a different survivor after reordering."}
        </small>
      </div>
    </FogWorkbench>
  );
}
function RepairMeter({ done }: { done: () => void }) {
  const [progress, setProgress] = useState(0);
  return (
    <FogWorkbench
      code={
        "const [progress, setProgress] = useState(0);\n<button onClick={() => setProgress(prev => Math.min(100, prev + 25))}>\n  Repair\n</button>\n<progress value={progress} max={100} />"
      }
      controls={
        <>
          <button
            className="d-action"
            disabled={progress === 100}
            onClick={() => {
              const next = Math.min(100, progress + 25);
              setProgress(next);
              if (next === 100) done();
            }}
          >
            <Zap size={14} />
            Repair +25
          </button>
          <button className="d-link" onClick={() => setProgress(0)}>
            <RotateCcw size={13} />
            Reset meter
          </button>
        </>
      }
    >
      <div className="fog-local-meter">
        <Zap size={38} />
        <h2>{progress}%</h2>
        <div
          role="progressbar"
          aria-label="Practice generator repair"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <i style={{ width: progress + "%" }} />
        </div>
        <span>Each setter call queues a React render.</span>
      </div>
    </FogWorkbench>
  );
}
function EntityServer({ done }: { done: () => void }) {
  const [mode, setMode] = useState("Client HUD");
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (phase !== 1) return;
    const timer = setTimeout(() => setPhase(2), 900);
    return () => clearTimeout(timer);
  }, [phase]);
  const server = mode === "Entity server";
  return (
    <FogWorkbench
      code={
        server
          ? "async function MatchStats() {\n  const stats = await getMatchStats();\n  return <Stats stats={stats} />;\n}\n<Suspense fallback={<LoadingBloodweb />}>\n  <MatchStats />\n</Suspense>"
          : "function ClientHUD() {\n  const [stats, setStats] = useState(null);\n  useEffect(() => { getMatchStats().then(setStats); }, []);\n  return stats ? <Stats stats={stats} /> : <Spinner />;\n}"
      }
      controls={
        <>
          <Choice
            label="Match rendering architecture"
            values={["Client HUD", "Entity server"]}
            value={mode}
            onChange={(v) => {
              setMode(v);
              setPhase(0);
            }}
          />
          <button
            className="d-action"
            disabled={phase === 1}
            onClick={() => setPhase(1)}
          >
            Load match stats
            <Play size={13} />
          </button>
        </>
      }
    >
      <div className="d-framework">
        <span className="d-model-label">
          TIMING MODEL · NO LIVE GAME SERVER
        </span>
        <div className="d-stream-frame">
          {phase === 0 ? (
            <p>Choose a renderer and request the match.</p>
          ) : phase === 1 ? (
            <div className="d-skeleton" role="status">
              <span />
              <span />
              <small>
                {server
                  ? "LoadingBloodweb · Suspense fallback"
                  : "Client fetch pending"}
                …
              </small>
            </div>
          ) : (
            <div>
              <h3>Match stats ready</h3>
              <p>4 survivors · 2 injured</p>
              <button
                className="d-action"
                onClick={() => {
                  setPhase(3);
                  if (server) done();
                }}
              >
                {phase === 3 ? "HUD synced ✓" : "Sync HUD"}
              </button>
            </div>
          )}
        </div>
      </div>
    </FogWorkbench>
  );
}
function PlatformHUD({ done }: { done: () => void }) {
  const [target, setTarget] = useState("Web HUD");
  const [repaired, setRepaired] = useState(false);
  const web = target === "Web HUD";
  return (
    <FogWorkbench
      code={
        web
          ? "function HUD() {\n  return <div><h2>Survivor HUD</h2><button>Repair</button></div>;\n}"
          : 'import { View, Text, Pressable } from "react-native";\nfunction HUD() {\n  return <View><Text>Survivor HUD</Text>\n    <Pressable><Text>Repair</Text></Pressable>\n  </View>;\n}'
      }
      controls={
        <Choice
          label="HUD platform"
          values={["Web HUD", "iOS", "Android"]}
          value={target}
          onChange={(v) => {
            setTarget(v);
            setRepaired(false);
          }}
        />
      }
    >
      <div className="d-platform-example">
        <span className="d-model-label">
          {web
            ? "REACT DOM · HTML HUD"
            : "NATIVE VIEW MODEL · NOT A MOBILE RUNTIME"}
        </span>
        <div
          className={
            "d-device " + (web ? "browser" : "phone " + target.toLowerCase())
          }
        >
          <div className="d-device-chrome">
            {web ? "Web (DOM)" : target + " · Native views"}
          </div>
          <div className="d-device-content">
            <Shield size={36} />
            <h2>Survivor HUD</h2>
            <button
              onClick={() => {
                setRepaired(true);
                if (!web) done();
              }}
            >
              {repaired ? "Repair +25 ✓" : "Repair HUD"}
            </button>
          </div>
        </div>
        <div className="d-platform-mapping">
          <code>
            {web
              ? "JSX → DOM elements"
              : "JSX → Native View / Text / Pressable"}
          </code>
        </div>
      </div>
    </FogWorkbench>
  );
}
export default function FogExplore({
  index,
  onComplete,
}: {
  index: number;
  onComplete: () => void;
}) {
  const views = [
    Action,
    Loadout,
    Inventory,
    Tags,
    Squad,
    Injured,
    Chests,
    Health,
    GameState,
    GateTimer,
    PerkModules,
    HUD,
    HookStates,
    RepairMeter,
    EntityServer,
    PlatformHUD,
  ];
  const View = views[index];
  return <View done={onComplete} />;
}
