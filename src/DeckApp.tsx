import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Braces,
  Check,
  ChevronRight,
  Code2,
  FileCode2,
  GitBranch,
  Lightbulb,
  List,
  Moon,
  Play,
  Plus,
  RotateCcw,
  Sun,
  X,
} from "lucide-react";
import MapLab, { Highlight } from "./App";
import "./deck.css";
export const deckStorageKey = "syntax-lab-deck-v3";
export const deckLessons = [
  [
    "Functions & arrow functions",
    "Different syntax. The same job.",
    "A function takes an input and returns a result. React components are functions that return UI.",
    "An arrow function with an expression returns it automatically. A function body with { } needs return.",
  ],
  [
    "Object & array destructuring",
    "Unpack the values you need.",
    "Destructuring gives a local name to a value inside an object or array. React uses both patterns for props and hooks.",
    "Object names match property names. Array names match positions: the first variable gets the first value.",
  ],
  [
    "Rest & spread",
    "Keep the original. Make a new one.",
    "Spread copies values into a new object or array. Rest gathers remaining values into a new variable.",
    "Spread copies are shallow: nested objects are still shared. The same ... symbol means rest when collecting values in a declaration.",
  ],
  [
    "Template literals",
    "Let a string follow your data.",
    "Backticks create a template literal. Put an expression inside ${…} to insert its value.",
    "The curly braces evaluate JavaScript; the rest is text. A ternary can choose which class name gets inserted.",
  ],
  [
    "Array transformation: .map()",
    "One item in. One result out.",
    "Your callback runs once for each item. .map() gathers the returned values into a new array, in the same order.",
    "item is a local name for the current object, not a special word. key uses a stable ID to identify each list item.",
  ],
  [
    "Array filtering: .filter()",
    "Keep the items that match.",
    "The callback returns true to keep an item, or false to leave it out. The original array stays unchanged.",
    "Unlike .map(), .filter() does not transform items. It selects a subset of the original items.",
  ],
  [
    "Flattening: .flatMap() & .reduce()",
    "Nested groups. One useful list.",
    ".flatMap() maps each item, then flattens one level. A reducer can also combine groups into one array.",
    "In reduce(), all is the accumulated result and category is the current item. The final [] is the starting value.",
  ],
  [
    "Inline conditional logic",
    "Choose what appears.",
    "A ternary chooses between two outputs. Logical AND renders the right-hand content when its condition is true.",
    "Use booleans with &&. A number such as 0 && <Message /> can render 0 instead of hiding everything.",
  ],
  [
    "Immutability & pure functions",
    "Same input. Predictable output.",
    "A pure transformation leaves its input unchanged. Mutating an array shared with React state can make updates unpredictable.",
    "push() changes the original and returns its new length. Spread or concat() can return a fresh array without changing the input.",
  ],
  [
    "Async JavaScript & promises",
    "Wait without freezing the interface.",
    "An async function returns a promise. await pauses that function until a promise settles; the rest of the interface can still respond.",
    "This uses a local fake request, not a real server. try/catch handles a rejected promise, and finally clears the loading state.",
  ],
  [
    "ES modules",
    "Separate files. Connected pieces.",
    "Export a function from one file, then import it into another. Named and default exports use different import syntax.",
    "A default import can use a different local name. Named imports match the exported name, unless you explicitly rename them with as.",
  ],
  [
    "Component composition & JSX",
    "Small pieces become a whole.",
    "JSX describes the interface you want. Compose small components to build a larger view.",
    "Capitalized names refer to components. Lowercase names such as button and article refer to built-in browser elements.",
  ],
  [
    "List rendering & keys",
    "Keep identity when position changes.",
    "A stable key lets React match an item between renders. Reorder the list and see whether each local note stays with its item.",
    "An index key follows a position, not your data. Notes can attach to the wrong item after reordering; keys are not passed as component props.",
  ],
  [
    "State & reactive interfaces",
    "An event changes state. UI follows.",
    "useState gives a component memory. Calling its setter queues a new render with the updated value.",
    "State is a snapshot for a render. React runs the component again, then updates the browser to match the new output.",
  ],
  [
    "UI library vs. frameworks",
    "Different rendering journeys.",
    "React describes UI. Frameworks add routing and coordinate server data, rendering, and Suspense boundaries.",
    "This is a timing model, not a server runtime. Server-rendered HTML and Server Components are related but different features.",
  ],
  [
    "Web & native rendering",
    "One component model. Different targets.",
    "React DOM renders browser elements. React Native uses platform-native views; Expo adds tooling and native APIs.",
    "This phone is an illustration, not a native app or WebView demo. Actual native views require a React Native runtime.",
  ],
] as const;
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
function Toggle({
  options,
  value,
  onChange,
  label,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="d-toggle" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o}
          aria-pressed={o === value}
          className={o === value ? "chosen" : ""}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
function Workbench({
  code,
  controls,
  children,
  file = "example.jsx",
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
              <Code2 size={14} />
              {file}
            </span>
            <small>LIVE EXAMPLE</small>
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
              RESULT
            </span>
            <span className="d-live">
              <i /> LIVE
            </span>
          </div>
          <div className="d-preview-body">{children}</div>
        </section>
      </div>
      {controls && <div className="d-controls">{controls}</div>}
    </>
  );
}
function Chips({ items }: { items: (string | number)[] }) {
  return (
    <div className="d-chips">
      <span>[</span>
      {items.map((v, i) => (
        <code key={i}>{typeof v === "string" ? JSON.stringify(v) : v}</code>
      ))}
      <span>]</span>
    </div>
  );
}
function Functions() {
  const [style, setStyle] = useState("Arrow");
  const [name, setName] = useState("Designer");
  const greet =
    style === "Arrow"
      ? (name: string) => `Hello, ${name}!`
      : function greet(name: string) {
          return `Hello, ${name}!`;
        };
  const code =
    style === "Arrow"
      ? "const greet = (name) => `Hello, ${name}!`;\n\ngreet(" +
        JSON.stringify(name) +
        ");"
      : "function greet(name) {\n  return `Hello, ${name}!`;\n}\n\ngreet(" +
        JSON.stringify(name) +
        ");";
  return (
    <Workbench
      code={code}
      file="functions.js"
      controls={
        <>
          <Toggle
            label="Function syntax"
            options={["Arrow", "Standard"]}
            value={style}
            onChange={setStyle}
          />
          <label>
            Your name
            <input
              aria-label="Greeting name"
              value={name}
              maxLength={30}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        </>
      }
    >
      <div className="d-greeting">
        <span className="d-orbit">✳</span>
        <small>RETURNED STRING</small>
        <h2 aria-live="polite">{greet(name)}</h2>
        <span className="d-hint-line">New syntax. Identical behavior.</span>
      </div>
    </Workbench>
  );
}
function Destructuring() {
  const [kind, setKind] = useState("Object");
  const [unpack, setUnpack] = useState("Destructure");
  const props = { name: "Ada", age: 28 };
  const pair = [3, "setCount"] as const;
  const code =
    kind === "Object"
      ? unpack === "Destructure"
        ? 'const props = { name: "Ada", age: 28 };\nconst { name, age } = props;\n\nname; // "Ada"'
        : 'const props = { name: "Ada", age: 28 };\nconst name = props.name;\nconst age = props.age;\n\nname; // "Ada"'
      : unpack === "Destructure"
        ? 'const pair = [3, "setCount"];\nconst [count, setterName] = pair;\n\n// React uses this pattern:\n// const [count, setCount] = useState(0);'
        : 'const pair = [3, "setCount"];\nconst count = pair[0];\nconst setterName = pair[1];';
  return (
    <Workbench
      code={code}
      file="destructuring.js"
      controls={
        <>
          <Toggle
            label="Destructuring type"
            options={["Object", "Array"]}
            value={kind}
            onChange={setKind}
          />
          <Toggle
            label="Access pattern"
            options={["Destructure", "Direct access"]}
            value={unpack}
            onChange={setUnpack}
          />
        </>
      }
    >
      <div className="d-binding-visual">
        <span className="d-label">
          {kind === "Object" ? "OBJECT PROPERTIES" : "ARRAY POSITIONS"}
        </span>
        {(kind === "Object"
          ? [
              ["name", props.name],
              ["age", props.age],
            ]
          : [
              ["count", pair[0]],
              ["setterName", pair[1]],
            ]
        ).map(([key, value], i) => (
          <div key={key}>
            <span>{kind === "Object" ? "." + key : "[" + i + "]"}</span>
            <ArrowRight size={16} />
            <b>{key}</b>
            <code>{JSON.stringify(value)}</code>
          </div>
        ))}
        <small>
          {kind === "Array"
            ? '"setCount" is a string here to visualize positions; the hook returns a function.'
            : "The property names become local variables."}
        </small>
      </div>
    </Workbench>
  );
}
function Spread() {
  const [kind, setKind] = useState("Array");
  const [items, setItems] = useState(["Research", "Design"]);
  const [status, setStatus] = useState("away");
  const [draft, setDraft] = useState("Test");
  const [revision, setRevision] = useState(0);
  const original = ["Research", "Design"];
  const user = { name: "Ada", status: "away" };
  const code =
    kind === "Array"
      ? 'const items = ["Research", "Design"];\nconst newItem = ' +
        JSON.stringify(draft || "Test") +
        ";\nconst next = [...items, newItem];\n\nitems === next; // false"
      : kind === "Object"
        ? 'const user = { name: "Ada", status: "away" };\nconst next = { ...user, status: "active" };\n\nuser === next; // false'
        : 'const user = { name: "Ada", role: "Designer", id: 7 };\nconst { name, ...details } = user;\n\n// details: { role: "Designer", id: 7 }';
  return (
    <Workbench
      code={code}
      file="spread-and-rest.js"
      controls={
        <>
          <Toggle
            label="Spread or rest example"
            options={["Array", "Object", "Rest"]}
            value={kind}
            onChange={(k) => {
              setKind(k);
              setItems(original);
              setRevision(0);
              setStatus("away");
            }}
          />
          {kind === "Array" && (
            <>
              <label>
                New item
                <input
                  aria-label="New spread item"
                  value={draft}
                  maxLength={25}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    setItems(original);
                    setRevision(0);
                  }}
                />
              </label>
              <button
                className="d-action"
                onClick={() => {
                  setItems([...original, draft || "Test"]);
                  setRevision(1);
                }}
              >
                <Plus size={14} /> Create copy
              </button>
            </>
          )}
          {kind === "Object" && (
            <button
              className="d-action"
              onClick={() => {
                setStatus("active");
                setRevision(1);
              }}
            >
              Set active in copy
              <ArrowRight size={14} />
            </button>
          )}
        </>
      }
    >
      <div className="d-memory">
        <div>
          <span className="d-label">ORIGINAL · REFERENCE A</span>
          {kind === "Array" ? (
            <Chips items={original} />
          ) : (
            <code>
              {JSON.stringify(
                kind === "Rest"
                  ? { name: "Ada", role: "Designer", id: 7 }
                  : user,
              )}
            </code>
          )}
        </div>
        <ArrowDown size={18} />
        <div className={revision ? "d-memory-new" : ""}>
          <span className="d-label">
            {kind === "Rest"
              ? "COLLECTED INTO details"
              : revision
                ? "NEW COPY · REFERENCE B"
                : "RUN THE EXAMPLE TO CREATE A COPY"}
          </span>
          {kind === "Array" ? (
            <Chips items={revision ? items : []} />
          ) : (
            <code>
              {kind === "Rest"
                ? JSON.stringify({ role: "Designer", id: 7 })
                : revision
                  ? JSON.stringify({ ...user, status })
                  : "—"}
            </code>
          )}
        </div>
        <span className="d-hint-line">
          {kind === "Rest"
            ? "name is unpacked; details collects the remaining properties."
            : revision
              ? "Original !== copy · distinct references"
              : "The original remains unchanged."}
        </span>
      </div>
    </Workbench>
  );
}
function Templates() {
  const [id, setId] = useState("42");
  const [active, setActive] = useState(true);
  const className = `btn ${active ? "active" : ""}`;
  return (
    <Workbench
      code={
        "const id = " +
        JSON.stringify(id) +
        ";\nconst isActive = " +
        active +
        ';\nconst cardId = `user-card-${id}`;\nconst className = `btn ${isActive ? "active" : ""}`;'
      }
      file="dynamic-strings.js"
      controls={
        <>
          <label>
            User ID
            <input
              aria-label="User ID"
              value={id}
              maxLength={20}
              onChange={(e) => setId(e.target.value)}
            />
          </label>
          <button
            className="d-switch"
            role="switch"
            aria-checked={active}
            onClick={() => setActive(!active)}
          >
            <i /> isActive
          </button>
        </>
      }
    >
      <div className="d-template-preview">
        <div className="d-attribute">
          <span>id</span>
          <code>{`user-card-${id}`}</code>
        </div>
        <div className="d-attribute">
          <span>className</span>
          <code>{JSON.stringify(className)}</code>
        </div>
        <button
          className={active ? "d-example-button active" : "d-example-button"}
          onClick={() => setActive(!active)}
        >
          User {id || "—"}
          <span>{active ? "Active" : "Inactive"}</span>
        </button>
      </div>
    </Workbench>
  );
}
type Item = { id: number; name: string };
const initialItems: Item[] = [
  { id: 1, name: "Research" },
  { id: 2, name: "Design" },
  { id: 3, name: "Test" },
];
function Mapping({ openLab }: { openLab: () => void }) {
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState("Ship");
  const [selected, setSelected] = useState(0);
  const nextId = useRef(4);
  const code =
    "const items = " +
    JSON.stringify(items) +
    ";\n\nconst list = items.map(item => (\n  <li key={item.id}>{item.name}</li>\n));";
  return (
    <Workbench
      code={code}
      controls={
        <>
          <form
            className="d-add-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim() && items.length < 6) {
                setItems([
                  ...items,
                  { id: nextId.current++, name: draft.trim() },
                ]);
                setDraft("");
              }
            }}
          >
            <label>
              Add a label
              <input
                aria-label="Map item name"
                value={draft}
                maxLength={25}
                onChange={(e) => setDraft(e.target.value)}
              />
            </label>
            <button
              className="d-action"
              disabled={!draft.trim() || items.length >= 6}
            >
              <Plus size={14} />
              Add
            </button>
          </form>
          <button className="d-link" onClick={openLab}>
            Open detailed .map() walkthrough
            <ArrowRight size={14} />
          </button>
        </>
      }
    >
      <div className="d-map-preview">
        <div className="d-label">CLICK A ROW TO FOLLOW ITS ITEM</div>
        <ul>
          {items.map((item, i) => (
            <li key={item.id}>
              <button
                className={selected === i ? "d-selected-row" : ""}
                onClick={() => setSelected(i)}
              >
                <span>{i}</span>
                {item.name}
                <code>key={item.id}</code>
              </button>
              <button
                className="d-remove"
                aria-label={"Remove " + item.name}
                disabled={items.length === 1}
                onClick={() => {
                  setItems(items.filter((v) => v.id !== item.id));
                  setSelected(0);
                }}
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
        <div className="d-current-item">
          <code>
            item = {JSON.stringify(items[Math.min(selected, items.length - 1)])}
          </code>
          <ArrowDown size={14} />
          <code>
            &lt;li&gt;{items[Math.min(selected, items.length - 1)].name}
            &lt;/li&gt;
          </code>
        </div>
      </div>
    </Workbench>
  );
}
const tasks = [
  { id: 1, name: "Interview users", isCompleted: true },
  { id: 2, name: "Build prototype", isCompleted: false },
  { id: 3, name: "Test navigation", isCompleted: false },
];
function Filtering() {
  const [filter, setFilter] = useState("All");
  const visible = tasks.filter(
    (item) =>
      filter === "All" ||
      (filter === "Completed" ? item.isCompleted : !item.isCompleted),
  );
  const expression =
    filter === "All"
      ? "true"
      : filter === "Completed"
        ? "item.isCompleted"
        : "!item.isCompleted";
  return (
    <Workbench
      code={
        "const visible = items.filter(item =>\n  " +
        expression +
        "\n);\n\n// " +
        visible.length +
        " of " +
        tasks.length +
        " items kept"
      }
      file="filter.js"
      controls={
        <Toggle
          label="Task filter"
          options={["All", "Active", "Completed"]}
          value={filter}
          onChange={setFilter}
        />
      }
    >
      <div className="d-filter-preview">
        <div className="d-label">CALLBACK DECISIONS</div>
        {tasks.map((item) => (
          <div
            className={
              "d-filter-row " + (visible.includes(item) ? "kept" : "removed")
            }
            key={item.id}
          >
            <span>{item.name}</span>
            <code>
              {visible.includes(item) ? "true → keep" : "false → omit"}
            </code>
          </div>
        ))}
        <div className="d-divider" />
        <div className="d-label">RENDERED LIST · {visible.length} ITEMS</div>
        <ul>
          {visible.map((item) => (
            <li key={item.id}>
              <span
                className={item.isCompleted ? "d-task-dot done" : "d-task-dot"}
              />
              {item.name}
            </li>
          ))}
        </ul>
      </div>
    </Workbench>
  );
}
function Flattening() {
  const [method, setMethod] = useState("flatMap");
  const [extra, setExtra] = useState(false);
  const categories = [
    { name: "Discovery", products: ["Interview", "Survey"] },
    {
      name: "Delivery",
      products: extra ? ["Prototype", "Test", "Ship"] : ["Prototype", "Test"],
    },
  ];
  const result =
    method === "flatMap"
      ? categories.flatMap((cat) => cat.products)
      : categories.reduce<string[]>(
          (all, cat) => [...all, ...cat.products],
          [],
        );
  return (
    <Workbench
      code={
        method === "flatMap"
          ? "const result = categories.flatMap(category =>\n  category.products\n);"
          : "const result = categories.reduce(\n  (all, category) => [...all, ...category.products],\n  []\n);"
      }
      file="flatten.js"
      controls={
        <>
          <Toggle
            label="Flatten method"
            options={["flatMap", "reduce"]}
            value={method}
            onChange={setMethod}
          />
          <button
            className="d-switch"
            role="switch"
            aria-checked={extra}
            onClick={() => setExtra(!extra)}
          >
            <i /> Include “Ship”
          </button>
        </>
      }
    >
      <div className="d-flatten">
        <div className="d-groups">
          {categories.map((c) => (
            <div key={c.name}>
              <span>{c.name}</span>
              <Chips items={c.products} />
            </div>
          ))}
        </div>
        <div className="d-flow-line">
          <ArrowDown size={18} />
          <code>.{method}()</code>
        </div>
        <Chips items={result} />
        <small>One level · {result.length} strings</small>
      </div>
    </Workbench>
  );
}
function Conditionals() {
  const [logged, setLogged] = useState(false);
  const [error, setError] = useState(false);
  return (
    <Workbench
      code={
        "const isLoggedIn = " +
        logged +
        ";\nconst hasError = " +
        error +
        ";\n\nreturn <>\n  {isLoggedIn ? <Dashboard /> : <LoginForm />}\n  {hasError && <ErrorMessage />}\n</>;"
      }
      controls={
        <>
          <button
            className="d-switch"
            role="switch"
            aria-checked={logged}
            onClick={() => setLogged(!logged)}
          >
            <i /> isLoggedIn
          </button>
          <button
            className="d-switch"
            role="switch"
            aria-checked={error}
            onClick={() => setError(!error)}
          >
            <i /> hasError
          </button>
        </>
      }
    >
      <div className="d-conditional">
        <div className="d-render-tag">
          {logged ? "<Dashboard />" : "<LoginForm />"}
        </div>
        {logged ? (
          <div className="d-welcome-ui">
            <span>✳</span>
            <h2>Welcome back, Ada.</h2>
            <p>Your workspace is ready.</p>
          </div>
        ) : (
          <div className="d-login-ui">
            <h3>Welcome to your workspace</h3>
            <button className="d-action" onClick={() => setLogged(true)}>
              Log in for this example
              <ArrowRight size={14} />
            </button>
          </div>
        )}
        {error && (
          <div className="d-error" role="status">
            Something needs your attention.
            <button aria-label="Dismiss error" onClick={() => setError(false)}>
              <X size={13} />
            </button>
          </div>
        )}
      </div>
    </Workbench>
  );
}
function Purity() {
  const [method, setMethod] = useState("Spread");
  const [run, setRun] = useState(false);
  const original = ["Research", "Design"];
  let input = [...original];
  let output: string[] = [];
  let returned: number | undefined;
  if (run) {
    if (method === "push") {
      returned = input.push("Test");
      output = input;
    } else if (method === "concat") output = input.concat("Test");
    else output = [...input, "Test"];
  }
  const mutation = method === "push";
  return (
    <Workbench
      code={
        'const items = ["Research", "Design"];\n' +
        (mutation
          ? 'const length = items.push("Test");\n// items changed; push returned 3'
          : method === "concat"
            ? 'const next = items.concat("Test");\n// items stays unchanged'
            : 'const next = [...items, "Test"];\n// items stays unchanged')
      }
      file="pure-transformations.js"
      controls={
        <>
          <Toggle
            label="Transformation method"
            options={["Spread", "concat", "push"]}
            value={method}
            onChange={(v) => {
              setMethod(v);
              setRun(false);
            }}
          />
          <button className="d-action" onClick={() => setRun(true)}>
            <Play size={13} />
            Run transformation
          </button>
          <button className="d-link" onClick={() => setRun(false)}>
            <RotateCcw size={13} />
            Reset
          </button>
        </>
      }
    >
      <div className="d-purity">
        <div>
          <span className="d-label">ORIGINAL AFTER RUN</span>
          <Chips items={input} />
        </div>
        <div>
          <span className="d-label">
            {mutation ? "RETURNED BY push()" : "RETURNED NEW ARRAY"}
          </span>
          {run ? (
            mutation ? (
              <code className="d-number-result">{returned}</code>
            ) : (
              <Chips items={output} />
            )
          ) : (
            <code className="d-waiting">Run the transformation.</code>
          )}
        </div>
        {run && (
          <div
            className={"d-integrity " + (mutation ? "warning" : "safe")}
            role="status"
          >
            {mutation
              ? "Mutation · the input array changed."
              : "Pure transformation · input unchanged."}
            <small>
              {mutation
                ? "push() returns the array length, not a new array."
                : "Same input → same result, without changing outside data."}
            </small>
          </div>
        )}
      </div>
    </Workbench>
  );
}
function AsyncExample() {
  const [status, setStatus] = useState<"idle" | "loading" | "loaded" | "error">(
    "idle",
  );
  const [fail, setFail] = useState(false);
  const [clicks, setClicks] = useState(0);
  const request = useRef(0);
  useEffect(
    () => () => {
      request.current++;
    },
    [],
  );
  async function fetchData() {
    const id = ++request.current;
    setStatus("loading");
    try {
      await new Promise<void>((resolve, reject) =>
        setTimeout(
          () => (fail ? reject(new Error("Simulated failure")) : resolve()),
          900,
        ),
      );
      if (id === request.current) setStatus("loaded");
    } catch {
      if (id === request.current) setStatus("error");
    }
  }
  return (
    <Workbench
      code={
        "async function fetchData() {\n  setLoading(true);\n  try {\n    const data = await fakeFetch();\n    setData(data);\n  } catch { setError(true); }\n  finally { setLoading(false); }\n}"
      }
      file="async-request.js"
      controls={
        <>
          <button
            className="d-action"
            disabled={status === "loading"}
            onClick={fetchData}
          >
            <Play size={13} />
            {status === "loading" ? "Fetching…" : "Fetch data"}
          </button>
          <button
            className="d-switch"
            role="switch"
            aria-checked={fail}
            disabled={status === "loading"}
            onClick={() => setFail(!fail)}
          >
            <i /> Simulate failure
          </button>
        </>
      }
    >
      <div className="d-async">
        <span className="d-model-label">SIMULATED REQUEST · NO NETWORK</span>
        <div className={"d-request-state " + status} role="status">
          {status === "loading" ? (
            <span className="d-spinner" />
          ) : status === "loaded" ? (
            <Check size={28} />
          ) : (
            <GitBranch size={28} />
          )}
          <h2>
            {status === "idle"
              ? "Ready to fetch"
              : status === "loading"
                ? "Loading…"
                : status === "loaded"
                  ? "Data loaded"
                  : "Request failed"}
          </h2>
          {status === "loaded" && (
            <Chips items={["Research", "Design", "Test"]} />
          )}
        </div>
        <button
          className="d-responsive-button"
          onClick={() => setClicks((v) => v + 1)}
        >
          Still clickable while waiting <b>{clicks}</b>
        </button>
      </div>
    </Workbench>
  );
}
function Modules() {
  const [kind, setKind] = useState("Default");
  const [file, setFile] = useState("App.jsx");
  const [clicks, setClicks] = useState(0);
  const buttonCode =
    kind === "Default"
      ? "export default function Button() {\n  return <button>Explore</button>;\n}"
      : "export function Button() {\n  return <button>Explore</button>;\n}";
  const appCode =
    (kind === "Default"
      ? "import Button from './Button';"
      : "import { Button } from './Button';") +
    "\n\nexport default function App() {\n  return <Button />;\n}";
  return (
    <Workbench
      code={file === "Button.jsx" ? buttonCode : appCode}
      file={file}
      controls={
        <Toggle
          label="Export type"
          options={["Default", "Named"]}
          value={kind}
          onChange={setKind}
        />
      }
    >
      <div className="d-modules">
        <div className="d-file-tree">
          <span className="d-label">src/</span>
          {["Button.jsx", "App.jsx"].map((f) => (
            <button
              key={f}
              aria-pressed={file === f}
              onClick={() => setFile(f)}
            >
              <FileCode2 size={14} />
              {f}
              <span>{f === "Button.jsx" ? "exports" : "imports"}</span>
            </button>
          ))}
        </div>
        <div className="d-module-path">
          <code>Button.jsx</code>
          <ArrowRight size={17} />
          <code>App.jsx</code>
        </div>
        <button
          className="d-example-button active"
          onClick={() => setClicks((v) => v + 1)}
        >
          Explore{clicks > 0 && <span>Clicked {clicks}</span>}
        </button>
        <small>Inspect either file to see the connection.</small>
      </div>
    </Workbench>
  );
}
function Composition() {
  const [thumbnail, setThumbnail] = useState(true);
  const [like, setLike] = useState(true);
  const [liked, setLiked] = useState(false);
  return (
    <Workbench
      code={
        "function Video() {\n  return <article>\n" +
        (thumbnail ? "    <Thumbnail />\n" : "") +
        "    <h3>Thinking in components</h3>\n" +
        (like ? "    <LikeButton />\n" : "") +
        "  </article>;\n}"
      }
      controls={
        <>
          <label className="d-checkbox">
            <input
              type="checkbox"
              checked={thumbnail}
              onChange={(e) => setThumbnail(e.target.checked)}
            />
            Thumbnail
          </label>
          <label className="d-checkbox">
            <input
              type="checkbox"
              checked={like}
              onChange={(e) => setLike(e.target.checked)}
            />
            LikeButton
          </label>
        </>
      }
    >
      <div className="d-composition">
        <span className="d-render-tag">&lt;Video /&gt;</span>
        <article className="d-video">
          {thumbnail && (
            <div className="d-thumbnail">
              <Play size={30} />
              <small>&lt;Thumbnail /&gt;</small>
            </div>
          )}
          <div className="d-video-info">
            <h3>Thinking in components</h3>
            <span>08:24 · React foundations</span>
            {like && (
              <button aria-pressed={liked} onClick={() => setLiked(!liked)}>
                {liked ? "♥ Liked" : "♡ Like"}
              </button>
            )}
          </div>
        </article>
      </div>
    </Workbench>
  );
}
function KeyRow({ item }: { item: Item }) {
  const [note, setNote] = useState(item.name + " note");
  return (
    <div className="d-key-row">
      <span>
        {item.name}
        <small>id: {item.id}</small>
      </span>
      <label>
        <span className="sr-only">Note for {item.name}</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={35}
        />
      </label>
    </div>
  );
}
function Keys() {
  const [mode, setMode] = useState("Stable IDs");
  const [items, setItems] = useState(initialItems);
  return (
    <Workbench
      code={
        "{items.map((item, index) => (\n  <Row\n    key={" +
        (mode === "Stable IDs" ? "item.id" : "index") +
        "}\n    item={item}\n  />\n))}"
      }
      controls={
        <>
          <Toggle
            label="List key strategy"
            options={["Stable IDs", "Index"]}
            value={mode}
            onChange={setMode}
          />
          <button
            className="d-action"
            onClick={() => setItems([...items.slice(1), items[0]])}
          >
            <RotateCcw size={14} />
            Move first to end
          </button>
        </>
      }
    >
      <div className="d-keys">
        <span className="d-label">LOCAL NOTE STATE · EDIT, THEN REORDER</span>
        <div key={mode}>
          {items.map((item, i) => (
            <KeyRow key={mode === "Stable IDs" ? item.id : i} item={item} />
          ))}
        </div>
        <small className={mode === "Index" ? "d-warning-text" : ""}>
          {mode === "Stable IDs"
            ? "Notes travel with the same item ID."
            : "Index keys reuse the state at a position. Watch which note moves."}
        </small>
      </div>
    </Workbench>
  );
}
const videoTitles = [
  "Thinking in components",
  "State as a snapshot",
  "Passing props with purpose",
];
function ReactiveState() {
  const [search, setSearch] = useState("");
  const visible = videoTitles.filter((title) =>
    title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <Workbench
      code={
        'function SearchableVideoList() {\n  const [search, setSearch] = useState("");\n  const visible = videos.filter(title =>\n    title.toLowerCase().includes(search.toLowerCase()));\n  return <>\n    <input value={search} onChange={e => setSearch(e.target.value)} />\n    {visible.map(title => <p key={title}>{title}</p>)}\n  </>;\n}'
      }
    >
      <div className="d-state-example">
        <label>
          Search videos
          <input
            aria-label="Search videos"
            placeholder="Try “state”…"
            value={search}
            maxLength={50}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="d-state-snapshot">
          <span>search state</span>
          <code>{JSON.stringify(search)}</code>
          <ArrowDown size={14} />
          <span>
            React renders {visible.length}{" "}
            {visible.length === 1 ? "result" : "results"}
          </span>
        </div>
        <ul>
          {visible.map((title) => (
            <li key={title}>
              <Play size={13} />
              {title}
            </li>
          ))}
        </ul>
        {!visible.length && <p className="d-empty">No matching videos.</p>}
      </div>
    </Workbench>
  );
}
function Frameworks() {
  const [mode, setMode] = useState("Client render");
  const [stage, setStage] = useState(0);
  const [interactive, setInteractive] = useState(false);
  const server = mode === "Server + Suspense";
  useEffect(() => {
    if (stage === 0 || stage === 3) return;
    const timer = setTimeout(() => setStage((s) => s + 1), 750);
    return () => clearTimeout(timer);
  }, [stage]);
  const code = server
    ? "async function Talks() {\n  const talks = await getTalks();\n  return <TalkList talks={talks} />;\n}\n// Framework renders the server component:\n<Suspense fallback={<Skeleton />}>\n  <Talks />\n</Suspense>"
    : "function Talks() {\n  const [talks, setTalks] = useState(null);\n  useEffect(() => {\n    getTalks().then(setTalks);\n  }, []);\n  return talks ? <TalkList talks={talks} /> : <Spinner />;\n}";
  return (
    <Workbench
      code={code}
      file={server ? "server-component.jsx" : "client-component.jsx"}
      controls={
        <>
          <Toggle
            label="Rendering architecture"
            options={["Client render", "Server + Suspense"]}
            value={mode}
            onChange={(v) => {
              setMode(v);
              setStage(0);
              setInteractive(false);
            }}
          />
          <button
            className="d-action"
            disabled={stage > 0 && stage < 3}
            onClick={() => {
              setStage(1);
              setInteractive(false);
            }}
          >
            <Play size={13} />
            Run request
          </button>
        </>
      }
    >
      <div className="d-framework">
        <span className="d-model-label">
          EXECUTION MODEL · NOT A SERVER RUNTIME
        </span>
        <div className="d-render-stages">
          {(server
            ? ["Stream shell", "Suspense fallback", "Stream talks + hydrate"]
            : ["Load JavaScript", "Fetch talks in effect", "Render talk list"]
          ).map((s, i) => (
            <span className={stage >= i + 1 ? "finished" : ""} key={s}>
              {stage >= i + 1 ? <Check size={11} /> : <i />}
              {s}
            </span>
          ))}
        </div>
        <div className="d-stream-frame">
          {((server && stage > 0) || stage === 3) && <h3>Conference talks</h3>}
          {stage === 0 ? (
            <p>Run a request to compare the journey.</p>
          ) : stage < 3 ? (
            <div role="status" className="d-skeleton">
              <span />
              <span />
              <small>
                {server ? "Suspense fallback" : "Loading after client fetch"}…
              </small>
            </div>
          ) : (
            <div>
              <p>Thinking in React</p>
              <button
                className="d-action"
                onClick={() => setInteractive(!interactive)}
              >
                {interactive ? "♥ Saved" : "♡ Save talk"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Workbench>
  );
}
function Platforms() {
  const [platform, setPlatform] = useState("Web");
  const [pressed, setPressed] = useState(false);
  const web = platform === "Web";
  return (
    <Workbench
      code={
        web
          ? "function Greeting() {\n  return <div>\n    <h1>Hello, React.</h1>\n    <button>Explore</button>\n  </div>;\n}"
          : "import { View, Text, Pressable } from 'react-native';\nfunction Greeting() {\n  return <View>\n    <Text>Hello, React.</Text>\n    <Pressable><Text>Explore</Text></Pressable>\n  </View>;\n}"
      }
      controls={
        <Toggle
          label="Rendering platform"
          options={["Web", "iOS", "Android"]}
          value={platform}
          onChange={(p) => {
            setPlatform(p);
            setPressed(false);
          }}
        />
      }
    >
      <div className="d-platform-example">
        <span className="d-model-label">
          {web
            ? "REACT DOM · BROWSER ELEMENTS"
            : "ILLUSTRATED NATIVE VIEW · NOT A NATIVE RUNTIME"}
        </span>
        <div
          className={
            "d-device " + (web ? "browser" : "phone " + platform.toLowerCase())
          }
        >
          <div className="d-device-chrome">
            {web ? (
              <>
                <i />
                <i />
                <i />
                <span>localhost / hello</span>
              </>
            ) : (
              <>
                <span>9:41</span>
                <span>{platform}</span>
              </>
            )}
          </div>
          <div className="d-device-content">
            <Braces size={36} />
            <h2>Hello, React.</h2>
            <button onClick={() => setPressed(!pressed)}>
              {pressed ? "Explored ✓" : "Explore"}
            </button>
          </div>
        </div>
        <div className="d-platform-mapping">
          <code>
            {web
              ? "JSX → React DOM → HTML"
              : "JSX → React Native → " + platform + " views"}
          </code>
        </div>
      </div>
    </Workbench>
  );
}
function LessonContent({
  index,
  openLab,
}: {
  index: number;
  openLab: () => void;
}) {
  switch (index) {
    case 0:
      return <Functions />;
    case 1:
      return <Destructuring />;
    case 2:
      return <Spread />;
    case 3:
      return <Templates />;
    case 4:
      return <Mapping openLab={openLab} />;
    case 5:
      return <Filtering />;
    case 6:
      return <Flattening />;
    case 7:
      return <Conditionals />;
    case 8:
      return <Purity />;
    case 9:
      return <AsyncExample />;
    case 10:
      return <Modules />;
    case 11:
      return <Composition />;
    case 12:
      return <Keys />;
    case 13:
      return <ReactiveState />;
    case 14:
      return <Frameworks />;
    case 15:
      return <Platforms />;
    default:
      return null;
  }
}
export default function DeckApp() {
  const [saved, setSaved] = useState(loadDeck);
  const [menu, setMenu] = useState(false);
  const [help, setHelp] = useState(false);
  const [lab, setLab] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [finished, setFinished] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLElement>(null);
  const card = saved.card;
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
    setFinished(false);
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
  function next() {
    setSaved((v) => ({
      ...v,
      completed: [...new Set([...v.completed, card])],
    }));
    if (card < 15) go(card + 1);
    else setFinished(true);
  }
  if (lab) return <MapLab onReturn={() => setLab(false)} />;
  return (
    <div
      className={"deck-app " + (saved.theme === "light" ? "deck-light" : "")}
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
          syntax<span>lab</span>
        </a>
        <span className="d-product-name">JS to React: Step-by-Step</span>
        <div>
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
            Choose a starting point
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
          {["JavaScript foundations", "Core React"].map((phase, p) => (
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
                      {saved.completed.includes(i) ? (
                        <Check size={13} />
                      ) : (
                        <ChevronRight size={13} />
                      )}
                    </button>
                  ),
              )}
            </div>
          ))}
        </nav>
      )}
      <main className="d-main">
        <div className="d-progress-heading">
          <span>
            <b>Card {card + 1}</b> of 16
          </span>
          <span>
            {card < 11 ? "01 / JAVASCRIPT FOUNDATIONS" : "02 / CORE REACT"}
          </span>
        </div>
        <div
          className="d-progress-bar"
          role="progressbar"
          aria-label="Card position"
          aria-valuemin={1}
          aria-valuemax={16}
          aria-valuenow={card + 1}
        >
          <i style={{ width: ((card + 1) / 16) * 100 + "%" }} />
        </div>
        <article id="deck-card" className="d-lesson-card" key={card}>
          <div className="d-card-intro">
            <div className="d-topic-label">
              <span>{card < 11 ? "JS" : "R"}</span>
              {deckLessons[card][0]}
            </div>
            <h1 ref={heading} tabIndex={-1}>
              {deckLessons[card][1]}
            </h1>
            <p>{deckLessons[card][2]}</p>
          </div>
          <LessonContent index={card} openLab={() => setLab(true)} />
          <div className="d-card-help">
            <button
              className="d-help-button"
              aria-expanded={help}
              aria-controls="deck-help"
              onClick={() => setHelp(!help)}
            >
              <Lightbulb size={15} />
              {help ? "Hide explanation" : "I'm confused"}
              <ChevronRight size={13} className={help ? "rotated" : ""} />
            </button>
            {help && (
              <p id="deck-help" className="d-help-text">
                {deckLessons[card][3]}
              </p>
            )}
          </div>
          {finished && (
            <div className="d-finished" role="status">
              <Check size={18} />
              <span>
                You reached the end of the deck. Revisit any card or open the
                detailed .map() lab to practice.
              </span>
            </div>
          )}
        </article>
        <footer className="d-bottom-nav">
          <button
            className="d-previous"
            disabled={card === 0}
            onClick={() => go(card - 1)}
          >
            <ArrowLeft size={16} />
            Previous
          </button>
          <span>
            {saveError
              ? "Local saving unavailable. Keep this tab open."
              : saved.completed.includes(card)
                ? "Explored · you can revisit anytime"
                : "Your place is saved on this device."}
          </span>
          <button
            className="d-next"
            onClick={() => (finished ? go(0) : next())}
          >
            {card === 15
              ? finished
                ? "Explore again"
                : "Finish deck"
              : "Next"}
            <ArrowRight size={16} />
          </button>
        </footer>
      </main>
      <div className="d-footer-note">
        One concept. One small experiment. Your own pace.
      </div>
    </div>
  );
}
