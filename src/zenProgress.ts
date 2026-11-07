import {
  allGeneratorsComplete,
  zenGenerators,
  zenMissions,
} from "./zenLessons";

// The master curriculum reorders the course. Earlier saved work stays untouched.
export const zenStorageKey = "zen-fog-master-v1";
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
    const saved = JSON.parse(localStorage.getItem(zenStorageKey) || "null");
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
              (id: unknown) => typeof id === "string" && validIds.has(id),
            ),
          ),
        ]
      : [];
    const answers: Record<string, string> = {};
    for (const id of validIds)
      if (typeof saved.answers?.[id] === "string")
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
