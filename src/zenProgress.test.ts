// @vitest-environment jsdom
import { beforeEach, expect, it } from "vitest";
import { readZenProgress, zenStorageKey } from "./zenProgress";
beforeEach(() => localStorage.clear());
it("migrates compatible master-v1 work without modifying the original data", () => {
  const old = JSON.stringify({
    generator: 6,
    mission: 1,
    solved: [
      "arrow",
      "parameters",
      "spread",
      "filter",
      "state-meter",
      "compiler",
    ],
    answers: {
      arrow: "const repair = () => {};",
      spread: "[...inventory, 'Medkit']",
      filter: "draft",
    },
    repairProgress: 100,
    platform: "native",
    nativeSeen: true,
    sound: false,
    escaped: true,
  });
  localStorage.setItem("zen-fog-master-v1", old);
  expect(readZenProgress()).toMatchObject({
    generator: 6,
    mission: 1,
    solved: ["spread", "filter", "state-meter", "compiler"],
    answers: { spread: "[...inventory, 'Medkit']", filter: "draft" },
    repairProgress: 100,
    nativeSeen: true,
    sound: false,
    escaped: false,
  });
  expect(readZenProgress().answers.arrow).toBeUndefined();
  expect(localStorage.getItem("zen-fog-master-v1")).toBe(old);
});
it("uses the new curriculum save once present, rather than restoring an older position", () => {
  localStorage.setItem(
    "zen-fog-master-v1",
    JSON.stringify({ generator: 14, mission: 0, solved: ["spread"] }),
  );
  localStorage.setItem(
    zenStorageKey,
    JSON.stringify({
      generator: 1,
      mission: 0,
      solved: ["arrow"],
      answers: { parameters: "new draft" },
    }),
  );
  expect(readZenProgress()).toMatchObject({
    generator: 1,
    mission: 0,
    solved: ["arrow"],
    answers: { parameters: "new draft" },
  });
});
