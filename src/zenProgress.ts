import type { ZenLanguage } from "./zenLessons";
export const zenStorageKey = "zen-fog-progress-v7";
export type ZenProgress = {
  index: number;
  answers: Record<string, string>;
  completed: number[];
  language: ZenLanguage;
  platform: "web" | "native";
  nativeSeen: boolean;
  escaped: boolean;
};
export function readZenProgress(): ZenProgress {
  const empty: ZenProgress = {
    index: 0,
    answers: {},
    completed: [],
    language: "en-US",
    platform: "web",
    nativeSeen: false,
    escaped: false,
  };
  try {
    const p = JSON.parse(localStorage.getItem(zenStorageKey) || "null");
    if (!p || typeof p !== "object") return empty;
    const completed = Array.isArray(p.completed)
      ? [
          ...new Set<number>(
            p.completed.filter(
              (i: unknown) =>
                typeof i === "number" &&
                Number.isInteger(i) &&
                i >= 0 &&
                i < 16,
            ),
          ),
        ]
      : [];
    const answers: Record<string, string> = {};
    for (let i = 0; i < 16; i++)
      if (typeof p.answers?.[i] === "string")
        answers[i] = p.answers[i].slice(0, 2000);
    return {
      index: Number.isInteger(p.index) ? Math.max(0, Math.min(15, p.index)) : 0,
      answers,
      completed,
      language: p.language === "ne-NP" ? "ne-NP" : "en-US",
      platform: p.platform === "native" ? "native" : "web",
      nativeSeen: p.nativeSeen === true,
      escaped: p.escaped === true && completed.length === 16,
    };
  } catch {
    return empty;
  }
}
