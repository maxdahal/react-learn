// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  checkChallenge,
  checkModification,
  checkPrediction,
  loadProgress,
  runChallenge,
  storageKey,
  uxCards,
} from "./learning";
beforeEach(() => localStorage.clear());
describe("focused callback runner", () => {
  it("runs expression and block bodies with any consistent parameter names", () => {
    expect(runChallenge("cards.map(banana => banana.label)", uxCards)).toEqual([
      "Discover",
      "Design",
      "Test",
    ]);
    expect(
      runChallenge(
        "cards.map((thing, i) => { return `${i + 1}. ${thing.label}`; })",
        uxCards,
      ),
    ).toEqual(["1. Discover", "2. Design", "3. Test"]);
  });
  it("accepts both template and concatenation solutions", () => {
    expect(
      checkChallenge(
        "cards.map((card, index) => `${index + 1}. ${card.label}`)",
        uxCards,
      ).ok,
    ).toBe(true);
    expect(
      checkChallenge('cards.map((c, i) => (i + 1) + ". " + c.label)', uxCards)
        .ok,
    ).toBe(true);
  });
  it("catches hardcoding by checking another dataset", () => {
    expect(
      checkChallenge('cards.map((c, i) => c.id + ". " + c.label)', uxCards).ok,
    ).toBe(false);
    expect(checkChallenge('cards.map(c => "1. Discover")', uxCards).ok).toBe(
      false,
    );
  });
  it("explains syntax, missing returns, and undefined names", () => {
    expect(checkChallenge("cards.map(", uxCards).message).toContain("syntax");
    expect(
      checkChallenge("cards.map(c => { c.label; })", uxCards).message,
    ).toContain("return");
    expect(
      checkChallenge("cards.map(c => card.label)", uxCards).message,
    ).toContain("isn’t defined".replace("’", "'"));
  });
  it("rejects arbitrary execution and property traversal", () => {
    for (const code of [
      'alert("hi")',
      "cards.map(c => window.location)",
      "cards.map(c => c.constructor)",
      'cards.map(c => c["label"])',
      "cards.map(async c => c.label)",
      "cards.map(c => { while(true) {} })",
    ])
      expect(checkChallenge(code, uxCards).ok).toBe(false);
  });
});
describe("prediction and progress", () => {
  it("compares all predicted values in order", () => {
    expect(checkPrediction('["Discover", "Design", "Test"]').ok).toBe(true);
    expect(checkPrediction('["Design", "Discover", "Test"]').ok).toBe(false);
    expect(checkPrediction("['Discover']").message).toContain("double quotes");
  });
  it("recovers from corrupt or unexpected local data", () => {
    localStorage.setItem(storageKey, "broken");
    expect(loadProgress().draft).toBe("");
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        hint: 99,
        labels: [1],
        section: "broken",
        practiced: "true",
      }),
    );
    expect(loadProgress()).toMatchObject({
      hint: 3,
      labels: ["Discover", "Design", "Test"],
      section: "Explore",
      practiced: false,
    });
  });
});

describe("guided walkthrough migration and edits", () => {
  it("migrates old section, answers, hints, and code without resetting them", () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        section: "Practice",
        draft: "cards.map(c => c.label)",
        hint: 2,
        predicted: true,
        traced: true,
        explored: true,
        prediction: '["Discover","Design","Test"]',
      }),
    );
    expect(loadProgress()).toMatchObject({
      guidedStep: 6,
      traceStep: 9,
      hint: 2,
      draft: "cards.map(c => c.label)",
      predicted: true,
      prediction: '["Discover","Design","Test"]',
    });
    expect(loadProgress().completedSteps).toEqual([0, 1, 3, 2, 4]);
  });
  it("sanitizes new step fields and hostile legacy section names", () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        section: "toString",
        traceStep: 99,
        completedSteps: [0, 0, 6, 7, -1, "3"],
      }),
    );
    expect(loadProgress()).toMatchObject({
      guidedStep: 0,
      traceStep: 9,
      completedSteps: [0, 6],
    });
  });
  it("checks the small modification with another dataset", () => {
    expect(checkModification("card.label", uxCards).ok).toBe(false);
    expect(
      checkModification("card.label.toUpperCase()", uxCards),
    ).toMatchObject({ ok: true, output: ["DISCOVER", "DESIGN", "TEST"] });
    expect(checkModification('"DISCOVER"', uxCards).ok).toBe(false);
    expect(checkModification("window.alert()", uxCards).ok).toBe(false);
  });
});
