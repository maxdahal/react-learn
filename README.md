# Zen Fog: React & JS Survival · v7

Learn JavaScript and React through 16 quiet, focused prompts. Each screen has one question, one code input or action, and a single primary button. Press **Enter** to continue.

## Run on your computer

Install [Node.js 22 or newer](https://nodejs.org), then open a terminal in this folder:

```sh
npm install
npm run dev
```

Open the address printed in the terminal, usually **http://localhost:5173**. Keep the terminal running while learning; **Ctrl+C** stops the server. You can edit the source in your own editor and Vite will refresh the page.

No account, API key, backend, or deployment is required. To reproduce the lockfile exactly, use `npm ci` instead of `npm install`.

## The learning flow

- Complete the small scaffold in the input. The first blank is selected for you.
- Press Enter or Continue. A correct answer gently fades into the next question.
- If you need another try, a short hint appears beneath the input. A second try reveals a more specific hint; mistakes never erase your draft or earned progress.
- Use Previous to revisit a question. Completed steps remain complete during review.
- At the last generator, switch between Web’s `<div />` and React Native’s `<View />`, then let the Fog clear.

Topics cover arrow functions, destructuring, spread, template literals, map/filter/flatMap, ternaries, immutability, await, default exports, JSX composition, stable keys, state, Suspense and frameworks, and Web/Native primitives.

The final Web/Native comparison demonstrates syntax; this Vite website does not run a native renderer or server components. Suspense guidance refers to supported data sources and frameworks such as Next.js.

## English and Nepali guidance

The **EN / NP** pill changes the question, description, hints, and controls. The single speaker beside the question reads its guidance using the browser’s native Web Speech API at a fixed **0.85** rate. Click again to stop; changing question or language cancels the previous narration. Audio never starts automatically.

Voices depend on your browser and operating system. If a matching voice is unavailable, a quiet message explains this when you request narration. Nepali is never silently read with an English voice. If browser voices are still loading, you can click the speaker again later. Written guidance always works.

## Saved work

`zen-fog-progress-v7` in localStorage stores your current question, code drafts, completed generators, language, and final comparison. Return to the same browser and address to resume. Localhost and hosted sites have separate storage; clearing site data clears progress. If browser storage is disabled, you can still use the current session and the saving note explains the limitation.

Earlier Syntax Lab/Fog keys remain untouched. V7 starts its own progress because its exercises differ from previous versions. Historical lesson, sandbox, and game source files remain in the repository, along with their regression tests. The active entry is now `src/ZenApp.tsx`; old editors, timers, game effects, and sandbox assets are excluded from the production app. Vite serves only `public-zen/`.

## Source guide

| File | Purpose |
| --- | --- |
| `src/ZenApp.tsx` | Single-card walkthrough, keyboard submission, navigation, saving |
| `src/zenLessons.ts` | All 16 English/Nepali questions, scaffolds, and hints |
| `src/zenValidation.ts` | Babel syntax-tree checks; submitted code is never executed |
| `src/zenProgress.ts` | Defensive loading of local progress |
| `src/ZenSpeech.tsx` | One-button browser narration |
| `src/zen.css` | Slate/sage theme, responsive spacing, reduced-motion support |

The stack is React, TypeScript, Vite, Tailwind CSS, and Framer Motion. The syntax checker loads on the first submission so it doesn’t delay the initial card.

## Validation

```sh
npm test          # 111 tests, including the retained earlier-version checks
npm run build    # TypeScript and production bundle
npm run preview  # Open the production app locally
```

V7 tests cover the full sixteen-step sequence, Enter submission, progressive hints, previous navigation, saved drafts, translated guidance, speech cancellation, unavailable voices, malformed storage, and code misconceptions. Chromium checks also cover the complete production walkthrough, completion/reload, mobile layouts at 320/390/768/1440px, and the absence of old editor/game assets and browser errors. Spoken audio itself depends on installed system voices.

The existing Vercel configuration uses `npm ci`, `npm run build`, and `dist/`. This update does not require new environment variables.
