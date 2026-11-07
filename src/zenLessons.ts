export type ZenLanguage = "en-US" | "ne-NP";
export type ZenLesson = {
  topic: string;
  kind: "code" | "principle" | "platform";
  question: Record<ZenLanguage, string>;
  description: Record<ZenLanguage, string>;
  starter: string;
  context?: string;
  hints: Record<ZenLanguage, string[]>;
};
function lesson(
  topic: string,
  en: string,
  ne: string,
  description: string,
  neDescription: string,
  starter: string,
  hints: string[],
  neHints: string[],
  context?: string,
): ZenLesson {
  return {
    topic,
    kind: "code",
    question: { "en-US": en, "ne-NP": ne },
    description: { "en-US": description, "ne-NP": neDescription },
    starter,
    context,
    hints: { "en-US": hints, "ne-NP": neHints },
  };
}
export const zenLessons: ZenLesson[] = [
  lesson(
    "Arrow functions",
    "Give run an arrow function.",
    "run लाई एरो फङ्सन दिनुहोस्।",
    "Keep the inputs empty and the body simple.",
    "प्यारामिटर खाली राख्नुहोस् र सानो बडी बनाउनुहोस्।",
    "const run = ",
    [
      "Place an arrow between the parentheses and the body.",
      "Try () => {} after const run =.",
    ],
    [
      "कोष्ठक र बडीको बीचमा एरो राख्नुहोस्।",
      "const run = पछि () => {} राखेर हेर्नुहोस्।",
    ],
    "function run() {}",
  ),
  lesson(
    "Object destructuring",
    "Unpack one perk.",
    "एउटा पर्क निकाल्नुहोस्।",
    "Take perk from this survivor’s loadout.",
    "यो सर्भाइभरको लोडआउटबाट perk निकाल्नुहोस्।",
    "const { _____ } = survivorLoadout;",
    [
      "The property’s name becomes your local variable.",
      "Replace the blank with perk.",
    ],
    [
      "प्रोपर्टीको नाम नै स्थानीय भेरिएबल बन्छ।",
      "खाली ठाउँमा perk राख्नुहोस्।",
    ],
    "{ perk: 'Self-Care', level: 3 }",
  ),
  lesson(
    "Spread",
    "Add a Medkit. Keep the inventory.",
    "इनभेन्टरी जोगाउँदै Medkit थप्नुहोस्।",
    "Copy prev into a new array before adding the item.",
    "सामान थप्नुअघि prev लाई नयाँ एरेमा प्रतिलिपि गर्नुहोस्।",
    "[..._____, 'Medkit']",
    [
      "The three dots spread the existing array.",
      'Use prev after the dots: [...prev, "Medkit"].',
    ],
    [
      "तीनवटा थोप्लाले पुरानो एरेका मानहरू फैलाउँछन्।",
      'थोप्लापछि prev राख्नुहोस्: [...prev, "Medkit"]।',
    ],
  ),
  lesson(
    "Template literals",
    "Give this survivor a dynamic tag.",
    "सर्भाइभरलाई गतिशील ट्याग दिनुहोस्।",
    "Combine survivor- and id using backticks.",
    "ब्याकटिक प्रयोग गरेर survivor- र id जोड्नुहोस्।",
    "",
    [
      "Backticks wrap the string; ${…} holds the variable.",
      "Try `survivor-${id}`.",
    ],
    [
      "स्ट्रिङलाई ब्याकटिकले घेर्नुहोस् र भेरिएबललाई ${…} भित्र राख्नुहोस्।",
      "`survivor-${id}` लेखेर हेर्नुहोस्।",
    ],
    "const id = 4;",
  ),
  lesson(
    "Mapping",
    "Make one list item for each survivor.",
    "हरेक सर्भाइभरको लागि एउटा सूची आइटम बनाउनुहोस्।",
    "Return an li containing the current name.",
    "हालको name भएको li फर्काउनुहोस्।",
    "survivors.map(name => _____)",
    [
      "The name parameter holds one survivor at a time.",
      "Try <li>{name}</li> in the blank.",
    ],
    [
      "name प्यारामिटरले एकपटकमा एउटा सर्भाइभरको नाम पाउँछ।",
      "खाली ठाउँमा <li>{name}</li> राख्नुहोस्।",
    ],
    "const survivors = ['Dwight', 'Meg'];",
  ),
  lesson(
    "Filtering",
    "Find the injured teammates.",
    "चोट लागेका साथीहरू छान्नुहोस्।",
    "Keep a survivor when isInjured is true.",
    "isInjured true भएको सर्भाइभरलाई मात्र राख्नुहोस्।",
    "survivors.filter(s => _____)",
    [
      "Read the injury property from the current parameter.",
      "Try s.isInjured in the blank.",
    ],
    [
      "हालको प्यारामिटरबाट चोटको प्रोपर्टी पढ्नुहोस्।",
      "खाली ठाउँमा s.isInjured राख्नुहोस्।",
    ],
  ),
  lesson(
    "Flattening",
    "Gather the chest loot into one array.",
    "चेस्टका सामान एउटै एरेमा जम्मा गर्नुहोस्।",
    "Use flatMap to collect each chest’s items.",
    "हरेक चेस्टका items जम्मा गर्न flatMap प्रयोग गर्नुहोस्।",
    "chests.flatMap(c => _____)",
    [
      "The callback should return the current chest’s items array.",
      "Try c.items in the blank.",
    ],
    [
      "क्यालब्याकले हालको चेस्टको items एरे फर्काउनुपर्छ।",
      "खाली ठाउँमा c.items राख्नुहोस्।",
    ],
  ),
  lesson(
    "Conditionals",
    "Choose a gentle health label.",
    "हेल्थको स्थिति छान्नुहोस्।",
    "Show Injured when isInjured is true; otherwise show Healthy.",
    "isInjured true हुँदा Injured, नभए Healthy देखाउनुहोस्।",
    "isInjured ? _____ : 'Healthy'",
    [
      "A ternary chooses between two values. The labels are strings.",
      'Put "Injured" in the blank, including its quotes.',
    ],
    [
      "टर्नरीले दुई मानमध्ये एउटा छान्छ। यहाँ लेबलहरू स्ट्रिङ हुन्।",
      'खाली ठाउँमा उद्धरणसहित "Injured" राख्नुहोस्।',
    ],
  ),
  {
    ...lesson(
      "Immutability",
      "How can React notice a state update?",
      "रियाक्टले स्टेटको अपडेट कसरी थाहा पाउँछ?",
      "Choose the principle behind an immutable object update.",
      "अब्जेक्टको अपरिवर्तनीय अपडेटको सिद्धान्त छान्नुहोस्।",
      "",
      [],
      [],
      "state.health = 0; // same object reference",
    ),
    kind: "principle",
  },
  lesson(
    "Async / await",
    "Wait for the gate’s promise.",
    "गेटको प्रमिस पूरा हुने समय पर्खनुहोस्।",
    "Complete the await line inside an async action.",
    "एसिङ्क कामभित्र await को लाइन पूरा गर्नुहोस्।",
    "await _____()",
    [
      "Call the function that opens the exit gate.",
      "Replace the blank with openExitGate.",
    ],
    [
      "एक्जिट गेट खोल्ने फङ्सनलाई कल गर्नुहोस्।",
      "खाली ठाउँमा openExitGate राख्नुहोस्।",
    ],
  ),
  lesson(
    "ES modules",
    "Share SurvivorHUD with another file.",
    "SurvivorHUD लाई अर्को फाइलसँग साझा गर्नुहोस्।",
    "Make it this module’s default export.",
    "यसलाई मोड्युलको default export बनाउनुहोस्।",
    "export default _____;",
    [
      "Export the component’s name, without calling it.",
      "Replace the blank with SurvivorHUD.",
    ],
    [
      "कम्पोनेन्टलाई कल नगरी त्यसको नाम export गर्नुहोस्।",
      "खाली ठाउँमा SurvivorHUD राख्नुहोस्।",
    ],
  ),
  lesson(
    "JSX composition",
    "Bring two small components together.",
    "दुईवटा साना कम्पोनेन्ट जोड्नुहोस्।",
    "Place Thumbnail and LikeButton inside VideoList.",
    "VideoList भित्र Thumbnail र LikeButton राख्नुहोस्।",
    "<VideoList>_____</VideoList>",
    [
      "Use capitalized JSX component tags.",
      "Try <Thumbnail /><LikeButton /> in the blank.",
    ],
    [
      "ठूलो अक्षरबाट सुरु हुने JSX ट्याग प्रयोग गर्नुहोस्।",
      "खाली ठाउँमा <Thumbnail /><LikeButton /> राख्नुहोस्।",
    ],
  ),
  lesson(
    "Stable keys",
    "Keep each survivor’s identity.",
    "हरेक सर्भाइभरको पहिचान जोगाउनुहोस्।",
    "Add a stable key to the mapped survivor element.",
    "म्याप गरिएको सर्भाइभर एलिमेन्टमा स्थिर key थप्नुहोस्।",
    "key={_____}",
    [
      "Use the survivor’s data ID rather than its position.",
      "Try survivor.id in the blank.",
    ],
    [
      "सूचीको स्थानको सट्टा सर्भाइभरको डेटा ID प्रयोग गर्नुहोस्।",
      "खाली ठाउँमा survivor.id राख्नुहोस्।",
    ],
  ),
  lesson(
    "React state",
    "Give the repair meter a memory.",
    "मर्मत मिटरलाई सम्झना दिनुहोस्।",
    "Start progress at the number 0 with useState.",
    "useState बाट progress को सुरुवात शून्य अङ्कमा गर्नुहोस्।",
    "const [progress, setProgress] = _____(0);",
    [
      "The hook returns a state value and its setter.",
      "Replace the blank with useState.",
    ],
    [
      "हुकले स्टेटको मान र त्यसको सेटर फर्काउँछ।",
      "खाली ठाउँमा useState राख्नुहोस्।",
    ],
  ),
  lesson(
    "Suspense & frameworks",
    "Wrap MatchStats with a Loading fallback.",
    "MatchStats लाई Loading फल्ब्याकले घेर्नुहोस्।",
    "React builds UI; frameworks such as Next.js support async server components.",
    "रियाक्टले UI बनाउँछ; Next.js जस्ता फ्रेमवर्कले एसिङ्क सर्भर कम्पोनेन्टलाई समर्थन गर्छन्।",
    "<Suspense fallback={_____}><MatchStats /></Suspense>",
    [
      "The fallback is JSX shown while supported content waits.",
      "Try <Loading /> in the blank.",
    ],
    [
      "समर्थित सामग्री पर्खँदा देखाइने फल्ब्याक JSX हो।",
      "खाली ठाउँमा <Loading /> राख्नुहोस्।",
    ],
  ),
  {
    ...lesson(
      "Web & native",
      "Same idea. A different renderer.",
      "एउटै सोच। फरक रेन्डरर।",
      "Compare Web and React Native building blocks (syntax only).",
      "Web र React Native का आधारभूत एलिमेन्टको सिन्ट्याक्स तुलना गर्नुहोस्।",
      "",
      ["Switch to Native once to see View instead of div."],
      ["div को सट्टा View हेर्न एकपटक Native छान्नुहोस्।"],
    ),
    kind: "platform",
  },
];
