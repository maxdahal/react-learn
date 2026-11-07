import { describe, expect, it } from "vitest";
import { checkZenAnswer } from "./zenValidation";
import { zenMissions } from "./zenLessons";
import answers from "./test/zenAnswers.json";

describe("master curriculum syntax checks", () => {
  it.each(Object.entries(answers))(
    "accepts the required %s construct",
    (id, source) => {
      expect(checkZenAnswer(id, source)).toBe(true);
    },
  );
  it("has a checked example for every code mission", () => {
    expect(
      zenMissions
        .filter((m) => m.kind === "code")
        .map((m) => m.id)
        .sort(),
    ).toEqual(Object.keys(answers).sort());
  });
  it.each([
    ["arrow", "function repair() {}"],
    ["parameters", "const Survivor = (props) => {};"],
    ["state-pair", 'const { item, setItem } = useState("Medkit");'],
    ["spread", 'inventory.push("Medkit")'],
    ["rest", "const pack = (items) => items;"],
    ["template", '"survivor-${id}"'],
    ["map", 'survivors.map(name => <SurvivorHUD name="Dwight" />)'],
    ["filter", "survivors.filter(s => true)"],
    ["flat-map", "chests.map(c => c.items)"],
    ["reduce", "chests.reduce((total, chest) => chest.items.length, 0)"],
    ["ternary", 'isInjured ? "Healthy" : "Injured!"'],
    ["and", "isInjured || <InjuryBadge />"],
    [
      "immutable",
      "const heal = survivor => { survivor.health = 100; return survivor; };",
    ],
    ["immutable", "const heal = survivor => ({ health: 100, ...survivor });"],
    ["module-import", 'import openExitGate from "./gate";'],
    ["await", "const escape = () => { openExitGate(); };"],
    ["module-export", "export default escape();"],
    ["composition", "<SurvivorHUD />"],
    ["key", "key={index}"],
    [
      "state-hook",
      'const [repairProgress, setRepairProgress] = useState("0");',
    ],
    [
      "suspense",
      "<Suspense fallback={LoadingSpinner}><MatchStats /></Suspense>",
    ],
    ["client-directive", "use client"],
    ["streaming", "renderToString(<App />)"],
  ])("gives a gentle retry for a %s misconception", (id, source) => {
    expect(checkZenAnswer(id, source)).toBe(false);
  });
  it("accepts callback aliases, whitespace, block returns, and quote styles", () => {
    expect(
      checkZenAnswer(
        "map",
        "survivors.map(person => { return <SurvivorHUD name={person} />; });",
      ),
    ).toBe(true);
    expect(
      checkZenAnswer(
        "filter",
        "survivors.filter(function (person) { return person.isInjured; })",
      ),
    ).toBe(true);
    expect(
      checkZenAnswer(
        "reduce",
        "chests.reduce((sum, box) => box.items.length + sum, 0)",
      ),
    ).toBe(true);
    expect(
      checkZenAnswer(
        "state-hook",
        "const [repairProgress, setRepairProgress] = React.useState(0)",
      ),
    ).toBe(true);
    expect(checkZenAnswer("client-directive", '"use client";')).toBe(true);
  });
  it("rejects incomplete text and never executes learner code", () => {
    expect(checkZenAnswer("arrow", 'throw new Error("must not execute")')).toBe(
      false,
    );
    expect(checkZenAnswer("template", "`unfinished")).toBe(false);
    expect(checkZenAnswer("arrow", "a".repeat(2001))).toBe(false);
    expect(checkZenAnswer("template", "")).toBe(false);
  });
});
