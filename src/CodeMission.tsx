import { useEffect, useMemo, useRef, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { Check, Code2, RotateCcw } from "lucide-react";
import { checkMission, missionFiles, missions } from "./missions";
import type { PreviewReport } from "./missions";
(
  globalThis as typeof globalThis & { MonacoEnvironment: unknown }
).MonacoEnvironment = { getWorker: () => new EditorWorker() };
loader.config({ monaco });
export default function CodeMission({
  index,
  drafts,
  onChange,
  onSolved,
  onValidity,
  theme,
}: {
  index: number;
  drafts?: Record<string, string>;
  onChange: (files: Record<string, string>) => void;
  onSolved: () => void;
  onValidity: (valid: boolean) => void;
  theme: "dark" | "light";
}) {
  const files = useMemo(() => missionFiles(index, drafts), [index, drafts]);
  const [file, setFile] = useState("App.jsx");
  const [report, setReport] = useState<{
    data: PreviewReport;
    source: string;
  }>();
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const channel = useRef(crypto.randomUUID());
  const generation = useRef("");
  const sourceKey = JSON.stringify(files);
  const submittedSource = useRef("");
  useEffect(() => {
    const handle = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === "deep-dive-ready") {
        setReady(true);
        return;
      }
      if (
        e.data?.type === "deep-dive-report" &&
        e.data.channel === channel.current &&
        e.data.run === generation.current
      )
        setReport({ data: e.data, source: submittedSource.current });
    };
    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, []);
  useEffect(() => {
    generation.current = crypto.randomUUID();
    setReport(undefined);
    if (!ready) return;
    submittedSource.current = sourceKey;
    const timer = setTimeout(
      () =>
        frame.current?.contentWindow?.postMessage(
          {
            type: "deep-dive-run",
            channel: channel.current,
            run: generation.current,
            files,
          },
          "*",
        ),
      400,
    );
    return () => clearTimeout(timer);
  }, [files, ready]);
  const result = checkMission(
    index,
    files,
    report?.source === sourceKey ? report.data : undefined,
  );
  useEffect(() => {
    onValidity(result.ok);
    if (result.ok) onSolved();
  }, [result.ok, onSolved, onValidity]);
  return (
    <div className="micro-code">
      <div className="micro-editor">
        <div className="micro-file-tabs">
          {Object.keys(files).map((name) => (
            <button
              key={name}
              aria-pressed={file === name}
              onClick={() => setFile(name)}
            >
              <Code2 size={13} />
              {name}
            </button>
          ))}
          <button
            className="micro-reset"
            aria-label="Reset code for this mission"
            onClick={() => onChange(missionFiles(index))}
          >
            <RotateCcw size={13} />
          </button>
        </div>
        <Editor
          height="280px"
          language="javascript"
          path={"mission-" + index + "/" + file}
          value={files[file]}
          theme={theme === "dark" ? "vs-dark" : "light"}
          onChange={(value) => onChange({ ...files, [file]: value || "" })}
          options={{
            minimap: { enabled: false },
            autoClosingBrackets: "never",
            autoClosingQuotes: "never",
            autoIndent: "none",
            formatOnPaste: false,
            fontSize: 13,
            lineNumbers: "on",
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            accessibilitySupport: "on",
            ariaLabel: "Mission code editor",
            padding: { top: 16 },
            renderLineHighlight: "line",
            fixedOverflowWidgets: true,
          }}
          loading={
            <p className="micro-editor-loading">
              Loading the local code editor…
            </p>
          }
        />
      </div>
      <div className="micro-frame">
        <div className="d-panel-title">
          <span>LIVE SURVIVOR HUD</span>
          {index === 15 && <small>NATIVE PRIMITIVE MODEL</small>}
          {index === 14 && <small>CLIENT SUSPENSE EXERCISE</small>}
        </div>
        <iframe
          title="Mission live preview"
          ref={frame}
          src="/lesson-preview.html"
          sandbox="allow-scripts"
          onLoad={() => setReady(true)}
        />
      </div>
      <div
        className={"micro-result " + (result.ok ? "solved" : "")}
        role="status"
      >
        {result.ok ? <Check size={16} /> : <span className="micro-wait-dot" />}
        <span>
          {report?.source === sourceKey || !result.structure
            ? result.message
            : "Running your code…"}
        </span>
      </div>
    </div>
  );
}
