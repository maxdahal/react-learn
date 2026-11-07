import { describe, expect, it } from "vitest";
import { checkZenAnswer } from "./zenValidation";
export const solutions: Record<number, string> = {
  0: "const run = () => {};",
  1: "const { perk } = survivorLoadout;",
  2: "[...prev, 'Medkit']",
  3: "`survivor-${id}`",
  4: "survivors.map(name => <li>{name}</li>)",
  5: "survivors.filter(s => s.isInjured)",
  6: "chests.flatMap(c => c.items)",
  7: "isInjured ? 'Injured' : 'Healthy'",
  9: "await openExitGate()",
  10: "export default SurvivorHUD;",
  11: "<VideoList><Thumbnail /><LikeButton /></VideoList>",
  12: "key={survivor.id}",
  13: "const [progress, setProgress] = useState(0);",
  14: "<Suspense fallback={<Loading />}><MatchStats /></Suspense>",
};
describe("Zen syntax checks", () => {
  it.each(Object.entries(solutions))(
    "accepts the required solution for generator index %s",
    (index, source) => {
      expect(checkZenAnswer(Number(index), source)).toBe(true);
    },
  );
  it.each([
    [0, "function run() {}"],
    [1, "const { level } = survivorLoadout;"],
    [2, "prev.push('Medkit')"],
    [3, "'survivor-${id}'"],
    [4, "survivors.map(name => <li>Dwight</li>)"],
    [5, "survivors.filter(s => true)"],
    [6, "chests.map(c => c.items)"],
    [7, "isInjured ? 'Healthy' : 'Injured'"],
    [9, "openExitGate()"],
    [10, "export default SurvivorHUD();"],
    [11, "<VideoList><Thumbnail /></VideoList>"],
    [12, "key={index}"],
    [13, 'const [progress, setProgress] = useState("0");'],
    [14, "<Suspense fallback={Loading}><MatchStats /></Suspense>"],
  ])(
    "gives another try for a misconception in generator %s",
    (index, source) => {
      expect(checkZenAnswer(Number(index), String(source))).toBe(false);
    },
  );
  it("accepts formatting, different quotes, and callback parameter names", () => {
    expect(checkZenAnswer(2, '[ ...prev, "Medkit" ];')).toBe(true);
    expect(
      checkZenAnswer(
        4,
        "survivors.map(survivor => { return <li>{survivor}</li>; });",
      ),
    ).toBe(true);
    expect(
      checkZenAnswer(
        5,
        "survivors.filter(function (person) { return person.isInjured; })",
      ),
    ).toBe(true);
    expect(checkZenAnswer(6, "chests.flatMap(chest => chest.items)")).toBe(
      true,
    );
    expect(
      checkZenAnswer(13, "const [progress, setProgress] = React.useState(0)"),
    ).toBe(true);
  });
  it("never evaluates submitted code and handles incomplete input", () => {
    expect(checkZenAnswer(0, 'throw new Error("should never run")')).toBe(
      false,
    );
    expect(checkZenAnswer(3, "`unfinished")).toBe(false);
    expect(checkZenAnswer(0, "a".repeat(2001))).toBe(false);
    expect(checkZenAnswer(3, "")).toBe(false);
  });
});
