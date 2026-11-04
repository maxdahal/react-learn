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
    task: "Convert Greeting to an arrow function without changing its output.",
    starter:
      "export default function Greeting() {\n  return <h2>Hello, Ada!</h2>;\n}",
    solution:
      "const Greeting = () => <h2>Hello, Ada!</h2>;\nexport default Greeting;",
    hints: [
      "Keep the name Greeting and the same returned heading.",
      "An arrow starts with const Greeting = () => …",
      "Export Greeting after defining it. An expression body returns its JSX automatically.",
    ],
  },
  {
    task: "Destructure name in Profile’s parameter, then use name in its heading.",
    starter:
      'function Profile(props) {\n  return <h2>{props.name}</h2>;\n}\nexport default function App() {\n  return <Profile name="Ada" />;\n}',
    solution:
      'function Profile({ name }) {\n  return <h2>{name}</h2>;\n}\nexport default function App() {\n  return <Profile name="Ada" />;\n}',
    hints: [
      "Look at the props parameter and the value inside the heading.",
      "Replace the parameter with an object pattern: { name }.",
      "Once unpacked, name is a local variable; you no longer need props.name.",
    ],
  },
  {
    task: "Create next using spread and newItem, leaving items unchanged.",
    starter:
      'const items = ["Research", "Design"];\nconst newItem = "Test";\nconst next = items;\nexport default function App() {\n  return <><p>Original: {items.length}</p>\n    <ul>{next.map(item => <li key={item}>{item}</li>)}</ul></>;\n}',
    solution:
      'const items = ["Research", "Design"];\nconst newItem = "Test";\nconst next = [...items, newItem];\nexport default function App() {\n  return <><p>Original: {items.length}</p>\n    <ul>{next.map(item => <li key={item}>{item}</li>)}</ul></>;\n}',
    hints: [
      "Edit only the declaration of next.",
      "Spread items inside a new array, then append newItem.",
      "The shape is [ ...existingArray, value ]. The original should still contain two items.",
    ],
  },
  {
    task: "Use a template literal to make label equal item-7.",
    starter:
      'const id = 7;\nconst label = "item-id";\nexport default function App() {\n  return <button id={label}>{label}</button>;\n}',
    solution:
      "const id = 7;\nconst label = `item-${id}`;\nexport default function App() {\n  return <button id={label}>{label}</button>;\n}",
    hints: [
      "Edit label, keeping id as your dynamic input.",
      "Template literals use backticks, not quote marks.",
      "Insert the id with ${id} after the text item-.",
    ],
  },
  {
    task: "Map items into three li elements, each with its own key.",
    starter:
      'const items = ["Research", "Design", "Test"];\nexport default function App() {\n  return <ul>{items}</ul>;\n}',
    solution:
      'const items = ["Research", "Design", "Test"];\nexport default function App() {\n  return <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>;\n}',
    hints: [
      "Replace items inside the list with an items.map(...) call.",
      "The callback receives one string; return <li> with that string as its child.",
      "For this unique-string array, key={item} gives each element a stable key.",
    ],
  },
  {
    task: "Filter items using search so the preview initially shows only Design.",
    starter:
      'const items = ["Research", "Design", "Test"];\nexport default function App() {\n  const [search, setSearch] = React.useState("de");\n  const visible = items;\n  return <><input aria-label="Search" value={search}\n    onChange={e => setSearch(e.target.value)} />\n    <ul>{visible.map(item => <li key={item}>{item}</li>)}</ul></>;\n}',
    solution:
      'const items = ["Research", "Design", "Test"];\nexport default function App() {\n  const [search, setSearch] = React.useState("de");\n  const visible = items.filter(item => item.toLowerCase().includes(search.toLowerCase()));\n  return <><input aria-label="Search" value={search}\n    onChange={e => setSearch(e.target.value)} />\n    <ul>{visible.map(item => <li key={item}>{item}</li>)}</ul></>;\n}',
    hints: [
      "Edit the declaration of visible, not the list renderer.",
      "filter keeps strings whose callback returns true.",
      "Compare item.toLowerCase() with search.toLowerCase() using includes(...).",
    ],
  },
  {
    task: "Flatten category products into one array using flatMap or reduce.",
    starter:
      'const categories = [\n  { products: ["Interview", "Survey"] },\n  { products: ["Prototype", "Test"] }\n];\nconst result = categories.map(category => category.products);\nexport default function App() {\n  return <pre>{JSON.stringify(result)}</pre>;\n}',
    solution:
      'const categories = [\n  { products: ["Interview", "Survey"] },\n  { products: ["Prototype", "Test"] }\n];\nconst result = categories.flatMap(category => category.products);\nexport default function App() {\n  return <pre>{JSON.stringify(result)}</pre>;\n}',
    hints: [
      "Your current output contains arrays inside an array.",
      "flatMap combines a mapping operation with one level of flattening.",
      "Keep the category.products callback and change map to flatMap, or accumulate products with reduce.",
    ],
  },
  {
    task: "Use loggedIn in a ternary that displays Dashboard or Login.",
    starter:
      "const loggedIn = true;\nconst hasError = false;\nexport default function App() {\n  return <><h2>Login</h2>\n    {hasError && <p>Try again</p>}</>;\n}",
    solution:
      "const loggedIn = true;\nconst hasError = false;\nexport default function App() {\n  return <>{loggedIn ? <h2>Dashboard</h2> : <h2>Login</h2>}\n    {hasError && <p>Try again</p>}</>;\n}",
    hints: [
      "Replace the unconditional heading with a JavaScript expression.",
      "A ternary has condition ? trueValue : falseValue.",
      "Use JSX headings for both branches, and keep the existing && error branch.",
    ],
  },
  {
    task: "Replace the mutation with a new array; keep the original length at 2.",
    starter:
      'const items = ["Research", "Design"];\nconst next = items;\nnext.push("Test");\nexport default function App() {\n  return <><p>Original: {items.length}</p>\n    <pre>{JSON.stringify(next)}</pre></>;\n}',
    solution:
      'const items = ["Research", "Design"];\nconst next = [...items, "Test"];\nexport default function App() {\n  return <><p>Original: {items.length}</p>\n    <pre>{JSON.stringify(next)}</pre></>;\n}',
    hints: [
      "next currently refers to the same array as items.",
      "Create next with spread or concat, then remove the push statement.",
      "You want the original to have two entries and the result to have three.",
    ],
  },
  {
    task: "In load, await fakeFetch into data, return data, then click Fetch.",
    starter:
      'const fakeFetch = async () => ["Research", "Design"];\nasync function load() {\n  return fakeFetch();\n}\nexport default function App() {\n  const [data, setData] = React.useState([]);\n  return <button onClick={async () => setData(await load())}>\n    {data.length ? data.join(", ") : "Fetch"}</button>;\n}',
    solution:
      'const fakeFetch = async () => ["Research", "Design"];\nasync function load() {\n  const data = await fakeFetch();\n  return data;\n}\nexport default function App() {\n  const [data, setData] = React.useState([]);\n  return <button onClick={async () => setData(await load())}>\n    {data.length ? data.join(", ") : "Fetch"}</button>;\n}',
    hints: [
      "An async function already returns a promise; this task practices naming the resolved value.",
      "Inside load, declare data with await fakeFetch(), then return that variable.",
      "After editing, click Fetch in the live preview to run the handler.",
    ],
  },
  {
    task: "Fix App’s import to match Button’s default export.",
    starter:
      'import { Button } from "./Button";\nexport default function App() {\n  return <Button />;\n}',
    solution:
      'import Button from "./Button";\nexport default function App() {\n  return <Button />;\n}',
    files: {
      "Button.jsx":
        "export default function Button() {\n  return <button>Continue</button>;\n}",
    },
    hints: [
      "Inspect Button.jsx to see which kind of export it uses.",
      "A default import does not use curly braces.",
      "Keep the default export in Button.jsx, and import Button directly in App.jsx.",
    ],
  },
  {
    task: "Nest Thumbnail and LikeButton inside VideoList’s article.",
    starter:
      'function Thumbnail() { return <div aria-label="Thumbnail">▶</div>; }\nfunction LikeButton() {\n  const [liked, setLiked] = React.useState(false);\n  return <button onClick={() => setLiked(!liked)}>{liked ? "Liked" : "Like"}</button>;\n}\nexport default function VideoList() {\n  return <article><h3>Thinking in React</h3></article>;\n}',
    solution:
      'function Thumbnail() { return <div aria-label="Thumbnail">▶</div>; }\nfunction LikeButton() {\n  const [liked, setLiked] = React.useState(false);\n  return <button onClick={() => setLiked(!liked)}>{liked ? "Liked" : "Like"}</button>;\n}\nexport default function VideoList() {\n  return <article><Thumbnail /><h3>Thinking in React</h3><LikeButton /></article>;\n}',
    hints: [
      "Use the existing components rather than duplicating their markup.",
      "Add self-closing JSX tags inside the article.",
      "Place <Thumbnail /> before the title and <LikeButton /> after it.",
    ],
  },
  {
    task: "Use a stable ID for each Row key, then reorder the list.",
    starter:
      'const initial = [{id: 1, name: "Research"}, {id: 2, name: "Design"}];\nfunction Row({ item }) {\n  const [note, setNote] = React.useState(item.name + " note");\n  return <label>{item.name}<input value={note} onChange={e => setNote(e.target.value)} /></label>;\n}\nexport default function App() {\n  const [items, setItems] = React.useState(initial);\n  return <><button onClick={() => setItems([...items].reverse())}>Reorder</button>\n    {items.map((item, index) => <Row key={index} item={item} />)}</>;\n}',
    solution:
      'const initial = [{id: 1, name: "Research"}, {id: 2, name: "Design"}];\nfunction Row({ item }) {\n  const [note, setNote] = React.useState(item.name + " note");\n  return <label>{item.name}<input value={note} onChange={e => setNote(e.target.value)} /></label>;\n}\nexport default function App() {\n  const [items, setItems] = React.useState(initial);\n  return <><button onClick={() => setItems([...items].reverse())}>Reorder</button>\n    {items.map((item, index) => <Row key={item.id} item={item} />)}</>;\n}',
    hints: [
      "An index identifies a position, while item.id identifies your data.",
      "Edit only the key prop on Row.",
      "Use key={item.id}; edit a note and reorder to watch its identity stay attached.",
    ],
  },
  {
    task: "Connect the button to setOn so a click changes Inactive to Active.",
    starter:
      'export default function App() {\n  const [on, setOn] = React.useState(false);\n  return <button onClick={() => {}}>\n    {on ? "Active" : "Inactive"}\n  </button>;\n}',
    solution:
      'export default function App() {\n  const [on, setOn] = React.useState(false);\n  return <button onClick={() => setOn(!on)}>\n    {on ? "Active" : "Inactive"}\n  </button>;\n}',
    hints: [
      "The event handler currently does nothing.",
      "Call the state setter inside onClick with the opposite boolean.",
      "Use setOn(!on) or the updater form setOn(previous => !previous), then click the preview button.",
    ],
  },
  {
    task: "Wrap Talks in a Suspense boundary with a loading fallback.",
    starter:
      "const Talks = React.lazy(() => new Promise(resolve => {\n  setTimeout(() => resolve({ default: () => <h3>Talks ready</h3> }), 700);\n}));\nexport default function App() {\n  return <Talks />;\n}",
    solution:
      "const Talks = React.lazy(() => new Promise(resolve => {\n  setTimeout(() => resolve({ default: () => <h3>Talks ready</h3> }), 700);\n}));\nexport default function App() {\n  return <React.Suspense fallback={<p>Loading talks…</p>}><Talks /></React.Suspense>;\n}",
    hints: [
      "This code exercise uses real client Suspense; the server journey is modeled in Explore.",
      "Place <Talks /> inside <React.Suspense> and supply a fallback prop.",
      "Use fallback={<p>Loading talks…</p>}; the fallback appears while the lazy component waits.",
    ],
  },
  {
    task: "Replace the div with modeled View and Text native primitives.",
    starter:
      'import { View, Text } from "./native";\nexport default function App() {\n  return <div>Hello, React.</div>;\n}',
    solution:
      'import { View, Text } from "./native";\nexport default function App() {\n  return <View><Text>Hello, React.</Text></View>;\n}',
    hints: [
      "This browser fixture models native primitives; it does not run a mobile OS.",
      "A View is a container, and Text displays the text inside it.",
      "Use <View><Text>Hello, React.</Text></View>. Native applications use react-native instead of this lesson fixture.",
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
    const key = (property: string) =>
      nodes.some(
        (n) =>
          n.type === "JSXAttribute" &&
          n.name.name === "key" &&
          n.value?.type === "JSXExpressionContainer" &&
          n.value.expression.type === "MemberExpression" &&
          n.value.expression.property.type === "Identifier" &&
          n.value.expression.property.name === property,
      );
    const next = variable("next");
    let structure = false,
      output = false;
    switch (index) {
      case 0: {
        const greeting = variable("Greeting");
        structure =
          !!greeting &&
          greeting.type === "VariableDeclarator" &&
          greeting.init?.type === "ArrowFunctionExpression";
        output = !!report?.text.includes("Hello, Ada!");
        break;
      }
      case 1:
        structure = nodes.some(
          (n) =>
            n.type === "FunctionDeclaration" &&
            n.id?.name === "Profile" &&
            n.params[0]?.type === "ObjectPattern" &&
            n.params[0].properties.some(
              (p) =>
                p.type === "ObjectProperty" &&
                p.key.type === "Identifier" &&
                p.key.name === "name",
            ),
        );
        output = !!report?.text.includes("Ada");
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
              e.argument.name === "items",
          );
        output =
          !!report?.text.includes("Original: 2") &&
          JSON.stringify(report.list) ===
            JSON.stringify(["Research", "Design", "Test"]);
        break;
      case 3: {
        const label = variable("label");
        structure =
          !!label &&
          label.type === "VariableDeclarator" &&
          label.init?.type === "TemplateLiteral" &&
          label.init.expressions.some(
            (e) => e.type === "Identifier" && e.name === "id",
          );
        output = !!report?.ids.includes("item-7");
        break;
      }
      case 4:
        structure =
          call("map") &&
          jsx("li") &&
          nodes.some((n) => n.type === "JSXAttribute" && n.name.name === "key");
        output =
          JSON.stringify(report?.list) ===
          JSON.stringify(["Research", "Design", "Test"]);
        break;
      case 5:
        structure =
          call("filter") &&
          nodes.some((n) => n.type === "Identifier" && n.name === "search");
        output = JSON.stringify(report?.list) === JSON.stringify(["Design"]);
        break;
      case 6:
        structure = call("flatMap") || call("reduce");
        output = report?.text === '["Interview","Survey","Prototype","Test"]';
        break;
      case 7:
        structure = nodes.some(
          (n) =>
            n.type === "ConditionalExpression" &&
            n.test.type === "Identifier" &&
            n.test.name === "loggedIn",
        );
        output =
          !!report?.text.includes("Dashboard") &&
          !report.text.includes("Login");
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
          report.text.includes('["Research","Design","Test"]');
        break;
      case 9:
        structure = nodes.some(
          (n) =>
            n.type === "FunctionDeclaration" &&
            n.id?.name === "load" &&
            n.async &&
            walk(n.body).some(
              (b) =>
                b.type === "VariableDeclarator" &&
                b.init?.type === "AwaitExpression",
            ),
        );
        output = !!report?.buttons.some((b) => b.includes("Research, Design"));
        break;
      case 10: {
        const button = walk(
          parse(files["Button.jsx"] || "", {
            sourceType: "module",
            plugins: ["jsx"],
          }),
        );
        structure =
          nodes.some(
            (n) =>
              n.type === "ImportDeclaration" &&
              n.source.value === "./Button" &&
              n.specifiers.some((s) => s.type === "ImportDefaultSpecifier"),
          ) && button.some((n) => n.type === "ExportDefaultDeclaration");
        output = !!report?.buttons.includes("Continue");
        break;
      }
      case 11: {
        const list = nodes.find(
          (n) => n.type === "FunctionDeclaration" && n.id?.name === "VideoList",
        );
        const content = walk(list);
        structure = ["Thumbnail", "LikeButton"].every((name) =>
          content.some(
            (n) =>
              n.type === "JSXOpeningElement" &&
              n.name.type === "JSXIdentifier" &&
              n.name.name === name,
          ),
        );
        output =
          !!report?.thumbnail &&
          !!report.buttons.some((b) => ["Like", "Liked"].includes(b));
        break;
      }
      case 12:
        structure = key("id");
        output =
          report?.inputs === 2 && !!report.text.startsWith("ReorderDesign");
        break;
      case 13:
        structure = nodes.some(
          (n) =>
            n.type === "CallExpression" &&
            n.callee.type === "Identifier" &&
            n.callee.name === "setOn",
        );
        output = !!report?.buttons.includes("Active");
        break;
      case 14:
        structure =
          jsx("Suspense") &&
          nodes.some(
            (n) => n.type === "JSXAttribute" && n.name.name === "fallback",
          );
        output = !!report?.text.includes("Talks ready");
        break;
      case 15:
        structure = jsx("View") && jsx("Text");
        output =
          report?.native === true && !!report.text.includes("Hello, React.");
        break;
    }
    return {
      structure,
      ok: structure && output && !report?.error,
      message: report?.error
        ? report.error
        : !structure
          ? "Keep editing the highlighted task. Use a hint if you need a nudge."
          : !output
            ? "The code structure is right. Complete the preview interaction to check its behavior."
            : "Mission complete. Your code and its rendered result both match.",
    };
  } catch (error) {
    return {
      structure: false,
      ok: false,
      message:
        error instanceof Error ? error.message : "Finish the code to check it.",
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
