export type Language = "en-US" | "ne-NP";
export type Script = { concept: string; explore: string; challenge: string };
export const narration: Record<Language, Script[]> = {
  "en-US": [
    {
      concept:
        "Functions take inputs and return results. React components are functions that describe an interface.",
      explore: "Switch to arrow syntax and enter your own name.",
      challenge:
        "Convert Greeting to an arrow function and keep the same greeting.",
    },
    {
      concept:
        "Destructuring unpacks object properties or array positions into local names.",
      explore:
        "Compare direct access with destructuring, then leave the object in destructured mode.",
      challenge:
        "Destructure name in the Profile parameter and use that local name in the heading.",
    },
    {
      concept:
        "Spread copies values into a fresh container. Rest collects remaining values into a local variable.",
      explore:
        "Add Test to a new array using Create copy and check that the original is unchanged.",
      challenge:
        "Build next with spread and newItem while keeping the original array unchanged.",
    },
    {
      concept:
        "Template literals insert expression values into a string using backticks and dollar braces.",
      explore:
        "Change the user ID and switch isActive off to inspect both strings.",
      challenge:
        "Use a template literal to create the dynamic label item dash seven.",
    },
    {
      concept:
        "Map calls a callback for each array item and gathers its return values into a new array.",
      explore:
        "Add a new label and click its row to inspect the callback parameter.",
      challenge: "Map every string into a list element with a stable key.",
    },
    {
      concept:
        "Filter keeps items whose callback returns true. It leaves the original array unchanged.",
      explore: "Search for prototype to keep just one matching task.",
      challenge:
        "Use the search state inside a filter so the initial result contains only Design.",
    },
    {
      concept:
        "Flat map maps values and flattens one level. Reduce can accumulate those same values into one array.",
      explore:
        "Switch to reduce and include Ship to build a five-item flat list.",
      challenge:
        "Flatten the category products into one array using flat map or reduce.",
    },
    {
      concept:
        "A ternary chooses between two results. Logical AND can conditionally include a piece of UI.",
      explore:
        "Turn on both isLoggedIn and hasError to see the branches together.",
      challenge: "Use loggedIn in a ternary that chooses Dashboard or Login.",
    },
    {
      concept:
        "Pure transformations keep their input unchanged. React state needs fresh references when you update objects or arrays.",
      explore:
        "Run push to inspect the mutation, then run Spread to preserve the input.",
      challenge:
        "Remove push and create a new array while the original length remains two.",
    },
    {
      concept:
        "Async functions return promises. Await waits inside a function without blocking the rest of the interface.",
      explore:
        "Fetch data, click the counter while it loads, and wait for the result.",
      challenge:
        "Await fakeFetch into a data variable, return data, and click Fetch in the preview.",
    },
    {
      concept: "Modules connect files with matching exports and imports.",
      explore: "Choose Named exports and inspect Button dot JSX.",
      challenge: "Fix the import in App to match the default export in Button.",
    },
    {
      concept: "JSX composes independent components into a larger interface.",
      explore:
        "Remove a component and then include both Thumbnail and LikeButton again.",
      challenge: "Nest Thumbnail and LikeButton inside VideoList.",
    },
    {
      concept: "Stable keys preserve item identity when a list changes order.",
      explore:
        "Use stable IDs, edit a note, and move the first item to the end.",
      challenge:
        "Use item dot id as the Row key, then reorder the preview list.",
    },
    {
      concept:
        "State gives a component memory. A setter queues a new render with an updated snapshot.",
      explore:
        "Search for state so the video list renders one matching result.",
      challenge:
        "Connect the button to the setter, then click it to change Inactive to Active.",
    },
    {
      concept:
        "React describes UI. Frameworks coordinate routing and server rendering; Suspense displays fallbacks while content waits.",
      explore:
        "Choose Server plus Suspense, run a request, and save the loaded talk.",
      challenge:
        "Wrap Talks in a real client Suspense boundary with a loading fallback.",
    },
    {
      concept:
        "React DOM renders HTML. React Native uses native platform views, with Expo providing tools and APIs.",
      explore:
        "Switch to iOS or Android and press Explore in the modeled phone.",
      challenge: "Use the modeled View and Text primitives instead of a div.",
    },
  ],
  "ne-NP": [
    {
      concept:
        "फङ्सनले इनपुट लिन्छ र नतिजा फर्काउँछ। रियाक्ट कम्पोनेन्ट पनि इन्टरफेसको वर्णन गर्ने फङ्सन हो।",
      explore: "एरो सिन्ट्याक्स छान्नुहोस् र आफ्नो नाम लेख्नुहोस्।",
      challenge:
        "Greeting लाई एरो फङ्सनमा बदल्नुहोस्, तर अभिवादन उस्तै राख्नुहोस्।",
    },
    {
      concept:
        "डिस्ट्रक्चरिङले अब्जेक्टको प्रोपर्टी वा एरेको स्थानबाट मान निकालेर स्थानीय नाम दिन्छ।",
      explore:
        "Direct access र Destructure तुलना गर्नुहोस्, अनि Object लाई Destructure मोडमा राख्नुहोस्।",
      challenge:
        "Profile को प्यारामिटरमा name निकाल्नुहोस् र शीर्षकमा त्यही स्थानीय नाम प्रयोग गर्नुहोस्।",
    },
    {
      concept:
        "स्प्रेडले नयाँ एरे वा अब्जेक्टमा मानहरू प्रतिलिपि गर्छ। रेस्टले बाँकी मानहरू एउटा नयाँ भेरिएबलमा सङ्कलन गर्छ।",
      explore:
        "Create copy थिचेर नयाँ एरेमा Test थप्नुहोस् र पुरानो एरे नबदलिएको हेर्नुहोस्।",
      challenge:
        "स्प्रेड र newItem प्रयोग गरेर next बनाउनुहोस्। पुरानो एरे उस्तै रहनुपर्छ।",
    },
    {
      concept:
        "टेम्प्लेट लिटरलले ब्याकटिक र डलरकोष्ठकभित्रको एक्सप्रेसन प्रयोग गरेर स्ट्रिङमा मान जोड्छ।",
      explore:
        "User ID बदल्नुहोस् र isActive बन्द गरेर दुवै स्ट्रिङ हेर्नुहोस्।",
      challenge:
        "टेम्प्लेट लिटरल प्रयोग गरेर item-7 भन्ने गतिशील label बनाउनुहोस्।",
    },
    {
      concept:
        "म्यापले एरेको हरेक आइटममा क्यालब्याक चलाउँछ र फर्किएका मानहरू नयाँ एरेमा राख्छ।",
      explore:
        "नयाँ label थप्नुहोस् र त्यसको पङ्क्ति थिचेर क्यालब्याकको प्यारामिटर हेर्नुहोस्।",
      challenge:
        "हरेक स्ट्रिङलाई स्थिर key भएको li एलिमेन्टमा म्याप गर्नुहोस्।",
    },
    {
      concept:
        "फिल्टरले क्यालब्याकबाट true आउने आइटम मात्र राख्छ। पुरानो एरे बदलिँदैन।",
      explore: "prototype खोजेर एउटा मात्र मिल्ने काम देखाउनुहोस्।",
      challenge:
        "फिल्टरमा search स्टेट प्रयोग गर्नुहोस् ताकि सुरुमा Design मात्र देखियोस्।",
    },
    {
      concept:
        "फ्ल्याटम्यापले म्याप गरेपछि एक तहको एरे खोल्छ। रिड्युसले पनि मानहरू जम्मा गरेर एउटा एरे बनाउन सक्छ।",
      explore:
        "reduce छान्नुहोस् र Ship समावेश गरेर पाँचवटा आइटमको सूची बनाउनुहोस्।",
      challenge:
        "flatMap वा reduce प्रयोग गरेर category का products लाई एउटै एरेमा राख्नुहोस्।",
    },
    {
      concept:
        "टर्नरीले दुई नतिजामध्ये एउटा छान्छ। लजिकल एन्डले सर्त पूरा हुँदा मात्र इन्टरफेसको भाग देखाउन सक्छ।",
      explore: "isLoggedIn र hasError दुवै खोल्नुहोस् र दुवै शाखा हेर्नुहोस्।",
      challenge:
        "loggedIn को टर्नरी प्रयोग गरेर Dashboard वा Login छान्नुहोस्।",
    },
    {
      concept:
        "शुद्ध रूपान्तरणले इनपुट बदल्दैन। रियाक्ट स्टेटमा अब्जेक्ट वा एरे बदल्दा नयाँ रेफरेन्स बनाउनु आवश्यक हुन्छ।",
      explore:
        "पहिले push चलाएर परिवर्तन हेर्नुहोस्। त्यसपछि Spread चलाएर पुरानो इनपुट जोगाउनुहोस्।",
      challenge:
        "push हटाएर नयाँ एरे बनाउनुहोस्। पुरानो एरेमा दुईवटा आइटम नै रहनुपर्छ।",
    },
    {
      concept:
        "एसिङ्क फङ्सनले प्रमिस फर्काउँछ। await ले त्यही फङ्सनभित्र पर्खन्छ, तर अरू इन्टरफेस रोकिँदैन।",
      explore:
        "डेटा माग्नुहोस्, लोड हुँदा काउन्टर थिच्नुहोस्, अनि नतिजा पर्खनुहोस्।",
      challenge:
        "fakeFetch को नतिजा await गरेर data मा राख्नुहोस्, data फर्काउनुहोस्, अनि प्रिभ्युमा Fetch थिच्नुहोस्।",
    },
    {
      concept: "मोड्युलले मिल्ने export र import मार्फत फरक फाइलहरू जोड्छ।",
      explore: "Named छान्नुहोस् र Button.jsx फाइल हेर्नुहोस्।",
      challenge:
        "Button को default export सँग मिल्ने गरी App को import सच्याउनुहोस्।",
    },
    {
      concept:
        "जेएसएक्सले साना स्वतन्त्र कम्पोनेन्टहरू जोडेर ठूलो इन्टरफेस बनाउँछ।",
      explore:
        "एउटा कम्पोनेन्ट हटाउनुहोस्, अनि Thumbnail र LikeButton दुवै फेरि समावेश गर्नुहोस्।",
      challenge: "VideoList भित्र Thumbnail र LikeButton राख्नुहोस्।",
    },
    {
      concept: "स्थिर key ले सूचीको क्रम बदलिँदा पनि आइटमको पहिचान जोगाउँछ।",
      explore:
        "Stable IDs छान्नुहोस्, एउटा नोट बदल्नुहोस्, अनि पहिलो आइटम अन्त्यमा सार्नुहोस्।",
      challenge:
        "Row को key मा item.id राख्नुहोस्, अनि प्रिभ्युको सूचीको क्रम बदल्नुहोस्।",
    },
    {
      concept:
        "स्टेटले कम्पोनेन्टलाई सम्झना दिन्छ। सेटरले नयाँ मानसहित फेरि रेन्डर गर्न अनुरोध गर्छ।",
      explore: "state खोजेर एउटा मात्र मिल्ने भिडियो देखाउनुहोस्।",
      challenge:
        "बटनलाई सेटरसँग जोड्नुहोस् र थिच्दा Inactive बाट Active बनाउनुहोस्।",
    },
    {
      concept:
        "रियाक्टले इन्टरफेसको वर्णन गर्छ। फ्रेमवर्कले राउटिङ र सर्भर रेन्डरिङ मिलाउँछ, अनि Suspense ले पर्खँदा फल्ब्याक देखाउँछ।",
      explore:
        "Server + Suspense छान्नुहोस्, अनुरोध चलाउनुहोस् र लोड भएको टक सेभ गर्नुहोस्।",
      challenge:
        "Talks लाई लोडिङ फल्ब्याक भएको वास्तविक क्लाइन्ट Suspense भित्र राख्नुहोस्।",
    },
    {
      concept:
        "रियाक्ट डोमले एचटीएमएल रेन्डर गर्छ। रियाक्ट नेटिभले प्लेटफर्मका नेटिभ भ्यु प्रयोग गर्छ, र Expo ले उपकरण र एपीआई दिन्छ।",
      explore: "iOS वा Android छान्नुहोस् र नमुना फोनमा Explore थिच्नुहोस्।",
      challenge: "div को सट्टा नमुनाका View र Text प्रयोग गर्नुहोस्।",
    },
  ],
};
