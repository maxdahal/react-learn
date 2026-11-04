import { describe, expect, it } from "vitest";
import { checkMission, missionFiles, missions } from "./missions";
import type { PreviewReport } from "./missions";
const empty: PreviewReport = {
  text: "",
  list: [],
  buttons: [],
  ids: [],
  inputs: 0,
  native: false,
  thumbnail: false,
};
const reports: Partial<PreviewReport>[] = [
  { text: "Hello, Ada!" },
  { text: "Ada" },
  {
    text: "Original: 2ResearchDesignTest",
    list: ["Research", "Design", "Test"],
  },
  { ids: ["item-7"] },
  { list: ["Research", "Design", "Test"] },
  { list: ["Design"] },
  { text: '["Interview","Survey","Prototype","Test"]' },
  { text: "Dashboard" },
  { text: 'Original: 2["Research","Design","Test"]' },
  { buttons: ["Research, Design"] },
  { buttons: ["Continue"] },
  { thumbnail: true, buttons: ["Like"] },
  { text: "ReorderDesignResearch", inputs: 2 },
  { buttons: ["Active"] },
  { text: "Talks ready" },
  { native: true, text: "Hello, React." },
];
describe("code missions", () => {
  it("defines sixteen actionable missions with progressive hints", () => {
    expect(missions).toHaveLength(16);
    for (const m of missions) {
      expect(m.hints).toHaveLength(3);
      expect(m.starter).not.toBe(m.solution);
      expect(m.task.length).toBeGreaterThan(20);
    }
  });
  it("accepts every worked solution only with its matching runtime result", () => {
    missions.forEach((m, i) => {
      const files = missionFiles(i, { "App.jsx": m.solution });
      expect(
        checkMission(i, files, { ...empty, ...reports[i] }).ok,
        `solution ${i + 1}`,
      ).toBe(true);
      expect(
        checkMission(i, files, empty).ok,
        `missing behavior ${i + 1}`,
      ).toBe(false);
    });
  });
  it("does not award unfinished starter code even if a report mimics the right output", () => {
    missions.forEach((_, i) =>
      expect(
        checkMission(i, missionFiles(i), { ...empty, ...reports[i] }).ok,
        `starter ${i + 1}`,
      ).toBe(false),
    );
  });
  it("rejects syntax errors and reports sandbox errors", () => {
    expect(checkMission(0, { "App.jsx": "const Greeting = (" }, empty).ok).toBe(
      false,
    );
    expect(
      checkMission(
        0,
        { "App.jsx": missions[0].solution },
        { ...empty, ...reports[0], error: "Oops" },
      ),
    ).toMatchObject({ ok: false, message: "Oops" });
  });
});
