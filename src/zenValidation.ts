import { parse, parseExpression } from "@babel/parser";
import type {
  Node,
  Expression,
  ArrowFunctionExpression,
  FunctionExpression,
} from "@babel/types";

// Inspect syntax trees only. Learner text is never evaluated or injected into the page.
function expression(source: string): Expression {
  return parseExpression(source.trim().replace(/;\s*$/, ""), {
    plugins: ["jsx"],
  });
}
function declaration(source: string, name: string) {
  const body = parse(source, { sourceType: "module", plugins: ["jsx"] }).program
    .body;
  if (
    body.length !== 1 ||
    body[0].type !== "VariableDeclaration" ||
    body[0].declarations.length !== 1
  )
    return null;
  const result = body[0].declarations[0];
  return result.id.type === "Identifier" && result.id.name === name
    ? result.init
    : null;
}
function methodCall(source: string, object: string, method: string) {
  const e = expression(source);
  if (e.type !== "CallExpression" || !property(e.callee, object, method))
    return null;
  return e;
}
function callback(node: Node | undefined) {
  return node?.type === "ArrowFunctionExpression" ||
    node?.type === "FunctionExpression"
    ? node
    : null;
}
function returned(
  f: ArrowFunctionExpression | FunctionExpression,
): Node | null {
  if (f.body.type !== "BlockStatement") return f.body;
  if (f.body.body.length !== 1) return null;
  const statement = f.body.body[0];
  return statement.type === "ReturnStatement"
    ? (statement.argument ?? null)
    : null;
}
function identifier(node: Node | null | undefined, name: string) {
  return node?.type === "Identifier" && node.name === name;
}
function property(
  node: Node | null | undefined,
  object: string,
  key: string,
): boolean {
  return (
    node?.type === "MemberExpression" &&
    !node.computed &&
    identifier(node.object, object) &&
    identifier(node.property, key)
  );
}
function jsxName(node: Node | undefined, name: string) {
  return (
    node?.type === "JSXOpeningElement" &&
    (node.name.type === "JSXIdentifier"
      ? node.name.name === name
      : node.name.type === "JSXMemberExpression" &&
        node.name.object.type === "JSXIdentifier" &&
        node.name.object.name === "React" &&
        node.name.property.name === name)
  );
}
function statePair(
  source: string,
  names: [string, string],
  initial: string | number,
) {
  const body = parse(source, { sourceType: "module" }).program.body;
  if (
    body.length !== 1 ||
    body[0].type !== "VariableDeclaration" ||
    body[0].declarations.length !== 1
  )
    return false;
  const declaration = body[0].declarations[0];
  const call = declaration.init;
  return (
    declaration.id.type === "ArrayPattern" &&
    declaration.id.elements.length === 2 &&
    declaration.id.elements.every((element, i) =>
      identifier(element, names[i]),
    ) &&
    call?.type === "CallExpression" &&
    (identifier(call.callee, "useState") ||
      property(call.callee, "React", "useState")) &&
    call.arguments.length === 1 &&
    (typeof initial === "number"
      ? call.arguments[0].type === "NumericLiteral" &&
        call.arguments[0].value === initial
      : call.arguments[0].type === "StringLiteral" &&
        call.arguments[0].value === initial)
  );
}
export function checkZenAnswer(mission: string, source: string): boolean {
  if (!source.trim() || source.length > 2000) return false;
  try {
    switch (mission) {
      case "arrow": {
        const fn = declaration(source, "Repair");
        return (
          fn?.type === "ArrowFunctionExpression" &&
          !fn.async &&
          fn.params.length === 0 &&
          fn.body.type === "BlockStatement"
        );
      }
      case "parameters": {
        const fn = declaration(source, "Perk");
        if (
          fn?.type !== "ArrowFunctionExpression" ||
          fn.params.length !== 1 ||
          fn.params[0].type !== "ObjectPattern"
        )
          return false;
        const properties = fn.params[0].properties;
        return ["perkName"].every((name) =>
          properties.some(
            (p) =>
              p.type === "ObjectProperty" &&
              !p.computed &&
              identifier(p.key, name) &&
              p.value.type === "Identifier",
          ),
        );
      }
      case "state-pair":
        return statePair(source, ["item", "setItem"], "Medkit");
      case "spread": {
        const e = expression(source);
        return (
          e.type === "ArrayExpression" &&
          e.elements.length === 2 &&
          e.elements[0]?.type === "SpreadElement" &&
          identifier(e.elements[0].argument, "inventory") &&
          e.elements[1]?.type === "StringLiteral" &&
          e.elements[1].value === "Medkit"
        );
      }
      case "rest": {
        const fn = declaration(source, "pack");
        return (
          fn?.type === "ArrowFunctionExpression" &&
          fn.params.length === 1 &&
          fn.params[0].type === "RestElement" &&
          identifier(fn.params[0].argument, "items") &&
          identifier(returned(fn), "items")
        );
      }
      case "template": {
        const e = expression(source);
        return (
          e.type === "TemplateLiteral" &&
          e.expressions.length === 1 &&
          identifier(e.expressions[0], "id") &&
          e.quasis[0].value.cooked === "survivor-" &&
          e.quasis[1].value.cooked === ""
        );
      }
      case "map": {
        const call = methodCall(source, "survivors", "map");
        const fn = callback(call?.arguments[0]);
        if (
          !fn ||
          call?.arguments.length !== 1 ||
          fn.params[0]?.type !== "Identifier"
        )
          return false;
        const result = returned(fn);
        const name = fn.params[0].name;
        return (
          result?.type === "JSXElement" &&
          jsxName(result.openingElement, "li") &&
          result.children.some(
            (child) =>
              child.type === "JSXExpressionContainer" &&
              property(child.expression, name, "name"),
          )
        );
      }
      case "filter":
      case "find":
      case "flat-map": {
        const call = methodCall(
          source,
          mission !== "flat-map" ? "survivors" : "chests",
          mission === "flat-map" ? "flatMap" : mission,
        );
        const fn = callback(call?.arguments[0]);
        return (
          !!fn &&
          call?.arguments.length === 1 &&
          fn.params[0]?.type === "Identifier" &&
          property(
            returned(fn),
            fn.params[0].name,
            mission !== "flat-map" ? "isInjured" : "items",
          )
        );
      }
      case "reduce": {
        const call = methodCall(source, "chests", "reduce");
        const fn = callback(call?.arguments[0]);
        if (
          !fn ||
          call?.arguments.length !== 2 ||
          call.arguments[1].type !== "NumericLiteral" ||
          call.arguments[1].value !== 0 ||
          fn.params[0]?.type !== "Identifier" ||
          fn.params[1]?.type !== "Identifier"
        )
          return false;
        const sum = returned(fn);
        if (sum?.type !== "BinaryExpression" || sum.operator !== "+")
          return false;
        const lengthOfItems = (node: Node) =>
          node.type === "MemberExpression" &&
          !node.computed &&
          identifier(node.property, "length") &&
          property(
            node.object,
            fn.params[1].type === "Identifier" ? fn.params[1].name : "",
            "items",
          );
        return (
          (identifier(sum.left, fn.params[0].name) &&
            lengthOfItems(sum.right)) ||
          (identifier(sum.right, fn.params[0].name) && lengthOfItems(sum.left))
        );
      }
      case "ternary": {
        const e = expression(source);
        return (
          e.type === "ConditionalExpression" &&
          identifier(e.test, "isInjured") &&
          e.consequent.type === "StringLiteral" &&
          e.consequent.value === "Injured!" &&
          e.alternate.type === "StringLiteral" &&
          e.alternate.value === "Healthy"
        );
      }
      case "and": {
        const e = expression(source);
        return (
          e.type === "LogicalExpression" &&
          e.operator === "&&" &&
          identifier(e.left, "isInjured") &&
          e.right.type === "JSXElement" &&
          jsxName(e.right.openingElement, "InjuryBadge")
        );
      }
      case "immutable": {
        const fn = declaration(source, "heal");
        if (
          fn?.type !== "ArrowFunctionExpression" ||
          fn.params.length !== 1 ||
          fn.params[0].type !== "Identifier"
        )
          return false;
        const result = returned(fn);
        return (
          result?.type === "ObjectExpression" &&
          result.properties.length === 2 &&
          result.properties[0].type === "SpreadElement" &&
          identifier(result.properties[0].argument, fn.params[0].name) &&
          result.properties[1].type === "ObjectProperty" &&
          !result.properties[1].computed &&
          identifier(result.properties[1].key, "health") &&
          result.properties[1].value.type === "NumericLiteral" &&
          result.properties[1].value.value === 100
        );
      }
      case "module-import": {
        const body = parse(source, { sourceType: "module" }).program.body;
        return (
          body.length === 1 &&
          body[0].type === "ImportDeclaration" &&
          body[0].source.value === "./gate" &&
          body[0].specifiers.length === 1 &&
          body[0].specifiers[0].type === "ImportSpecifier" &&
          identifier(body[0].specifiers[0].imported, "openExitGate") &&
          identifier(body[0].specifiers[0].local, "openExitGate")
        );
      }
      case "await": {
        const fn = declaration(source, "escape");
        if (
          fn?.type !== "ArrowFunctionExpression" ||
          !fn.async ||
          fn.params.length !== 0 ||
          fn.body.type !== "BlockStatement" ||
          fn.body.body.length !== 1
        )
          return false;
        const statement = fn.body.body[0];
        const wait =
          statement.type === "ExpressionStatement"
            ? statement.expression
            : statement.type === "ReturnStatement"
              ? statement.argument
              : null;
        return (
          wait?.type === "AwaitExpression" &&
          wait.argument.type === "CallExpression" &&
          identifier(wait.argument.callee, "openExitGate") &&
          wait.argument.arguments.length === 0
        );
      }
      case "module-export": {
        const body = parse(source, {
          sourceType: "module",
          allowUndeclaredExports: true,
        }).program.body;
        return (
          body.length === 1 &&
          body[0].type === "ExportDefaultDeclaration" &&
          identifier(body[0].declaration, "escape")
        );
      }
      case "composition": {
        const e = expression(source);
        return (
          e.type === "JSXElement" &&
          jsxName(e.openingElement, "VideoList") &&
          ["Thumbnail", "LikeButton"].every((name) =>
            e.children.some(
              (child) =>
                child.type === "JSXElement" &&
                jsxName(child.openingElement, name),
            ),
          )
        );
      }
      case "key": {
        const e = expression(
          source.trim().startsWith("<") ? source : `<SurvivorHUD ${source} />`,
        );
        return (
          e.type === "JSXElement" &&
          e.openingElement.attributes.some(
            (a) =>
              a.type === "JSXAttribute" &&
              a.name.name === "key" &&
              a.value?.type === "JSXExpressionContainer" &&
              property(a.value.expression, "survivor", "id"),
          )
        );
      }
      case "state-hook":
        return statePair(source, ["progress", "setProgress"], 0);
      case "suspense": {
        const e = expression(source);
        return (
          e.type === "JSXElement" &&
          jsxName(e.openingElement, "Suspense") &&
          e.openingElement.attributes.some(
            (a) =>
              a.type === "JSXAttribute" &&
              a.name.name === "fallback" &&
              a.value?.type === "JSXExpressionContainer" &&
              a.value.expression.type === "JSXElement" &&
              jsxName(a.value.expression.openingElement, "BloodwebSpinner"),
          ) &&
          e.children.some(
            (c) =>
              c.type === "JSXElement" &&
              jsxName(c.openingElement, "MatchStats"),
          )
        );
      }
      case "client-directive": {
        const program = parse(source, { sourceType: "module" }).program;
        return (
          program.body.length === 0 &&
          program.directives.length === 1 &&
          program.directives[0].value.value === "use client"
        );
      }
      case "streaming": {
        const e = expression(source);
        return (
          e.type === "CallExpression" &&
          identifier(e.callee, "renderToPipeableStream") &&
          e.arguments.length === 1 &&
          e.arguments[0].type === "JSXElement" &&
          jsxName(e.arguments[0].openingElement, "App")
        );
      }
      default:
        return false;
    }
  } catch {
    return false;
  }
}
