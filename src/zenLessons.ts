export type ZenMission = {
  id: string;
  kind: "code" | "repair" | "platform" | "principle";
  question: string;
  description: string;
  starter?: string;
  context?: string;
  hints: string[];
  success: string;
  actionLabel?: string;
};
export type ZenGenerator = { topic: string; missions: ZenMission[] };

// Each mission occupies the same single card. Related ideas never compete on screen.
export const zenGenerators: ZenGenerator[] = [
  {
    topic: "Arrow functions",
    missions: [
      {
        id: "arrow",
        kind: "code",
        question: "Give repair an arrow function.",
        description:
          "Turn this survivor action into a concise function with no parameters.",
        context: "function repair() {}",
        starter: "const repair = ",
        hints: [
          "An arrow connects the parameter parentheses to the function body.",
          "After const repair =, try () => {}.",
        ],
        success:
          "The arrow connects the empty parameters to the function body.",
      },
    ],
  },
  {
    topic: "Object & array destructuring",
    missions: [
      {
        id: "parameters",
        kind: "code",
        question: "Unpack the props as they arrive.",
        description:
          "Destructure title and isInjured directly in the Survivor function’s parameter.",
        context: "props = { title: 'Meg', isInjured: true }",
        starter: "const Survivor = (_____) => {};",
        hints: [
          "An object pattern uses braces to pick properties by name.",
          "Replace the blank with { title, isInjured }.",
        ],
        success: "The function can now use title and isInjured directly.",
      },
      {
        id: "state-pair",
        kind: "code",
        question: "Give each array position a name.",
        description:
          "useState returns a pair: the current item, then the function that updates it.",
        starter: "const [_____] = useState('Medkit');",
        hints: [
          "Array destructuring uses position, rather than property names.",
          "Put item, setItem between the square brackets.",
        ],
        success: "item holds the value; setItem is its update function.",
      },
    ],
  },
  {
    topic: "Rest & spread",
    missions: [
      {
        id: "spread",
        kind: "code",
        question: "Add a Medkit without changing inventory.",
        description:
          "Spread the existing items into a new array before adding the Medkit.",
        context: "const inventory = ['Map'];",
        starter: "[..._____, 'Medkit']",
        hints: [
          "Spread unpacks an existing array into a new one.",
          "Use inventory after the three dots.",
        ],
        success:
          "The new array has Map and Medkit; inventory still has only Map.",
      },
      {
        id: "rest",
        kind: "code",
        question: "Gather the remaining supplies.",
        description:
          "In a parameter, the same three dots collect arguments into an array named items.",
        starter: "const pack = (_____) => items;",
        hints: [
          "Rest gathers values where a function receives its arguments.",
          "Use ...items as the parameter.",
        ],
        success: 'pack("Map", "Medkit") would collect both values in items.',
      },
    ],
  },
  {
    topic: "Template literals",
    missions: [
      {
        id: "template",
        kind: "code",
        question: "Create a survivor’s dynamic tag.",
        description: "Use backticks to combine survivor- with the value of id.",
        context: "const id = 4;",
        starter: "",
        hints: [
          "Inside backticks, ${…} inserts the value of an expression.",
          "Try `survivor-${id}`.",
        ],
        success: "With id equal to 4, the tag is survivor-4.",
      },
    ],
  },
  {
    topic: "Mapping teammate HUDs",
    missions: [
      {
        id: "map",
        kind: "code",
        question: "Give each teammate a HUD.",
        description:
          "map gives name one survivor at a time; return a SurvivorHUD with that name prop.",
        context: "['Dwight', 'Meg', 'Claudette', 'Jake']",
        starter: "survivors.map(name => _____)",
        hints: [
          "The callback parameter is the current name, not the whole array.",
          "Return <SurvivorHUD name={name} /> in the blank.",
        ],
        success:
          "Four names become four HUD elements: Dwight, Meg, Claudette, and Jake.",
      },
    ],
  },
  {
    topic: "Filtering injured teammates",
    missions: [
      {
        id: "filter",
        kind: "code",
        question: "Keep the injured teammates.",
        description:
          "A filter callback keeps its current survivor when isInjured is true.",
        starter: "survivors.filter(s => _____)",
        hints: [
          "Read the injury property from the callback parameter s.",
          "Try s.isInjured in the blank.",
        ],
        success: "filter builds a new array containing only injured survivors.",
      },
    ],
  },
  {
    topic: "Flattening & aggregation",
    missions: [
      {
        id: "flat-map",
        kind: "code",
        question: "Gather the chest loot.",
        description:
          "Return each chest’s items with flatMap to collect one flat inventory.",
        context: "chests: ['Map'] and ['Medkit', 'Key']",
        starter: "chests.flatMap(c => _____)",
        hints: [
          "Each callback receives one chest, named c.",
          "Return c.items in the blank.",
        ],
        success: 'The flat inventory is ["Map", "Medkit", "Key"].',
      },
      {
        id: "reduce",
        kind: "code",
        question: "Count the supplies across the chests.",
        description:
          "reduce carries a running total; add the number of items in the current chest.",
        context: "chests: ['Map'] and ['Medkit', 'Key']",
        starter: "chests.reduce((total, chest) => _____, 0)",
        hints: [
          "total is the accumulated count; chest.items.length is the next amount.",
          "Try total + chest.items.length in the blank.",
        ],
        success: "The total starts at 0, becomes 1, then becomes 3.",
      },
    ],
  },
  {
    topic: "Inline conditionals",
    missions: [
      {
        id: "ternary",
        kind: "code",
        question: "Choose the right health label.",
        description:
          "Show Injured! when isInjured is true; otherwise show Healthy.",
        starter: "isInjured ? _____ : 'Healthy'",
        hints: [
          "A ternary chooses between two values, separated by a colon.",
          'Put "Injured!" in the blank, including the quotes.',
        ],
        success: "The condition chooses exactly one of the two labels.",
      },
      {
        id: "and",
        kind: "code",
        question: "Show a badge only when it is needed.",
        description:
          "Use && to show InjuryBadge only when the boolean isInjured is true.",
        starter: "isInjured _____ <InjuryBadge />",
        hints: [
          "Logical AND can conditionally include an element in JSX.",
          "Replace the blank with &&.",
        ],
        success:
          "A false boolean renders no badge; a true boolean includes InjuryBadge.",
      },
    ],
  },
  {
    topic: "Immutability & pure functions",
    missions: [
      {
        id: "immutable",
        kind: "code",
        question: "Heal without changing the original.",
        description:
          "Return a new survivor object with health set to 100, keeping the other properties.",
        starter: "const heal = survivor => (_____);",
        hints: [
          "Spread the original object, then replace health in the new object.",
          "Try { ...survivor, health: 100 } in the blank.",
        ],
        success:
          "heal returns a new reference and leaves its input untouched, keeping updates predictable.",
      },
    ],
  },
  {
    topic: "Async JavaScript & ES modules",
    missions: [
      {
        id: "module-import",
        kind: "code",
        question: "Bring in the gate utility.",
        description:
          "Import the named openExitGate function from the local ./gate module.",
        starter: "import { _____ } from './gate';",
        hints: [
          "A named import uses the exported name inside braces.",
          "Put openExitGate inside the braces.",
        ],
        success: "The imported function is now available in this module.",
      },
      {
        id: "await",
        kind: "code",
        question: "Wait for the gate’s promise.",
        description:
          "Inside this async action, await openExitGate so the following work waits for it.",
        starter: "const escape = async () => { _____ };",
        hints: [
          "await waits for a promise inside an async function without blocking the UI thread.",
          "Try await openExitGate(); in the blank.",
        ],
        success:
          "The action waits for the promise while the browser can keep responding.",
      },
      {
        id: "module-export",
        kind: "code",
        question: "Share the completed gate action.",
        description:
          "Make escape the default export so another file can import it.",
        starter: "export default _____;",
        hints: [
          "Export the function’s name rather than calling it.",
          "Replace the blank with escape.",
        ],
        success: "Another module can now import escape as the default export.",
      },
    ],
  },
  {
    topic: "Component composition & JSX",
    missions: [
      {
        id: "composition",
        kind: "code",
        question: "Build a HUD from a smaller component.",
        description:
          "Nest PerkIcon inside SurvivorHUD using capitalized JSX component tags.",
        starter: "<SurvivorHUD>_____</SurvivorHUD>",
        hints: [
          "JSX children go between the parent’s opening and closing tags.",
          "Place <PerkIcon /> in the blank.",
        ],
        success:
          "SurvivorHUD receives PerkIcon as children, just as layouts can combine Thumbnail and LikeButton.",
      },
    ],
  },
  {
    topic: "List rendering & stable keys",
    missions: [
      {
        id: "key",
        kind: "code",
        question: "Keep each survivor’s identity.",
        description:
          "Use the survivor’s stable data ID as the key for each mapped HUD.",
        context: "survivors.map(survivor => <SurvivorHUD … />)",
        starter: "key={_____}",
        hints: [
          "An ID follows the same survivor even when the list order changes.",
          "Try survivor.id in the blank.",
        ],
        success:
          "Stable keys help React match each component with its data across updates.",
      },
    ],
  },
  {
    topic: "Reactive state & events",
    missions: [
      {
        id: "state-hook",
        kind: "code",
        question: "Give the repair meter a memory.",
        description:
          "Start repairProgress at 0 with useState and name its setter setRepairProgress.",
        starter: "const [repairProgress, setRepairProgress] = _____(0);",
        hints: [
          "The hook returns the current state value and a setter.",
          "Replace the blank with useState.",
        ],
        success:
          "The state value persists between renders; its setter requests an update.",
      },
      {
        id: "state-meter",
        kind: "repair",
        question: "Repair at your own pace.",
        description:
          "Each click adds 25 using the previous state and updates this live React meter.",
        context: "setRepairProgress(prev => prev + 25)",
        hints: [
          "Click Repair +25 until the meter is full; there is no time limit.",
        ],
        success:
          "Four state updates brought the meter to 100, one render at a time.",
        actionLabel: "Repair +25",
      },
    ],
  },
  {
    topic: "UI library & full-stack frameworks",
    missions: [
      {
        id: "suspense",
        kind: "code",
        question: "Give waiting content a soft fallback.",
        description:
          "React builds UI; full-stack frameworks add routing and server data loading, which can integrate with Suspense.",
        context: "Next.js · React Router framework mode",
        starter: "<Suspense fallback={_____}><MatchStats /></Suspense>",
        hints: [
          "Suspense shows a fallback while supported content waits; it does not fetch data by itself.",
          "Place <LoadingSpinner /> in the blank.",
        ],
        success:
          "The fallback covers supported loading; an async component needs a compatible server framework.",
      },
    ],
  },
  {
    topic: "Web & native versatility",
    missions: [
      {
        id: "platform",
        kind: "platform",
        question: "One React idea, different building blocks.",
        description:
          "Switch from Web to Native to compare browser DOM with native iOS and Android primitives.",
        hints: ["Switch to Native once to see View in place of div."],
        success:
          "React Native and Expo use native views; this browser comparison is a syntax model.",
      },
    ],
  },
  {
    topic: "Server Components, streaming & compiler",
    missions: [
      {
        id: "client-directive",
        kind: "code",
        question: "Keep an interactive button on the client.",
        description:
          "Server Components load data on the server; mark this hook-using file as a client entry in a compatible framework.",
        context: "// RepairButton.tsx uses useState and onClick",
        starter: "",
        hints: [
          "The directive goes at the very beginning of the module, inside quotes.",
          'Try "use client"; as the first line.',
        ],
        success:
          "The client entry can use state and events while server components provide data.",
      },
      {
        id: "streaming",
        kind: "code",
        question: "Let the page shell arrive first.",
        description:
          "On a Node server, renderToPipeableStream can stream HTML while Suspense boundaries wait for supported content.",
        starter: "renderToPipeableStream(_____)",
        hints: [
          "Pass the root React element to the server rendering function.",
          "Put <App /> in the blank.",
        ],
        success:
          "A framework can send the shell first, then stream ready content through its boundaries.",
      },
      {
        id: "compiler",
        kind: "principle",
        question: "What can React Compiler optimize?",
        description:
          "When enabled in a supported build, React Compiler automatically memoizes eligible components and calculations.",
        hints: [],
        actionLabel: "Reuse eligible calculations and component work",
        success:
          "Server data, streamed HTML, client interaction, and compiler optimizations each have a place.",
      },
    ],
  },
];
export const zenMissions = zenGenerators.flatMap(
  (generator) => generator.missions,
);
export function generatorComplete(generator: ZenGenerator, solved: string[]) {
  return generator.missions.every((mission) => solved.includes(mission.id));
}
export function allGeneratorsComplete(solved: string[]) {
  return zenMissions.every((mission) => solved.includes(mission.id));
}
