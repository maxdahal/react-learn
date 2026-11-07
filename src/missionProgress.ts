export type MissionProgress = {
  explored: number[];
  solved: number[];
  tasks: Record<string, number>;
  drafts: Record<string, Record<string, string>>;
  hints: Record<string, number>;
};
export const missionStorageKey = "fog-survival-missions-v6";
export function readMissionProgress(): MissionProgress {
  const empty = { explored: [], solved: [], tasks: {}, drafts: {}, hints: {} };
  try {
    const p = JSON.parse(localStorage.getItem(missionStorageKey) || "null");
    if (!p || typeof p !== "object") return empty;
    const numbers = (v: unknown) =>
      Array.isArray(v)
        ? [
            ...new Set<number>(
              v.filter((n) => Number.isInteger(n) && n >= 0 && n < 16),
            ),
          ]
        : [];
    const tasks: Record<string, number> = {},
      hints: Record<string, number> = {},
      drafts: Record<string, Record<string, string>> = {};
    for (let i = 0; i < 16; i++) {
      tasks[i] = p.tasks?.[i] === 1 ? 1 : 0;
      hints[i] = Number.isInteger(p.hints?.[i])
        ? Math.min(3, Math.max(0, p.hints[i]))
        : 0;
      const files = p.drafts?.[i];
      if (files && typeof files === "object" && !Array.isArray(files)) {
        const valid: Record<string, string> = {};
        for (const [key, val] of Object.entries(files))
          if (
            ["App.jsx", "Button.jsx", "Perk.jsx"].includes(key) &&
            typeof val === "string"
          )
            valid[key] = val;
        drafts[i] = valid;
      }
    }
    return {
      explored: numbers(p.explored),
      solved: numbers(p.solved),
      tasks,
      drafts,
      hints,
    };
  } catch {
    return empty;
  }
}
