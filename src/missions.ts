import { parse } from "@babel/parser";
import type { Node } from "@babel/types";
export type PreviewReport = {
  text: string;
  list: string[];
  buttons: string[];
  ids: string[];
  inputs: number;
  native: boolean;
  thumbnail: boolean;
  error?: string;
  meters?: number[];
  perk?: boolean;
  healthBar?: boolean;
};
export type Mission = {
  task: string;
  starter: string;
  solution: string;
  files?: Record<string, string>;
  hints: string[];
};
export const missions: Mission[] = [
  {
    task: "Convert repair to an arrow function, then press Ready in the HUD.",
    starter:
      'function repair() { return "Repair started"; }\nexport default function App() {\n  const [status, setStatus] = React.useState("Ready");\n  return <button onClick={() => setStatus(repair())}>{status}</button>;\n}',
    solution:
      'const repair = () => "Repair started";\nexport default function App() {\n  const [status, setStatus] = React.useState("Ready");\n  return <button onClick={() => setStatus(repair())}>{status}</button>;\n}',
    hints: [
      "The action keeps the same return value. Only its definition changes.",
      "Define repair with const and an arrow.",
      'Use const repair = () => "Repair started"; then click the live action.',
    ],
  },
  {
    task: "Destructure perk1 and perk2 in Loadout’s parameter and render both.",
    starter:
      'function Loadout(loadout) {\n  return <p>{loadout.perk1} + {loadout.perk2}</p>;\n}\nexport default function App() {\n  return <Loadout perk1="Sprint Burst" perk2="Lithe" />;\n}',
    solution:
      'function Loadout({ perk1, perk2 }) {\n  return <p>{perk1} + {perk2}</p>;\n}\nexport default function App() {\n  return <Loadout perk1="Sprint Burst" perk2="Lithe" />;\n}',
    hints: [
      "The loadout object contains two named properties.",
      "Replace the parameter with { perk1, perk2 }.",
      "Read perk1 and perk2 directly after unpacking them.",
    ],
  },
  {
    task: "Append Medkit with spread without changing inventory.",
    starter:
      'const inventory = ["Flashlight", "Toolbox"];\nconst next = inventory;\nexport default function App() {\n  return <><p>Original: {inventory.length}</p>\n    <ul>{next.map(item => <li key={item}>{item}</li>)}</ul></>;\n}',
    solution:
      'const inventory = ["Flashlight", "Toolbox"];\nconst next = [...inventory, "Medkit"];\nexport default function App() {\n  return <><p>Original: {inventory.length}</p>\n    <ul>{next.map(item => <li key={item}>{item}</li>)}</ul></>;\n}',
    hints: [
      "Create a new array rather than reusing the same reference.",
      'Spread inventory inside brackets and append "Medkit".',
      "The original length must stay 2; the new list must have 3 items.",
    ],
  },
  {
    task: "Build survivor-4 using a template literal with id.",
    starter:
      'const id = 4;\nconst tag = "survivor-id";\nexport default function App() {\n  return <strong id={tag}>Survivor #{id}</strong>;\n}',
    solution:
      "const id = 4;\nconst tag = `survivor-${id}`;\nexport default function App() {\n  return <strong id={tag}>Survivor #{id}</strong>;\n}",
    hints: [
      "Edit the tag declaration.",
      "Use backticks and an expression placeholder.",
      "Write `survivor-${id}` so the number comes from id.",
    ],
  },
  {
    task: "Map all four survivors into keyed li elements with health progress bars.",
    starter:
      'const survivors = [{id:1,name:"Meg",isInjured:true},{id:2,name:"Claudette",isInjured:false},{id:3,name:"Dwight",isInjured:true},{id:4,name:"Feng",isInjured:false}];\nexport default function App() {\n  return <ul>{survivors.map(s => s.name).join(", ")}</ul>;\n}',
    solution:
      'const survivors = [{id:1,name:"Meg",isInjured:true},{id:2,name:"Claudette",isInjured:false},{id:3,name:"Dwight",isInjured:true},{id:4,name:"Feng",isInjured:false}];\nexport default function App() {\n  return <ul>{survivors.map(survivor => <li key={survivor.id}>{survivor.name}<progress value={survivor.isInjured ? 1 : 2} max={2} /></li>)}</ul>;\n}',
    hints: [
      "Return one li for each survivor object.",
      "Use survivor.id as the key and survivor.name as the label.",
      "Add <progress value={survivor.isInjured ? 1 : 2} max={2} /> inside each li.",
    ],
  },
  {
    task: "Filter survivors so only injured teammates Meg and Dwight appear.",
    starter:
      'const survivors = [{id:1,name:"Meg",isInjured:true},{id:2,name:"Claudette",isInjured:false},{id:3,name:"Dwight",isInjured:true},{id:4,name:"Feng",isInjured:false}];\nconst injured = survivors;\nexport default function App() {\n  return <ul>{injured.map(s => <li key={s.id}>{s.name}</li>)}</ul>;\n}',
    solution:
      'const survivors = [{id:1,name:"Meg",isInjured:true},{id:2,name:"Claudette",isInjured:false},{id:3,name:"Dwight",isInjured:true},{id:4,name:"Feng",isInjured:false}];\nconst injured = survivors.filter(s => s.isInjured);\nexport default function App() {\n  return <ul>{injured.map(s => <li key={s.id}>{s.name}</li>)}</ul>;\n}',
    hints: [
      "Filter keeps objects when the callback returns true.",
      "Each survivor has an isInjured boolean.",
      "Use survivors.filter(s => s.isInjured).",
    ],
  },
  {
    task: "Flatten every chest’s items into one loot array with flatMap.",
    starter:
      'const chests = [\n  { items: ["Medkit", "Map"] },\n  { items: ["Key", "Toolbox"] }\n];\nconst loot = chests.map(chest => chest.items);\nexport default function App() {\n  return <pre>{JSON.stringify(loot)}</pre>;\n}',
    solution:
      'const chests = [\n  { items: ["Medkit", "Map"] },\n  { items: ["Key", "Toolbox"] }\n];\nconst loot = chests.flatMap(chest => chest.items);\nexport default function App() {\n  return <pre>{JSON.stringify(loot)}</pre>;\n}',
    hints: [
      "The current output contains two nested arrays.",
      "flatMap maps and flattens one level.",
      "Keep chest => chest.items and replace map with flatMap.",
    ],
  },
  {
    task: "Choose Injured! or Healthy with a ternary using isInjured.",
    starter:
      'const isInjured = true;\nconst status = "Healthy";\nexport default function App() {\n  return <strong>{status}</strong>;\n}',
    solution:
      'const isInjured = true;\nconst status = isInjured ? "Injured!" : "Healthy";\nexport default function App() {\n  return <strong>{status}</strong>;\n}',
    hints: [
      "Use the existing boolean as the condition.",
      "A ternary is condition ? firstValue : secondValue.",
      'The injured branch returns "Injured!" and the other branch returns "Healthy".',
    ],
  },
  {
    task: "Replace push with an immutable update; keep the original inventory length at 2.",
    starter:
      'const inventory = ["Flashlight", "Toolbox"];\nconst next = inventory;\nnext.push("Medkit");\nexport default function App() {\n  return <><p>Original: {inventory.length}</p>\n    <pre>{JSON.stringify(next)}</pre></>;\n}',
    solution:
      'const inventory = ["Flashlight", "Toolbox"];\nconst next = [...inventory, "Medkit"];\nexport default function App() {\n  return <><p>Original: {inventory.length}</p>\n    <pre>{JSON.stringify(next)}</pre></>;\n}',
    hints: [
      "Both variables currently refer to the same array.",
      "Create next using spread or concat and remove push.",
      "The output should have a Medkit while the original still has two items.",
    ],
  },
  {
    task: "Await openExitGate inside escape, return its result, then click Open gate.",
    starter:
      'const openExitGate = () => new Promise(resolve =>\n  setTimeout(() => resolve("Gate open"), 300));\nasync function escape() { return "Gate locked"; }\nexport default function App() {\n  const [status, setStatus] = React.useState("Open gate");\n  return <button onClick={async () => setStatus(await escape())}>{status}</button>;\n}',
    solution:
      'const openExitGate = () => new Promise(resolve =>\n  setTimeout(() => resolve("Gate open"), 300));\nasync function escape() {\n  const result = await openExitGate();\n  return result;\n}\nexport default function App() {\n  const [status, setStatus] = React.useState("Open gate");\n  return <button onClick={async () => setStatus(await escape())}>{status}</button>;\n}',
    hints: [
      "The gate switch returns a promise that settles after a local timer.",
      "Inside escape, await openExitGate() into a variable and return that variable.",
      "After editing, click Open gate in the preview. This is a timer drill, not the trial’s final exit.",
    ],
  },
  {
    task: "Match Perk.jsx’s default export with the right SprintBurst import.",
    starter:
      'import { SprintBurst } from "./Perk";\nexport default function Loadout() {\n  return <SprintBurst />;\n}',
    solution:
      'import SprintBurst from "./Perk";\nexport default function Loadout() {\n  return <SprintBurst />;\n}',
    hints: [
      "Inspect Perk.jsx to see its export syntax.",
      "Default imports do not use curly braces.",
      'Use import SprintBurst from "./Perk".',
    ],
    files: {
      "Perk.jsx":
        "export default function SprintBurst() {\n  return <button>Sprint Burst equipped</button>;\n}",
    },
  },
  {
    task: "Combine PerkIcon and HealthBar inside SurvivorHUD’s article.",
    starter:
      'function PerkIcon() { return <span aria-label="Perk icon">◆</span>; }\nfunction HealthBar() { return <progress aria-label="Health bar" value={2} max={2} />; }\nexport default function SurvivorHUD() {\n  return <article><h3>Meg</h3></article>;\n}',
    solution:
      'function PerkIcon() { return <span aria-label="Perk icon">◆</span>; }\nfunction HealthBar() { return <progress aria-label="Health bar" value={2} max={2} />; }\nexport default function SurvivorHUD() {\n  return <article><PerkIcon /><h3>Meg</h3><HealthBar /></article>;\n}',
    hints: [
      "The component functions are already defined.",
      "Nest their JSX tags inside the article.",
      "Place <PerkIcon /> and <HealthBar /> alongside the survivor name.",
    ],
  },
  {
    task: "Give each Row the survivor’s stable ID as its key, then reorder the HUD.",
    starter:
      'const initial = [{id:1,name:"Meg"},{id:2,name:"Claudette"}];\nfunction Row({ survivor }) {\n  const [note, setNote] = React.useState(survivor.name + " note");\n  return <label>{survivor.name}<input value={note} onChange={e => setNote(e.target.value)} /></label>;\n}\nexport default function App() {\n  const [survivors, setSurvivors] = React.useState(initial);\n  return <><button onClick={() => setSurvivors([...survivors].reverse())}>Reorder</button>\n    {survivors.map((survivor, index) => <Row key={index} survivor={survivor} />)}</>;\n}',
    solution:
      'const initial = [{id:1,name:"Meg"},{id:2,name:"Claudette"}];\nfunction Row({ survivor }) {\n  const [note, setNote] = React.useState(survivor.name + " note");\n  return <label>{survivor.name}<input value={note} onChange={e => setNote(e.target.value)} /></label>;\n}\nexport default function App() {\n  const [survivors, setSurvivors] = React.useState(initial);\n  return <><button onClick={() => setSurvivors([...survivors].reverse())}>Reorder</button>\n    {survivors.map((survivor, index) => <Row key={survivor.id} survivor={survivor} />)}</>;\n}',
    hints: [
      "A position is not a survivor’s identity.",
      "Change the key expression to survivor.id.",
      "Edit a note and click Reorder to watch React keep local state with the same survivor.",
    ],
  },
  {
    task: "Call setProgress with an updater that adds 25, then repair the preview to 100%.",
    starter:
      "export default function App() {\n  const [progress, setProgress] = React.useState(0);\n  return <><button onClick={() => {}}>Repair</button>\n    <p>Repair: {progress}%</p><progress value={progress} max={100} /></>;\n}",
    solution:
      "export default function App() {\n  const [progress, setProgress] = React.useState(0);\n  return <><button onClick={() => setProgress(prev => Math.min(100, prev + 25))}>Repair</button>\n    <p>Repair: {progress}%</p><progress value={progress} max={100} /></>;\n}",
    hints: [
      "The click handler currently does nothing.",
      "Pass an updater function to setProgress; its parameter receives the previous value.",
      "Use prev => Math.min(100, prev + 25), then click Repair four times.",
    ],
  },
  {
    task: "Wrap MatchStats in Suspense with LoadingBloodweb as its fallback.",
    starter:
      "const MatchStats = React.lazy(() => new Promise(resolve => {\n  setTimeout(() => resolve({ default: () => <h3>Match stats ready</h3> }), 700);\n}));\nfunction LoadingBloodweb() { return <p>LoadingBloodweb…</p>; }\nexport default function App() {\n  return <MatchStats />;\n}",
    solution:
      "const MatchStats = React.lazy(() => new Promise(resolve => {\n  setTimeout(() => resolve({ default: () => <h3>Match stats ready</h3> }), 700);\n}));\nfunction LoadingBloodweb() { return <p>LoadingBloodweb…</p>; }\nexport default function App() {\n  return <React.Suspense fallback={<LoadingBloodweb />}><MatchStats /></React.Suspense>;\n}",
    hints: [
      "This code drill uses real client Suspense; the Entity server journey is a model.",
      "Wrap MatchStats in React.Suspense.",
      "Pass fallback={<LoadingBloodweb />} to the boundary.",
    ],
  },
  {
    task: "Build the modeled mobile HUD using View and Text instead of div.",
    starter:
      'import { View, Text } from "./native";\nexport default function SurvivorHUD() {\n  return <div>Survivor HUD</div>;\n}',
    solution:
      'import { View, Text } from "./native";\nexport default function SurvivorHUD() {\n  return <View><Text>Survivor HUD</Text></View>;\n}',
    hints: [
      "This browser fixture illustrates native primitives; it is not a mobile runtime.",
      "View holds the layout and Text holds the text.",
      "Return <View><Text>Survivor HUD</Text></View>.",
    ],
  },
];
function walk(node: unknown, out: Node[] = []): Node[] {
  if (!node || typeof node !== "object") return out;
  if (Array.isArray(node)) {
    node.forEach((n) => walk(n, out));
    return out;
  }
  const obj = node as Record<string, unknown>;
  if (typeof obj.type === "string") out.push(node as Node);
  for (const [key, value] of Object.entries(obj))
    if (!["loc", "start", "end", "tokens", "comments", "extra"].includes(key))
      walk(value, out);
  return out;
}
export function checkMission(
  index: number,
  files: Record<string, string>,
  report?: PreviewReport,
): { structure: boolean; ok: boolean; message: string } {
  try {
    const nodes = walk(
      parse(files["App.jsx"], { sourceType: "module", plugins: ["jsx"] }),
    );
    const variable = (name: string) =>
      nodes.find(
        (n) =>
          n.type === "VariableDeclarator" &&
          n.id.type === "Identifier" &&
          n.id.name === name,
      );
    const call = (name: string) =>
      nodes.some(
        (n) =>
          n.type === "CallExpression" &&
          n.callee.type === "MemberExpression" &&
          n.callee.property.type === "Identifier" &&
          n.callee.property.name === name,
      );
    const jsx = (name: string) =>
      nodes.some(
        (n) =>
          n.type === "JSXOpeningElement" &&
          (n.name.type === "JSXIdentifier"
            ? n.name.name === name
            : n.name.type === "JSXMemberExpression" &&
              n.name.property.name === name),
      );
    const key = () =>
      nodes.some(
        (n) =>
          n.type === "JSXAttribute" &&
          n.name.name === "key" &&
          n.value?.type === "JSXExpressionContainer" &&
          n.value.expression.type === "MemberExpression" &&
          n.value.expression.object.type === "Identifier" &&
          n.value.expression.object.name === "survivor" &&
          n.value.expression.property.type === "Identifier" &&
          n.value.expression.property.name === "id",
      );
    const next = variable("next");
    let structure = false,
      output = false;
    switch (index) {
      case 0: {
        const repair = variable("repair");
        structure =
          !!repair &&
          repair.type === "VariableDeclarator" &&
          repair.init?.type === "ArrowFunctionExpression";
        output = !!report?.buttons.includes("Repair started");
        break;
      }
      case 1:
        structure = nodes.some(
          (n) =>
            n.type === "FunctionDeclaration" &&
            n.id?.name === "Loadout" &&
            n.params[0]?.type === "ObjectPattern" &&
            ["perk1", "perk2"].every(
              (name) =>
                n.params[0].type === "ObjectPattern" &&
                n.params[0].properties.some(
                  (p) =>
                    p.type === "ObjectProperty" &&
                    p.key.type === "Identifier" &&
                    p.key.name === name,
                ),
            ),
        );
        output = report?.text === "Sprint Burst + Lithe";
        break;
      case 2:
        structure =
          !!next &&
          next.type === "VariableDeclarator" &&
          next.init?.type === "ArrayExpression" &&
          next.init.elements.some(
            (e) =>
              e?.type === "SpreadElement" &&
              e.argument.type === "Identifier" &&
              e.argument.name === "inventory",
          );
        output =
          !!report?.text.includes("Original: 2") &&
          JSON.stringify(report.list) ===
            JSON.stringify(["Flashlight", "Toolbox", "Medkit"]);
        break;
      case 3: {
        const tag = variable("tag");
        structure =
          !!tag &&
          tag.type === "VariableDeclarator" &&
          tag.init?.type === "TemplateLiteral" &&
          tag.init.expressions.some(
            (e) => e.type === "Identifier" && e.name === "id",
          );
        output = !!report?.ids.includes("survivor-4");
        break;
      }
      case 4:
        structure = call("map") && jsx("li") && jsx("progress") && key();
        output =
          JSON.stringify(report?.list) ===
            JSON.stringify(["Meg", "Claudette", "Dwight", "Feng"]) &&
          JSON.stringify(report?.meters) === JSON.stringify([1, 2, 1, 2]);
        break;
      case 5:
        structure =
          call("filter") &&
          nodes.some(
            (n) =>
              n.type === "MemberExpression" &&
              n.property.type === "Identifier" &&
              n.property.name === "isInjured",
          );
        output =
          JSON.stringify(report?.list) === JSON.stringify(["Meg", "Dwight"]);
        break;
      case 6:
        structure = call("flatMap");
        output = report?.text === '["Medkit","Map","Key","Toolbox"]';
        break;
      case 7:
        structure = nodes.some(
          (n) =>
            n.type === "ConditionalExpression" &&
            n.test.type === "Identifier" &&
            n.test.name === "isInjured",
        );
        output = report?.text === "Injured!";
        break;
      case 8:
        structure =
          !!next &&
          next.type === "VariableDeclarator" &&
          (next.init?.type === "ArrayExpression" ||
            next.init?.type === "CallExpression") &&
          !call("push");
        output =
          !!report?.text.includes("Original: 2") &&
          report.text.includes('["Flashlight","Toolbox","Medkit"]');
        break;
      case 9:
        structure = nodes.some(
          (n) =>
            n.type === "FunctionDeclaration" &&
            n.id?.name === "escape" &&
            n.async &&
            walk(n.body).some(
              (b) =>
                b.type === "AwaitExpression" &&
                b.argument.type === "CallExpression" &&
                b.argument.callee.type === "Identifier" &&
                b.argument.callee.name === "openExitGate",
            ),
        );
        output = !!report?.buttons.includes("Gate open");
        break;
      case 10: {
        const perk = walk(
          parse(files["Perk.jsx"] || "", {
            sourceType: "module",
            plugins: ["jsx"],
          }),
        );
        structure =
          nodes.some(
            (n) =>
              n.type === "ImportDeclaration" &&
              n.source.value === "./Perk" &&
              n.specifiers.some((s) => s.type === "ImportDefaultSpecifier"),
          ) && perk.some((n) => n.type === "ExportDefaultDeclaration");
        output = !!report?.buttons.includes("Sprint Burst equipped");
        break;
      }
      case 11: {
        const hud = nodes.find(
          (n) =>
            n.type === "FunctionDeclaration" && n.id?.name === "SurvivorHUD",
        );
        const content = walk(hud);
        structure = ["PerkIcon", "HealthBar"].every((name) =>
          content.some(
            (n) =>
              n.type === "JSXOpeningElement" &&
              n.name.type === "JSXIdentifier" &&
              n.name.name === name,
          ),
        );
        output = !!report?.perk && !!report.healthBar;
        break;
      }
      case 12:
        structure = key();
        output =
          report?.inputs === 2 && !!report.text.startsWith("ReorderClaudette");
        break;
      case 13:
        structure = nodes.some(
          (n) =>
            n.type === "CallExpression" &&
            n.callee.type === "Identifier" &&
            n.callee.name === "setProgress" &&
            n.arguments[0]?.type === "ArrowFunctionExpression",
        );
        output =
          report?.meters?.[0] === 100 && report.text.includes("Repair: 100%");
        break;
      case 14:
        structure =
          jsx("Suspense") &&
          jsx("LoadingBloodweb") &&
          nodes.some(
            (n) => n.type === "JSXAttribute" && n.name.name === "fallback",
          );
        output = !!report?.text.includes("Match stats ready");
        break;
      case 15:
        structure = jsx("View") && jsx("Text");
        output =
          report?.native === true && !!report.text.includes("Survivor HUD");
        break;
    }
    return {
      structure,
      ok: structure && output && !report?.error,
      message: report?.error
        ? report.error
        : !structure
          ? "Repair the blueprint. A hint is available if you need it."
          : !output
            ? "Blueprint syntax is ready. Test its behavior in the live HUD."
            : "Blueprint verified. The generator is ready for its skill check.",
    };
  } catch (error) {
    return {
      structure: false,
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Finish the repair blueprint to check it.",
    };
  }
}
export function missionFiles(
  index: number,
  draft?: Record<string, string>,
): Record<string, string> {
  return {
    "App.jsx": missions[index].starter,
    ...missions[index].files,
    ...draft,
  };
}
