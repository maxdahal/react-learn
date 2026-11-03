import { parseExpression } from "@babel/parser";
import type { Expression, Node } from "@babel/types";
export type Card = {
  id: number;
  label: string;
  color: string;
  category: string;
};
export const uxCards: Card[] = [
  {
    id: 1,
    label: "Discover",
    color: "#93a5ed",
    category: "Understand the problem",
  },
  {
    id: 2,
    label: "Design",
    color: "#c9a0e8",
    category: "Explore possibilities",
  },
  { id: 3, label: "Test", color: "#a6d4bc", category: "Learn from people" },
];
export const dbdCards: Card[] = [
  { id: 1, label: "Sprint Burst", color: "#93a5ed", category: "Meg Thomas" },
  { id: 2, label: "Lithe", color: "#c9a0e8", category: "Feng Min" },
  {
    id: 3,
    label: "Windows of Opportunity",
    color: "#a6d4bc",
    category: "Kate Denson",
  },
];
export const lessonSteps = [
  {
    title: "See the transformation",
    kind: "WATCH",
    description:
      "Turn an array of objects into an array of labels. One item in, one result out.",
  },
  {
    title: "Meet the callback parameter",
    kind: "CONNECT",
    description:
      "The parameter is a name you choose. Click an item to see the value assigned to that name.",
  },
  {
    title: "Follow the data",
    kind: "TRACE",
    description:
      "Watch each item become a result. Use Next to move through the callback, one moment at a time.",
  },
  {
    title: "Change the input",
    kind: "EXPLORE",
    description:
      "Edit a label below. The callback stays the same; the returned value changes.",
  },
  {
    title: "Predict the result",
    kind: "PREDICT",
    description:
      "Follow each object through the callback. Write the new array it returns.",
  },
  {
    title: "Make one small change",
    kind: "MODIFY",
    description:
      "Change the return expression so every label comes back in UPPERCASE.",
  },
  {
    title: "Write your own callback",
    kind: "PRACTICE",
    description:
      "Create numbered navigation labels. Return the position starting at 1, a period, a space, and the label.",
  },
] as const;
export type Progress = {
  explored: boolean;
  traced: boolean;
  predicted: boolean;
  practiced: boolean;
  draft: string;
  prediction: string;
  hint: number;
  labels: string[];
  preset: "ux" | "dbd";
  alias: string;
  section: string;
  guidedStep: number;
  completedSteps: number[];
  traceStep: number;
  modifyDraft: string;
  modified: boolean;
  sidebarCollapsed: boolean;
};
export const emptyProgress: Progress = {
  explored: false,
  traced: false,
  predicted: false,
  practiced: false,
  draft: "",
  prediction: "",
  hint: 0,
  labels: uxCards.map((c) => c.label),
  preset: "ux",
  alias: "card",
  section: "Explore",
  guidedStep: 0,
  completedSteps: [],
  traceStep: 0,
  modifyDraft: "card.label",
  modified: false,
  sidebarCollapsed: false,
};
export const storageKey = "syntax-lab-v1";
export function loadProgress(): Progress {
  try {
    const p = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (!p || typeof p !== "object") return { ...emptyProgress };
    // Keep the same storage key and migrate the previous four-section lesson.
    const legacyStep: Record<string, number> = {
      Explore: 0,
      Trace: 2,
      Predict: 4,
      Practice: 6,
    };
    const section = ["Explore", "Trace", "Predict", "Practice"].includes(
      p.section,
    )
      ? p.section
      : "Explore";
    const oldCompletions = [
      ...(p.explored === true ? [0, 1, 3] : []),
      ...(p.traced === true ? [2] : []),
      ...(p.predicted === true ? [4] : []),
      ...(p.practiced === true ? [6] : []),
    ];
    const completed = Array.isArray(p.completedSteps)
      ? p.completedSteps.filter(
          (v: unknown) =>
            Number.isInteger(v) && Number(v) >= 0 && Number(v) < 7,
        )
      : oldCompletions;
    return {
      ...emptyProgress,
      explored: p.explored === true,
      traced: p.traced === true,
      predicted: p.predicted === true,
      practiced: p.practiced === true,
      modified: p.modified === true,
      draft: typeof p.draft === "string" ? p.draft : emptyProgress.draft,
      prediction: typeof p.prediction === "string" ? p.prediction : "",
      hint: Number.isInteger(p.hint) ? Math.max(0, Math.min(3, p.hint)) : 0,
      labels:
        Array.isArray(p.labels) &&
        p.labels.length === 3 &&
        p.labels.every((v: unknown) => typeof v === "string")
          ? p.labels
          : emptyProgress.labels,
      preset: p.preset === "dbd" ? "dbd" : "ux",
      alias: ["card", "item", "banana"].includes(p.alias) ? p.alias : "card",
      section,
      guidedStep: Number.isInteger(p.guidedStep)
        ? Math.max(0, Math.min(6, p.guidedStep))
        : legacyStep[section],
      completedSteps: [...new Set<number>(completed)],
      traceStep: Number.isInteger(p.traceStep)
        ? Math.max(0, Math.min(9, p.traceStep))
        : p.traced === true
          ? 9
          : 0,
      modifyDraft:
        typeof p.modifyDraft === "string" ? p.modifyDraft : "card.label",
      sidebarCollapsed: p.sidebarCollapsed === true,
    };
  } catch {
    return { ...emptyProgress };
  }
}
export function checkModification(
  expression: string,
  cards: Card[],
): { ok: boolean; output: string[]; message: string } {
  try {
    const source = `cards.map(card => ${expression})`;
    const output = runChallenge(source, cards);
    const others = [
      { id: 10, label: "Explore", color: "", category: "" },
      { id: 77, label: "Build", color: "", category: "" },
    ];
    const ok =
      output.every((v, i) => v === cards[i].label.toUpperCase()) &&
      runChallenge(source, others).every(
        (v, i) => v === others[i].label.toUpperCase(),
      );
    return {
      ok,
      output,
      message: ok
        ? "Every label is uppercase. Only the returned text changed."
        : "Your callback runs. The target is each label in UPPERCASE.",
    };
  } catch (error) {
    return {
      ok: false,
      output: [],
      message:
        error instanceof Error
          ? error.message
          : "Finish the expression to see a result.",
    };
  }
}
// A deliberately small AST interpreter. Learner code is parsed, never eval'd.
// It can only read callback parameters and use the syntax taught in this lesson.
type Value = string | number | Card | undefined;
function read(node: Node, scope: Record<string, Value>): Value {
  switch (node.type) {
    case "Identifier":
      if (Object.prototype.hasOwnProperty.call(scope, node.name))
        return scope[node.name];
      throw new Error(
        `“${node.name}” isn't defined in this callback. Check your parameter names.`,
      );
    case "StringLiteral":
    case "NumericLiteral":
      return node.value;
    case "MemberExpression": {
      if (
        node.computed ||
        node.object.type !== "Identifier" ||
        node.property.type !== "Identifier"
      )
        throw new Error("Use dot notation, like card.label.");
      const obj = read(node.object, scope);
      if (
        typeof obj === "object" &&
        obj &&
        ["id", "label", "category"].includes(node.property.name)
      )
        return obj[node.property.name as "id" | "label" | "category"];
      throw new Error("Read .label, .id, or .category from the current card.");
    }
    case "BinaryExpression": {
      const left = read(node.left, scope),
        right = read(node.right, scope);
      if (
        node.operator === "+" &&
        (typeof left === "string" || typeof left === "number") &&
        (typeof right === "string" || typeof right === "number")
      )
        return typeof left === "string" || typeof right === "string"
          ? String(left) + String(right)
          : left + right;
      throw new Error("This challenge supports + for numbers and text.");
    }
    case "TemplateLiteral":
      return node.quasis
        .map(
          (q, i) =>
            q.value.cooked +
            (node.expressions[i]
              ? String(read(node.expressions[i], scope))
              : ""),
        )
        .join("");
    case "CallExpression": {
      const c = node.callee;
      if (
        c.type === "MemberExpression" &&
        !c.computed &&
        c.property.type === "Identifier" &&
        node.arguments.length === 0
      ) {
        const value = read(c.object, scope);
        if (typeof value === "string" && c.property.name === "toUpperCase")
          return value.toUpperCase();
        if (typeof value === "string" && c.property.name === "toLowerCase")
          return value.toLowerCase();
      }
      throw new Error(
        "Only .toUpperCase() and .toLowerCase() method calls are supported here.",
      );
    }
    default:
      throw new Error(
        `This practice runner doesn't support ${node.type}. Try a template literal or string concatenation.`,
      );
  }
}
export function runChallenge(source: string, cards: Card[]): string[] {
  if (source.length > 5000)
    throw new Error("Keep this callback under 5,000 characters.");
  let expression: Expression;
  try {
    expression = parseExpression(source);
  } catch {
    throw new Error(
      "Something in the syntax is unfinished. Check parentheses, quotes, and the arrow (=>).",
    );
  }
  if (
    expression.type !== "CallExpression" ||
    expression.callee.type !== "MemberExpression" ||
    expression.callee.computed ||
    expression.callee.object.type !== "Identifier" ||
    expression.callee.object.name !== "cards" ||
    expression.callee.property.type !== "Identifier" ||
    expression.callee.property.name !== "map"
  )
    throw new Error(
      "Start with cards.map(...) so each card is transformed into a new value.",
    );
  const fn = expression.arguments[0];
  if (
    expression.arguments.length !== 1 ||
    fn?.type !== "ArrowFunctionExpression" ||
    fn.async
  )
    throw new Error(
      "Pass one arrow function to .map(), like (card, index) => ...",
    );
  if (
    fn.params.length < 1 ||
    fn.params.length > 2 ||
    fn.params.some((p) => p.type !== "Identifier")
  )
    throw new Error(
      "Name the current card and optionally its index, for example (card, index).",
    );
  const names = fn.params.map((p) => (p.type === "Identifier" ? p.name : ""));
  if (new Set(names).size !== names.length)
    throw new Error("Give each parameter a different name.");
  let body: Node = fn.body;
  if (body.type === "BlockStatement") {
    const statements = body.body;
    if (
      statements.length !== 1 ||
      statements[0].type !== "ReturnStatement" ||
      !statements[0].argument
    )
      throw new Error(
        "Inside curly braces, use one return statement to send back the new value.",
      );
    body = statements[0].argument;
  }
  return cards.map((card, index) => {
    const scope: Record<string, Value> = Object.create(null);
    scope[names[0]] = card;
    if (names[1]) scope[names[1]] = index;
    const result = read(body, scope);
    if (typeof result !== "string" && typeof result !== "number")
      throw new Error(
        "Return a label string, rather than the entire card object.",
      );
    return String(result);
  });
}
export function checkChallenge(
  source: string,
  cards: Card[],
): { ok: boolean; output: string[]; message: string } {
  try {
    const output = runChallenge(source, cards);
    const other: Card[] = [
      { id: 90, label: "Research", category: "", color: "" },
      { id: 33, label: "Prototype", category: "", color: "" },
    ];
    const expected = cards.map((c, i) => `${i + 1}. ${c.label}`);
    const generalized = runChallenge(source, other).every(
      (v, i) => v === `${i + 1}. ${other[i].label}`,
    );
    const ok = output.every((v, i) => v === expected[i]) && generalized;
    return {
      ok,
      output,
      message: ok
        ? "You wrote a reusable transformation. Your callback also works with a different set of cards."
        : output.some((v) => v === "undefined")
          ? "A value is undefined. Check your parameter and property names."
          : "Your code runs. Compare your output with the target: start numbering at 1, then add a period, a space, and the card’s label.",
    };
  } catch (error) {
    return {
      ok: false,
      output: [],
      message:
        error instanceof Error ? error.message : "Check your callback syntax.",
    };
  }
}
export function checkPrediction(input: string): {
  ok: boolean;
  message: string;
} {
  try {
    const value = JSON.parse(input);
    const ok =
      Array.isArray(value) &&
      value.length === 3 &&
      value.every((v, i) => v === ["Discover", "Design", "Test"][i]);
    return {
      ok,
      message: ok
        ? "Exactly. Each call returns one label. .map() collects those labels into a new array."
        : "Not yet. Track what card.label returns for each object, in order. You don’t need the id or category.",
    };
  } catch {
    return {
      ok: false,
      message:
        'Write an array of strings, using double quotes. Example shape: ["first", "second", "third"].',
    };
  }
}
