# Syntax Lab

**JS to React: Step-by-Step**, inside Syntax Lab. A compact 16-card learning deck built with React 19, TypeScript, Vite, and Tailwind CSS.

## Run on your computer

1. Install **Node.js 22 or newer** from https://nodejs.org (npm is included).
2. Extract the download and open a terminal in the `syntax-lab` folder — the one containing `package.json`.
3. Install dependencies:
   ```sh
   npm install
   ```
4. Start the website:
   ```sh
   npm run dev
   ```
5. Open **http://localhost:5173** in your browser. If that port is occupied, Vite prints the alternative address in your terminal.

Keep the terminal open while using the website. Press **Ctrl+C** to stop. Next time, only run `npm run dev` from this folder. No cloud environment, publishing, API keys, or accounts are needed.

## The v3 concept deck

The default experience shows **one centered card** at a time, with a short explanation, code on the left, and a working visual example on the right (stacked on phones). Code examples stay under ten source lines. The snippets are read-only and update through the lesson controls; they are not an unrestricted JavaScript editor. Use Previous / Next or the optional lesson list. Help stays hidden until requested. Dark mode is the default; light mode is available.

**JavaScript foundations (cards 1–11):** functions and arrows; object/array destructuring; rest/spread; template literals; map; filter; flatMap/reduce; ternary/AND; purity/immutability; async/await; imports/exports.

**Core React (cards 12–16):** composition and JSX; stable list keys; reactive state and search; UI library vs. framework rendering; web vs. native rendering.

Async examples use local simulated requests, including a failure mode. Framework streaming/Suspense and native platforms are **educational models**, not a connected backend or native runtime. The keys example uses real React component state: editing a note then reordering demonstrates how index keys can associate that state with the wrong item.

Deck position, explored cards, and theme are saved under `syntax-lab-deck-v3`. Individual deck demo controls reset when you leave their card. No account or remote code service is required.

## The retained detailed .map() lab

Open **“Open detailed .map() walkthrough”** on card 5 to enter the original focused lab. **Back to card deck** returns to the same deck position.


One activity at a time, with **Step 1 of 7** at the top and **Back / Next** at the bottom:

1. **See the transformation:** run a visual `.map()` demonstration. Choose UX process cards or Dead by Daylight perks.
2. **Meet the callback parameter:** select an array item, rename the parameter, and inspect the highlighted syntax.
3. **Follow the data:** Next advances one receive → return → collect moment. Nine moments trace all three items. Back reverses execution; auto-play, pause, and reset are available.
4. **Change the input:** edit the labels and see the output and interface update immediately.
5. **Predict the result:** write an array and check it before continuing.
6. **Make one small change:** edit only the return expression to uppercase the labels, with live output.
7. **Write your own callback:** create numbered navigation labels, with optional progressive hints and a worked solution.

Extra explanations stay behind **I'm confused**. The sidebar collapses and nests lessons under JavaScript, React, and TypeScript. Additional topics in the original lab sidebar are labeled **Later**; the v3 deck now includes core React cards; the **Progress** page revisits individual steps. The dashboard contains one lesson rather than course statistics.

### Saved progress

The existing `syntax-lab-v1` localStorage key is retained. Previous four-section progress is migrated to the seven-step walkthrough without losing answers, draft code, hints, examples, or completion history. The new code-edit step is initially uncompleted. Execution position, current step, parameter name, sidebar preference, and edits also persist. Help stays closed when you enter a step. When revising a completed exercise, Next validates your current answer while preserving your completion history. Reduced-motion preferences also apply to navigation.

Data is stored in this browser on this device, without account sync. Clearing site data clears progress. Use the same server address and port when returning. If browser storage is unavailable, a saving warning appears and the current session still works. Your data is never uploaded.

## Practice runner

The code challenge uses `@babel/parser` and a small AST interpreter. It **does not eval arbitrary JavaScript**. Supported syntax: one `cards.map()` arrow callback, one or two named parameters, an expression body or one `return` statement, object property reads (`label`, `id`, `category`), strings, numbers, template literals, `+`, and `toUpperCase()` / `toLowerCase()`. Unsupported syntax produces specific feedback. Imports, loops, global access, and general scripting are outside this first lesson's scope.

## Validate

```sh
npm test          # 48 checks for the deck, examples, runner, guided lab, and progress
npm run build    # TypeScript check and production bundle in dist/
npm run preview  # Serve the production bundle locally
```

The site uses system fonts and local packages. Once dependencies are installed, the lesson does not need an external preview service or font service. The production build is a static site; deploy the contents of `dist/` to a static host if desired.

## Deploy to Vercel

Import `maxdahal/react-learn` into Vercel from GitHub, with `master` as the production branch and the repository root as the root directory. `vercel.json` configures Vite, installs with `npm ci`, builds with `npm run build`, and publishes `dist/`. This is a client-only static app and needs no application environment variables or API credentials.

For a CLI deployment after signing into your own Vercel account:

```sh
npx vercel login
npx vercel --prod
```

Deployment credentials are only for publishing the app; never put them in source code or `VITE_*` variables. Hosted browser progress starts separately from localhost because localStorage is scoped to each site origin.
