// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { missionStorageKey, readMissionProgress } from "./missionProgress";
beforeEach(() => localStorage.clear());
describe("mission progress", () => {
  it("saves separate tasks and drafts without modifying legacy progress", () => {
    localStorage.setItem("syntax-lab-v1", "legacy");
    localStorage.setItem(
      missionStorageKey,
      JSON.stringify({
        explored: [0, 0, 99],
        solved: [0],
        tasks: { 0: 1 },
        drafts: { 0: { "App.jsx": "export default () => <h1>Hello</h1>;" } },
        hints: { 0: 2 },
      }),
    );
    expect(readMissionProgress()).toMatchObject({
      explored: [0],
      solved: [0],
      tasks: { 0: 1 },
      drafts: { 0: { "App.jsx": "export default () => <h1>Hello</h1>;" } },
      hints: { 0: 2 },
    });
    expect(localStorage.getItem("syntax-lab-v1")).toBe("legacy");
  });
  it("sanitizes unknown files and handles corrupt data", () => {
    localStorage.setItem(
      missionStorageKey,
      JSON.stringify({
        tasks: { 0: 100 },
        drafts: { 0: { "App.jsx": "valid", "outside.js": "ignore" } },
        hints: { 0: 999 },
      }),
    );
    expect(readMissionProgress()).toMatchObject({
      tasks: { 0: 0 },
      drafts: { 0: { "App.jsx": "valid" } },
      hints: { 0: 3 },
    });
    localStorage.setItem(missionStorageKey, "invalid");
    expect(readMissionProgress().solved).toEqual([]);
  });
});
