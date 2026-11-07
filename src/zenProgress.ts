import {
  allGeneratorsComplete,
  zenGenerators,
  zenMissions,
} from "./zenLessons";

// V2 preserves earlier storage and carries forward only compatible missions.
export const zenStorageKey = "zen-fog-master-v2";
export type ZenProgress = {
  generator: number;
  mission: number;
  answers: Record<string, string>;
  solved: string[];
  repairProgress: number;
  platform: "web" | "native";
  nativeSeen: boolean;
  sound: boolean;
  escaped: boolean;
};
export function emptyZenProgress(): ZenProgress {
  return {
    generator: 0,
    mission: 0,
    answers: {},
    solved: [],
    repairProgress: 0,
    platform: "web",
    nativeSeen: false,
    sound: true,
    escaped: false,
  };
}
export function readZenProgress(): ZenProgress {
  const empty = emptyZenProgress();
  try {
    const current = localStorage.getItem(zenStorageKey);
    const migrating = current === null;
    const saved = JSON.parse(
      current ?? localStorage.getItem("zen-fog-master-v1") ?? "null",
    );
    const changed = new Set([
      "arrow",
      "parameters",
      "map",
      "composition",
      "state-hook",
      "suspense",
    ]);
    if (!saved || typeof saved !== "object") return empty;
    const generator = Number.isInteger(saved.generator)
      ? Math.max(0, Math.min(zenGenerators.length - 1, saved.generator))
      : 0;
    const mission = Number.isInteger(saved.mission)
      ? Math.max(
          0,
          Math.min(zenGenerators[generator].missions.length - 1, saved.mission),
        )
      : 0;
    const validIds = new Set(zenMissions.map((m) => m.id));
    const solved = Array.isArray(saved.solved)
      ? [
          ...new Set<string>(
            saved.solved.filter(
              (id: unknown) =>
                typeof id === "string" &&
                validIds.has(id) &&
                (!migrating || !changed.has(id)),
            ),
          ),
        ]
      : [];
    const answers: Record<string, string> = {};
    for (const id of validIds)
      if (
        typeof saved.answers?.[id] === "string" &&
        (!migrating || !changed.has(id))
      )
        answers[id] = saved.answers[id].slice(0, 2000);
    return {
      generator,
      mission,
      answers,
      solved,
      repairProgress: solved.includes("state-meter")
        ? 100
        : typeof saved.repairProgress === "number" &&
            Number.isFinite(saved.repairProgress)
          ? Math.max(
              0,
              Math.min(100, Math.floor(saved.repairProgress / 25) * 25),
            )
          : 0,
      platform: saved.platform === "native" ? "native" : "web",
      nativeSeen: saved.nativeSeen === true,
      sound: saved.sound !== false,
      escaped: saved.escaped === true && allGeneratorsComplete(solved),
    };
  } catch {
    return empty;
  }
}
export function adjacentMission(
  generator: number,
  mission: number,
  direction: -1 | 1,
) {
  if (direction === -1)
    return mission > 0
      ? { generator, mission: mission - 1 }
      : generator > 0
        ? {
            generator: generator - 1,
            mission: zenGenerators[generator - 1].missions.length - 1,
          }
        : { generator: 0, mission: 0 };
  return mission < zenGenerators[generator].missions.length - 1
    ? { generator, mission: mission + 1 }
    : generator < zenGenerators.length - 1
      ? { generator: generator + 1, mission: 0 }
      : { generator, mission };
}
