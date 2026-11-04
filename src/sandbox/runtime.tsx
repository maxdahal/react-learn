import React from "react";
import { createRoot } from "react-dom/client";
import { transform } from "@babel/standalone";
const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);
const style = document.createElement("style");
style.textContent =
  '*{box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#172220;color:#dce7d3;padding:24px;margin:0;font-size:14px;line-height:1.8}h2,h3{font-weight:500;letter-spacing:-.5px}button,input{font:inherit;border:1px solid #557044;border-radius:6px;padding:10px 14px;background:#2a3d23;color:#d6eab7;margin:8px 8px 8px 0}input{background:#111e17;max-width:100%;width:170px}label{display:block;padding:8px 0}ul,ol{padding-left:25px}li{padding:7px}pre{font-size:12px;white-space:pre-wrap;overflow-wrap:anywhere}article,[data-native-view]{border:1px solid #4d6540;border-radius:10px;padding:20px;background:#1e3021}[aria-label="Thumbnail"]{background:#47654b;padding:24px;text-align:center;border-radius:7px}p{margin:12px 0}';
document.head.append(style);
let run = "",
  channel = "",
  deadline = 0,
  ticks = 0,
  lastError = "";
let budgetScheduled = false;
function send(extra: Record<string, unknown> = {}) {
  if (!channel) return;
  parent.postMessage(
    {
      type: "deep-dive-report",
      channel,
      run,
      error: lastError || undefined,
      text: (rootElement.textContent || "").slice(0, 3000),
      list: Array.from(rootElement.querySelectorAll("li")).map((n) =>
        (n.textContent || "").slice(0, 100),
      ),
      buttons: Array.from(rootElement.querySelectorAll("button")).map((n) =>
        (n.textContent || "").slice(0, 100),
      ),
      ids: Array.from(rootElement.querySelectorAll("[id]")).map((n) => n.id),
      inputs: rootElement.querySelectorAll("input").length,
      native: !!rootElement.querySelector("[data-native-view]"),
      thumbnail: !!rootElement.querySelector('[aria-label="Thumbnail"]'),
      ...extra,
    },
    "*",
  );
}
class Boundary extends React.Component<
  { children: React.ReactNode },
  { error: string }
> {
  state = { error: "" };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  componentDidCatch(error: Error) {
    lastError = error.message;
    send();
  }
  render() {
    return this.state.error ? (
      <pre role="alert">{this.state.error}</pre>
    ) : (
      this.props.children
    );
  }
}
window.addEventListener("error", (e) => {
  lastError = e.message;
  send();
});
window.addEventListener("unhandledrejection", (e) => {
  lastError = String(e.reason);
  send();
});
new MutationObserver(() => send()).observe(rootElement, {
  childList: true,
  subtree: true,
  attributes: true,
  characterData: true,
});
function guard() {
  if (!budgetScheduled) {
    ticks = 0;
    deadline = performance.now() + 100;
    budgetScheduled = true;
    queueMicrotask(() => {
      budgetScheduled = false;
    });
  }
  if (++ticks > 10000 || performance.now() > deadline)
    throw new Error(
      "This example ran too long. Check loops or recursive calls.",
    );
}
window.addEventListener("message", (event) => {
  if (event.source !== parent || event.data?.type !== "deep-dive-run") return;
  channel = event.data.channel;
  run = event.data.run;
  lastError = "";
  deadline = performance.now() + 1500;
  ticks = 0;
  const files = event.data.files as Record<string, string>;
  const cache: Record<string, { exports: Record<string, unknown> }> =
    Object.create(null);
  function requireModule(name: string): unknown {
    if (name === "react") return React;
    if (name === "./native")
      return {
        View: ({ children }: { children: React.ReactNode }) =>
          React.createElement(
            "section",
            { "data-native-view": true },
            children,
          ),
        Text: ({ children }: { children: React.ReactNode }) =>
          React.createElement("span", null, children),
      };
    const path = name.replace(/^\.\//, "").replace(/\.jsx?$/, "") + ".jsx";
    if (!Object.hasOwn(files, path))
      throw new Error(
        "This local sandbox supports React and the provided lesson files only.",
      );
    if (cache[path]) return cache[path].exports;
    const module = { exports: {} as Record<string, unknown> };
    cache[path] = module;
    const budgetPlugin = ({ types: t }: any) => ({
      visitor: {
        Function(p: any) {
          if (p.node.body.type === "BlockStatement")
            p.node.body.body.unshift(
              t.expressionStatement(
                t.callExpression(t.identifier("__labGuard"), []),
              ),
            );
        },
        Loop(p: any) {
          if (p.node.body.type !== "BlockStatement")
            p.node.body = t.blockStatement([p.node.body]);
          p.node.body.body.unshift(
            t.expressionStatement(
              t.callExpression(t.identifier("__labGuard"), []),
            ),
          );
        },
      },
    });
    const compiled = transform(files[path], {
      presets: [["react", { runtime: "classic" }]],
      plugins: [budgetPlugin, "transform-modules-commonjs"],
    }).code;
    new Function(
      "require",
      "module",
      "exports",
      "React",
      "__labGuard",
      compiled!,
    )(requireModule, module, module.exports, React, guard);
    return module.exports;
  }
  try {
    const app = requireModule("./App") as { default?: React.ComponentType };
    if (!app.default)
      throw new Error("App.jsx needs a default component export.");
    root.render(
      <Boundary key={run}>
        <app.default />
      </Boundary>,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    lastError = message;
    root.render(<pre role="alert">{message}</pre>);
    send({ error: message });
  }
});
parent.postMessage({ type: "deep-dive-ready" }, "*");
