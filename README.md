# React & JS Deep Dive · v5

A single-topic guided learning app with **16 cards, 32 checked micro-missions, local Monaco code editing, live React previews, and English/Nepali browser narration**. Built with React, TypeScript, Vite, Tailwind CSS, Framer Motion, and Lucide.

## Run locally

Requires Node.js 22 or newer (npm included).

```sh
npm install
npm run dev
```

Open the address Vite prints, normally **http://localhost:5173**. Keep the terminal open and press Ctrl+C to stop. The first start bundles the local preview runtime; no remote code editor, CDN, account, API key, or server is required.

## The learning flow

Each card has two steps: **Explore** a working visual example, then **Code** a guided change in Monaco. The Next control unlocks when the exploration or code mission actually succeeds. Completion checks combine parsed syntax and the rendered result, including clicks inside the preview where relevant. Hints reveal progressively; a worked solution is an explicit choice after three hints.

Cards 1–11 cover functions/arrows, destructuring, rest/spread, template literals, map, filter, flatMap/reduce, conditionals, immutability, async/await, and modules. Cards 12–16 cover JSX composition, stable keys, state updates, framework/Suspense architecture, and web/native rendering.

Previous/Next and **Left/Right Arrow** shortcuts move between tasks and cards. Shortcuts leave editor, input, checkbox, and selector keys alone. The optional lesson list lets you revisit any topic. Progress tracks checked tasks and earns first-mission, JavaScript-foundations, and React-foundations badges. Dark/light mode and reduced-motion preferences are supported.

## Narration: English and नेपाली

Every card and task has an English (`en-US`) and Nepali (`ne-NP`) narration script in `src/narration.ts`. Play, Pause/Resume, Replay, 0.8x/1.0x/1.25x speed, and optional auto-play use the browser's **Web Speech API**, not a remote speech provider. Moving to another task or changing language stops stale speech.

**A matching voice must be installed and exposed by the browser/OS.** Nepali voices are not available on every device. When a matching voice or speech support is missing, Play is disabled, an explanation is shown, and the script remains readable. The app does not substitute English for a missing Nepali voice. A browser may require a Play click before permitting auto-play. Depending on the voice implementation, the browser/OS may use a network speech service; the app itself sends no narration to a custom API.

## Local code execution

Monaco and its editor worker are bundled locally and loaded only when entering a code task. `npm run build:sandbox` bundles React and Babel into `public/lesson-runtime.js`, which is generated and Git-ignored. It runs in an iframe with **`sandbox="allow-scripts"` and no same-origin permission**. Learner code runs in that frame, never in the parent app. Messages are tied to the frame, channel, source revision, and run ID. A preview CSP blocks connections/forms and limits resources. Loop/function budget guards help catch accidental runaway code; this is a learning sandbox, not an adversarial-code hosting service.

The runner compiles JSX and imports React or provided local fixtures. Unsupported imports and syntax/runtime errors appear as feedback. Code, module-import fixes, local state, and client Suspense run as real React. The server/streaming architecture and native views remain explicitly labeled educational models: there is no Next.js backend, database, mobile OS, or actual React Native renderer. Card 15's code mission uses **real client Suspense**, distinct from its server timing model.

## Saved work and compatibility

Data stays in localStorage in this browser, on this device:

- `syntax-lab-deck-v3`: existing deck position/theme and previous exploration history.
- `deep-dive-missions-v5`: each task's completion, selected task, code files, and hints.
- `deep-dive-audio-v5`: narration language, speed, and auto-play preference.
- `syntax-lab-v1`: the original detailed .map() lab's answers, code, and progress, preserved and still accessible from card 5.

Old explored cards do not automatically earn new coding achievements. Individual visual-demo controls reset when you leave a card; code drafts and completed tasks persist. Clearing site data clears saved work. Localhost and a hosted site have separate browser storage; use the same address/port when returning. If storage is unavailable, the current session still works and displays a warning.

## Validate

```sh
npm test          # 63 unit and interaction checks
npm run build    # TypeScript, isolated runtime, then production app
npm run preview  # Serve dist/ locally
```

Browser validation also covers all 32 exploration/code tasks, edited Monaco solutions, preview clicks, saved drafts, keyboard navigation, mobile layout, and opaque-frame isolation. Web Speech API behavior is tested with controlled voices; actual audio availability depends on the device.

## GitHub and Vercel

Repository: `maxdahal/react-learn`, production branch `master`. `vercel.json` selects Vite, installs with `npm ci`, builds with `npm run build`, and publishes `dist/`. No application environment variables are required. GitHub updates may trigger an existing Vercel Git integration, but pushing source is not itself proof that a deployment succeeded.
