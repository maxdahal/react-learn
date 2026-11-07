export type ZenMission = {
  id: string;
  kind: "code" | "repair" | "platform" | "principle" | "choice";
  concept: [string, string] | [string, string, string];
  question: string;
  description: string;
  starter?: string;
  context?: string;
  hints: string[];
  success: string;
  actionLabel?: string;
  choices?: { value: string; label: string }[];
  correctChoice?: string;
};
export type ZenGenerator = { topic: string; missions: ZenMission[] };

// Each mission occupies the same single card. Related ideas never compete on screen.
export const zenGenerators: ZenGenerator[] = [
  {
    topic: "Arrow functions",
    missions: [
      {
        id: "arrow",
        concept: [
          "Arrow functions are a concise way to write functions.",
          "They are often used for React components that return JSX.",
        ],
        kind: "code",
        question: "Give Repair an arrow function.",
        description:
          "Turn this survivor action into a concise function with no parameters.",
        context: "function Repair() {}",
        starter: "const Repair = ",
        hints: [
          "An arrow connects the parameter parentheses to the function body.",
          "After const Repair =, try () => {}.",
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
        concept: [
          "Object destructuring unpacks properties by name into local variables.",
          "Using it in a parameter makes incoming props easy to read.",
        ],
        kind: "code",
        question: "Unpack a perk from the props.",
        description:
          "Unpack perkName directly in the Perk function’s parameter.",
        context: "props = { perkName: 'Self-Care' }",
        starter: "const Perk = (_____) => {};",
        hints: [
          "An object pattern uses braces to pick properties by name.",
          "Replace the blank with { perkName }.",
        ],
        success: "The function can now use perkName directly.",
      },
      {
        id: "state-pair",
        concept: [
          "Array destructuring names values by their position.",
          "A React state pair puts the value first and its setter second.",
        ],
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
        concept: [
          "Spread copies the items of an array into a fresh array.",
          "A new reference lets you update state while keeping the original data intact.",
        ],
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
        concept: [
          "Rest gathers multiple arguments into one array parameter.",
          "The same three dots gather values here, while spread unpacks them elsewhere.",
        ],
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
        concept: [
          "Template literals use backticks to make dynamic strings.",
          "An expression inside ${…} inserts its current value into the text.",
        ],
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
    topic: "Array mapping",
    missions: [
      {
        id: "map",
        concept: [
          "map transforms each item into a value in a new array.",
          "Its callback receives one item at a time, so you can turn survivor data into UI elements.",
        ],
        kind: "code",
        question: "Turn each survivor into a list item.",
        description: "Return an li containing the current survivor’s name.",
        context: "One survivor: { id: 1, name: 'Dwight' }",
        starter: "survivors.map(s => _____)",
        hints: [
          "The parameter s holds one survivor object; s.name reads its name.",
          "Return <li>{s.name}</li> in the blank.",
        ],
        success:
          "Each survivor object becomes a list item containing its own name.",
      },
    ],
  },
  {
    topic: "Filtering injured teammates",
    missions: [
      {
        id: "filter",
        concept: [
          "filter creates a new array containing items that pass a condition.",
          "A true callback result keeps the current item, which is useful for search and tab filters.",
        ],
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
        concept: [
          "flatMap transforms each item, then flattens the returned arrays by one level.",
          "It combines loot from several chests into one inventory.",
        ],
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
        concept: [
          "reduce carries an accumulated value through an array.",
          "Each callback receives the running total and the current item, then returns the next total.",
        ],
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
      {
        id: "find",
        kind: "code",
        concept: [
          "find returns the first item that passes a condition.",
          "It returns undefined when nothing matches, which is useful when you need one result instead of a list.",
        ],
        question: "Find the first injured teammate.",
        description: "Use the current survivor’s injury flag as the condition.",
        starter: "survivors.find(s => _____)",
        hints: [
          "The callback tests one survivor; find returns the first matching survivor.",
          "Try s.isInjured in the blank.",
        ],
        success:
          "The result is one injured survivor, or undefined if no survivor is injured.",
      },
    ],
  },
  {
    topic: "Inline conditionals",
    missions: [
      {
        id: "ternary",
        concept: [
          "A ternary chooses between two values with condition ? A : B.",
          "It fits a small UI decision directly inside JSX.",
        ],
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
        concept: [
          "Logical AND can include JSX only when a boolean condition is true.",
          "With a false boolean, React renders nothing for that expression.",
        ],
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
        concept: [
          "A pure update returns new data without changing its input.",
          "New object references let React recognize state changes instead of reusing the same mutated object.",
        ],
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
        concept: [
          "Modules let files share reusable functions and values.",
          "A named import brings in a specific export using its name inside braces.",
        ],
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
        concept: [
          "An async function returns a promise.",
          "Inside it, await pauses that function until a promise settles while the UI can keep responding.",
        ],
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
        concept: [
          "A default export makes one value the main export of a module.",
          "Another file can import it and reuse the same function.",
        ],
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
        concept: [
          "React interfaces combine small, independent components.",
          "JSX nests components as children so a larger layout can bring them together.",
        ],
        kind: "code",
        question: "Bring two small components together.",
        description: "Place Thumbnail and LikeButton inside VideoList.",
        starter: "<VideoList>_____</VideoList>",
        hints: [
          "JSX children go between the parent’s opening and closing tags.",
          "Place <Thumbnail /><LikeButton /> in the blank.",
        ],
        success: "VideoList receives both components as children.",
      },
    ],
  },
  {
    topic: "List rendering & stable keys",
    missions: [
      {
        id: "key",
        concept: [
          "A stable key identifies an item among its siblings.",
          "React uses it to match components across inserts, moves, and updates.",
        ],
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
        concept: [
          "useState gives a component memory between renders.",
          "Its setter requests a render with the next value, keeping the screen in sync with data.",
        ],
        kind: "code",
        question: "Give the repair meter a memory.",
        description:
          "Start progress at 0 with useState and name its setter setProgress.",
        starter: "const [progress, setProgress] = _____(0);",
        hints: [
          "The hook returns the current state value and a setter.",
          "Replace the blank with useState.",
        ],
        success:
          "The state value persists between renders; its setter requests an update.",
      },
      {
        id: "state-meter",
        concept: [
          "A functional setter receives the latest previous state.",
          "Returning the next value lets repeated click events update the meter reliably.",
        ],
        kind: "repair",
        question: "Repair at your own pace.",
        description:
          "Each click adds 25 using the previous state and updates this live React meter.",
        context: "setProgress(prev => prev + 25)",
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
        concept: [
          "React focuses on UI; frameworks such as Next.js and React Router add routing and data loading.",
          "Suspense shows a fallback while supported content waits; it does not fetch data by itself.",
        ],
        kind: "code",
        question: "Give waiting content a soft fallback.",
        description:
          "Wrap MatchStats with a Suspense boundary and a BloodwebSpinner fallback.",
        context: "Next.js · React Router framework mode",
        starter: "<Suspense fallback={_____}><MatchStats /></Suspense>",
        hints: [
          "Suspense shows a fallback while supported content waits; it does not fetch data by itself.",
          "Place <BloodwebSpinner /> in the blank.",
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
        concept: [
          "React can describe interfaces for different platforms.",
          "Web uses DOM elements, while React Native and Expo use native iOS and Android views.",
        ],
        kind: "platform",
        question: "One React idea, different building blocks.",
        description:
          "Switch the syntax preview from Web (DOM) to Mobile Native View.",
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
        concept: [
          "Server Components run on the server and can load data there.",
          "A client entry marks the boundary for components that need state and browser events.",
        ],
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
        concept: [
          "Streaming rendering can send the page shell before all content is ready.",
          "Supported Suspense boundaries let later content arrive without holding up the whole page.",
        ],
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
        concept: [
          "React Compiler can memoize eligible components and calculations when enabled.",
          "It reduces repeated work while your components still follow React’s purity rules.",
        ],
        kind: "principle",
        question: "What can React Compiler optimize?",
        description:
          "When enabled in a supported build, React Compiler automatically memoizes eligible components and calculations.",
        hints: [],
        actionLabel: "Reuse eligible calculations and component work",
        success:
          "Server data, streamed HTML, client interaction, and compiler optimizations each have a place.",
      },
      {
        id: "rsc-pattern",
        kind: "choice",
        concept: [
          "An async Server Component can await data directly during server execution.",
          "Its server-only code stays out of the client JavaScript bundle, while interactive client components still ship to the browser.",
        ],
        question: "Which pattern fetches data in a Server Component?",
        description:
          "Choose the pattern that runs the data request on the server.",
        choices: [
          { value: "effect", label: "Browser: useEffect" },
          {
            value: "server",
            label: "Server: async + await",
          },
          { value: "event", label: "Browser: click handler" },
        ],
        correctChoice: "server",
        hints: [
          "Effects and browser click handlers are client patterns; look for server execution.",
          "Choose the async Server Component that awaits its data.",
        ],
        success:
          "The server component awaits data on the server and returns UI; client components handle interaction.",
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
