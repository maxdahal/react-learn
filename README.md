# React & JS Zen Fog · Master v2

A calm JavaScript-to-React learning app built from the master v2 curriculum. Repair **16 Zen Generators** through **27 focused micro-missions**, with exactly one card and one code field or action visible at a time.

## Run on your computer

Install [Node.js 22 or newer](https://nodejs.org), open a terminal in this folder, and run:

```sh
npm install
npm run dev
```

Open the address printed in the terminal, usually **http://localhost:5173**. Keep the terminal running; **Ctrl+C** stops the server. Vite refreshes the page when you edit the source. For an exact lockfile install, use `npm ci` instead of `npm install`.

## Learning at your pace

- Read the **Tip & concept** first: every card explains the idea in 2–3 short sentences before the question.
- Complete the code scaffold, then press **Enter** or **Next** to check it. The first blank is selected for you; long answers wrap inside the single field. Shift+Enter inserts a line break.
- A correct answer stays visible with a short explanation, a mint progress meter, a subtle spark, and a quiet completion chime. Choose Next when you're ready to move on.
- A typo reveals a gentle mint hint beneath the input. Another try reveals a more specific hint. There are no penalties, failure sounds, clocks, or countdowns.
- The top-corner **lesson menu** stays hidden until requested. Its Zen Drawer links to either phase and all 27 missions, including unfinished ones. Escape, the close button, or the backdrop closes it; keyboard focus stays inside while it is open.
- **Back** revisits the previous mission, including across generator boundaries. Completed code is read-only during review; unfinished drafts remain editable and saved.
- Generator 13 includes a real React state meter: each event runs a functional state update and adds 25. Partial repairs survive reloads.
- The Exit Gate opens after all 27 missions across all 16 generators are complete. Reviewing afterward keeps your earned progress.

The slate/mint interface uses 28px bold headings, 20px instructional text, and 22px monospace code. Cards fade softly, and animations respect reduced-motion preferences. The learning screen has no sidebars, editor panes, dashboards, or quick-time events. Opening the drawer pauses background narration and keeps the lesson in place. New cards return to the top so their concept tips appear first.

## Curriculum

| Generator | Focus |
| --- | --- |
| 1 | Standard functions to arrow functions: `const Repair = () => {}` |
| 2 | Unpack `perkName` from props; array destructuring of a state pair |
| 3 | Spread copies an inventory; rest gathers arguments |
| 4 | Template literals for a dynamic survivor tag |
| 5 | Map survivor objects into `<li>{s.name}</li>`; understand the callback parameter |
| 6 | Filter the injured teammates |
| 7 | Flatten chest loot with flatMap; count with reduce; locate one item with find |
| 8 | Choose a label with a ternary; conditionally include a badge with && |
| 9 | A pure immutable update that returns a new survivor object |
| 10 | Named imports, async/await, and default exports |
| 11 | Combine Thumbnail and LikeButton inside VideoList |
| 12 | Stable data IDs as list keys |
| 13 | Declare `[progress, setProgress]`; explore a live event-driven repair meter |
| 14 | React's view layer, full-stack frameworks, and a BloodwebSpinner fallback |
| 15 | Web DOM versus React Native/Expo primitives |
| 16 | Client entries, streaming, React Compiler, and an RSC data-fetching pattern choice |

This is a Vite/React app with checked learning snippets. It teaches full-stack architecture; it does not run a Next.js server, React Server Components, the React Compiler, or a native renderer inside the browser. The Web/Native switch compares syntax. Suspense covers supported loading; it does not fetch data by itself. The streaming exercise uses the Node server API `renderToPipeableStream`. A compatible framework/runtime is needed to run those snippets in a real project.

## Calm English narration

Every card, including completion, has one speaker control that cycles through **Play, Pause, Resume, and Replay**. Native Web Speech narration uses `en-US` at **0.85x** and reads the concept tip first, followed by the question and task. Changing cards or opening the drawer cancels old narration; it never auto-plays.

An English voice must be available from the browser/OS. If it is unavailable, a quiet note explains this when you click the speaker; written guidance always works. Click again later if browser voices are still loading. No non-English voice is substituted. Actual spoken output depends on your device.

A short, low-volume Web Audio chime accompanies newly completed missions. The header's **Sound on/off** control mutes these cues and saves the preference. It does not mute narration you explicitly request. Nothing plays just from loading the page.

## Saved work

`zen-fog-master-v2` in localStorage stores your generator, mission, drafts, completed missions, partial repair meter, platform comparison, and sound preference. Return to the same browser and address to resume. Localhost and hosted sites have separate storage. If storage is disabled, the lesson remains usable and the saving note explains the limitation.

On the first v2 visit, compatible `zen-fog-master-v1` drafts, completed missions, partial repairs, position, and preferences carry forward automatically. Six changed exercises (arrow functions, props, map, composition, state declaration, and Suspense) start with their new scaffolds and checks; their original answers remain in the old save. The new find and RSC missions also need completion. Once a v2 save exists, it takes precedence. Earlier `zen-fog-progress-v7`, Fog Survival, and Syntax Lab keys remain untouched. Historical lesson/game source and regression tests also remain in the repository; old editors, sandbox assets, timers, and game effects are excluded from the active production app. Vite serves only `public-zen/`.

## Source guide

| File | Purpose |
| --- | --- |
| `src/ZenApp.tsx` | Single-card navigation, keyboard input, live state meter, and saving |
| `src/zenLessons.ts` | All 16 generators, 27 missions, and their concept tips |
| `src/zenValidation.ts` | Babel syntax-tree checks; submitted code is never executed |
| `src/zenProgress.ts` | Defensive progress loading and mission navigation |
| `src/ZenDrawer.tsx` | Hidden phase/mission navigation, modal focus handling, and dismissal |
| `src/ZenSpeech.tsx` | Single-control English narration |
| `src/useZenChime.ts` | Optional quiet completion tones |
| `src/zen.css` | Large typography, mint/slate theme, and responsive layout |

The stack is React, TypeScript, Vite, Tailwind CSS, Lucide, and Framer Motion. The syntax checker loads on first submission to keep the initial screen light. No API key, account, or learning-service backend is required to run locally.

## Validation

```sh
npm test          # 145 tests, including retained historical regression checks
npm run build    # TypeScript and production bundle
npm run preview  # Serve the production app locally
```

Tests cover every drawer destination, concept-before-question ordering, compatible progress migration, the RSC pattern choice, all code missions and common misconceptions, Enter submission, Back, held success feedback, progressive hints, partial repair persistence, exit integrity, audio pause/resume/replay, sound muting, missing voices, and malformed or unavailable storage.

Chromium checks cover the complete 27-mission production flow, all 16 generators, drawer focus trapping/Escape/backdrop/phase jumps, reloads, Web/Native comparison, keyboard operation, the requested font sizes, and every mission at widths 320/390/768/1440px. Speech controls use deterministic browser mocks; the quiet success tones use real Web Audio. The old editor/game assets are not requested, and the walkthrough produces no browser errors. Automated axe checks report zero WCAG A/AA violations across code, live state, native comparison, compiler, RSC selection, completion, and the mobile drawer; these checks complement the manual layout review.

The existing Vercel configuration uses `npm ci`, `npm run build`, and `dist/`; no new environment variables are needed.
