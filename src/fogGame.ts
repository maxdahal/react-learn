export const trialStorageKey = "fog-survival-trial-v6";
export type TrialState = {
  repaired: number[];
  perfect: number[];
  escaped: boolean;
  assisted: boolean;
  effects: boolean;
};
export type SkillResult = "miss" | "good" | "perfect";
export function scoreSkillCheck(position: number): SkillResult {
  if (!Number.isFinite(position) || position < 0.62 || position > 0.84)
    return "miss";
  return position >= 0.73 && position <= 0.77 ? "perfect" : "good";
}
export function readTrial(): TrialState {
  const assisted =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
  const empty = {
    repaired: [],
    perfect: [],
    escaped: false,
    assisted,
    effects: false,
  };
  try {
    const p = JSON.parse(localStorage.getItem(trialStorageKey) || "null");
    if (!p || typeof p !== "object") return empty;
    const ids = (x: unknown) =>
      Array.isArray(x)
        ? [
            ...new Set<number>(
              x.filter((i) => Number.isInteger(i) && i >= 0 && i < 16),
            ),
          ]
        : [];
    const repaired = ids(p.repaired);
    return {
      repaired,
      perfect: ids(p.perfect).filter((i) => repaired.includes(i)),
      escaped: p.escaped === true,
      assisted: assisted || p.assisted === true,
      effects: p.effects === true,
    };
  } catch {
    return empty;
  }
}
export function verifiedRepairs(
  trial: TrialState,
  progress: { explored: number[]; solved: number[] },
) {
  return trial.repaired.filter(
    (i) => progress.explored.includes(i) && progress.solved.includes(i),
  );
}
export function repairGenerator(
  trial: TrialState,
  index: number,
  result: SkillResult,
  eligible: boolean,
): TrialState {
  if (
    !eligible ||
    !Number.isInteger(index) ||
    index < 0 ||
    index > 15 ||
    result === "miss" ||
    trial.repaired.includes(index)
  )
    return trial;
  return {
    ...trial,
    repaired: [...trial.repaired, index],
    perfect: result === "perfect" ? [...trial.perfect, index] : trial.perfect,
  };
}
