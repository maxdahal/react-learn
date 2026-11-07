import { parse, parseExpression } from "@babel/parser";
import type { Node, Expression } from "@babel/types";
function nodes(value: unknown, result: Node[] = []): Node[] {
  if (!value || typeof value !== "object") return result;
  if (Array.isArray(value)) {
    value.forEach((v) => nodes(v, result));
    return result;
  }
  const object = value as Record<string, unknown>;
  if (typeof object.type === "string") result.push(value as Node);
  for (const [key, child] of Object.entries(object))
    if (!["loc", "start", "end", "comments", "tokens", "extra"].includes(key))
      nodes(child, result);
  return result;
}
function expression(source: string): Expression {
  return parseExpression(source.trim().replace(/;\s*$/, ""), {
    plugins: ["jsx"],
    allowAwaitOutsideFunction: true,
  });
}
function methodCall(source: string, object: string, method: string) {
  const e = expression(source);
  if (
    e.type !== "CallExpression" ||
    e.callee.type !== "MemberExpression" ||
    e.callee.computed ||
    e.callee.object.type !== "Identifier" ||
    e.callee.object.name !== object ||
    e.callee.property.type !== "Identifier" ||
    e.callee.property.name !== method ||
    e.arguments.length !== 1
  )
    return null;
  const f = e.arguments[0];
  return f.type === "ArrowFunctionExpression" || f.type === "FunctionExpression"
    ? f
    : null;
}
function returned(f: NonNullable<ReturnType<typeof methodCall>>): Node | null {
  if (f.body.type !== "BlockStatement") return f.body;
  if (f.body.body.length !== 1) return null;
  const stmt = f.body.body[0];
  return stmt.type === "ReturnStatement" ? (stmt.argument ?? null) : null;
}
function localProperty(
  node: Node | null | undefined,
  parameter: Node | undefined,
  property: string,
) {
  return (
    parameter?.type === "Identifier" &&
    node?.type === "MemberExpression" &&
    !node.computed &&
    node.object.type === "Identifier" &&
    node.object.name === parameter.name &&
    node.property.type === "Identifier" &&
    node.property.name === property
  );
}
function jsxName(n: Node | undefined, name: string) {
  return (
    n?.type === "JSXOpeningElement" &&
    (n.name.type === "JSXIdentifier"
      ? n.name.name === name
      : n.name.type === "JSXMemberExpression" && n.name.property.name === name)
  );
}
export function checkZenAnswer(index: number, source: string): boolean {
  if (!source.trim() || source.length > 2000) return false;
  try {
    switch (index) {
      case 0: {
        const all = nodes(parse(source, { sourceType: "module" }));
        const decl = all.find(
          (n) =>
            n.type === "VariableDeclarator" &&
            n.id.type === "Identifier" &&
            n.id.name === "run",
        );
        return (
          decl?.type === "VariableDeclarator" &&
          decl.init?.type === "ArrowFunctionExpression" &&
          decl.init.params.length === 0 &&
          decl.init.body.type === "BlockStatement"
        );
      }
      case 1: {
        const program = parse(source, { sourceType: "module" });
        if (program.program.body.length !== 1) return false;
        const s = program.program.body[0];
        if (s.type !== "VariableDeclaration" || s.declarations.length !== 1)
          return false;
        const d = s.declarations[0];
        return (
          d.id.type === "ObjectPattern" &&
          d.id.properties.some(
            (p) =>
              p.type === "ObjectProperty" &&
              p.key.type === "Identifier" &&
              p.key.name === "perk" &&
              p.value.type === "Identifier",
          ) &&
          d.init?.type === "Identifier" &&
          d.init.name === "survivorLoadout"
        );
      }
      case 2: {
        const e = expression(source);
        return (
          e.type === "ArrayExpression" &&
          e.elements.length === 2 &&
          e.elements[0]?.type === "SpreadElement" &&
          e.elements[0].argument.type === "Identifier" &&
          e.elements[0].argument.name === "prev" &&
          e.elements[1]?.type === "StringLiteral" &&
          e.elements[1].value === "Medkit"
        );
      }
      case 3: {
        const e = expression(source);
        return (
          e.type === "TemplateLiteral" &&
          e.expressions.length === 1 &&
          e.expressions[0].type === "Identifier" &&
          e.expressions[0].name === "id" &&
          e.quasis[0].value.cooked === "survivor-" &&
          e.quasis[1].value.cooked === ""
        );
      }
      case 4: {
        const f = methodCall(source, "survivors", "map");
        if (!f || f.params.length < 1 || f.params[0].type !== "Identifier")
          return false;
        const result = returned(f);
        return (
          result?.type === "JSXElement" &&
          jsxName(result.openingElement, "li") &&
          result.children.some(
            (n) =>
              n.type === "JSXExpressionContainer" &&
              n.expression.type === "Identifier" &&
              n.expression.name ===
                (f.params[0].type === "Identifier" ? f.params[0].name : ""),
          )
        );
      }
      case 5: {
        const f = methodCall(source, "survivors", "filter");
        return !!f && localProperty(returned(f), f.params[0], "isInjured");
      }
      case 6: {
        const f = methodCall(source, "chests", "flatMap");
        return !!f && localProperty(returned(f), f.params[0], "items");
      }
      case 7: {
        const e = expression(source);
        return (
          e.type === "ConditionalExpression" &&
          e.test.type === "Identifier" &&
          e.test.name === "isInjured" &&
          e.consequent.type === "StringLiteral" &&
          e.consequent.value === "Injured" &&
          e.alternate.type === "StringLiteral" &&
          e.alternate.value === "Healthy"
        );
      }
      case 9: {
        const e = expression(source);
        return (
          e.type === "AwaitExpression" &&
          e.argument.type === "CallExpression" &&
          e.argument.callee.type === "Identifier" &&
          e.argument.callee.name === "openExitGate" &&
          e.argument.arguments.length === 0
        );
      }
      case 10: {
        const program = parse(source, {
          sourceType: "module",
          plugins: ["jsx"],
          allowUndeclaredExports: true,
        });
        return (
          program.program.body.length === 1 &&
          program.program.body[0].type === "ExportDefaultDeclaration" &&
          program.program.body[0].declaration.type === "Identifier" &&
          program.program.body[0].declaration.name === "SurvivorHUD"
        );
      }
      case 11: {
        const e = expression(source);
        if (e.type !== "JSXElement" || !jsxName(e.openingElement, "VideoList"))
          return false;
        const children = e.children.filter((n) => n.type === "JSXElement");
        return ["Thumbnail", "LikeButton"].every((name) =>
          children.some(
            (n) => n.type === "JSXElement" && jsxName(n.openingElement, name),
          ),
        );
      }
      case 12: {
        const e = expression(
          source.trim().startsWith("<") ? source : `<Survivor ${source} />`,
        );
        if (e.type !== "JSXElement") return false;
        return e.openingElement.attributes.some(
          (a) =>
            a.type === "JSXAttribute" &&
            a.name.name === "key" &&
            a.value?.type === "JSXExpressionContainer" &&
            localProperty(
              a.value.expression,
              { type: "Identifier", name: "survivor" },
              "id",
            ),
        );
      }
      case 13: {
        const p = parse(source, { sourceType: "module" });
        if (
          p.program.body.length !== 1 ||
          p.program.body[0].type !== "VariableDeclaration"
        )
          return false;
        const d = p.program.body[0].declarations;
        if (
          d.length !== 1 ||
          d[0].id.type !== "ArrayPattern" ||
          d[0].init?.type !== "CallExpression"
        )
          return false;
        const names = d[0].id.elements;
        const call = d[0].init;
        const callee = call.callee;
        return (
          names.length === 2 &&
          names[0]?.type === "Identifier" &&
          names[0].name === "progress" &&
          names[1]?.type === "Identifier" &&
          names[1].name === "setProgress" &&
          ((callee.type === "Identifier" && callee.name === "useState") ||
            (callee.type === "MemberExpression" &&
              !callee.computed &&
              callee.object.type === "Identifier" &&
              callee.object.name === "React" &&
              callee.property.type === "Identifier" &&
              callee.property.name === "useState")) &&
          call.arguments.length === 1 &&
          call.arguments[0].type === "NumericLiteral" &&
          call.arguments[0].value === 0
        );
      }
      case 14: {
        const e = expression(source);
        if (e.type !== "JSXElement" || !jsxName(e.openingElement, "Suspense"))
          return false;
        return (
          e.openingElement.attributes.some(
            (a) =>
              a.type === "JSXAttribute" &&
              a.name.name === "fallback" &&
              a.value?.type === "JSXExpressionContainer" &&
              a.value.expression.type === "JSXElement" &&
              jsxName(a.value.expression.openingElement, "Loading"),
          ) &&
          e.children.some(
            (c) =>
              c.type === "JSXElement" &&
              jsxName(c.openingElement, "MatchStats"),
          )
        );
      }
      default:
        return false;
    }
  } catch {
    return false;
  }
}
