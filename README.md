# React & JS Fog Survival · v6

A Dead by Daylight–inspired JavaScript and React learning mini-game. Repair **16 generators**—one concept per screen—to power the Exit Gates and escape the Fog.

## Run locally

Requires Node.js 22 or newer (npm included).

```sh
npm install
npm run dev
```

Open the address Vite prints, normally **http://localhost:5173**. Keep the terminal open; Ctrl+C stops it. The first start builds the local React preview runtime. No API key, backend, account, game connection, or cloud deployment is required.

## One generator, one concept

Every generator has two guided stages:

1. **Field drill:** interact with a survivor-themed visual example to restore the first 50%.
2. **Repair blueprint:** edit real React/JavaScript in Monaco. Syntax and live-rendered behavior are both checked, restoring blueprint progress to 75%. Complete a **skill check** to reach 100% and restore power.

Timed checks use the marked dial sector. Press **Space** or **Hit** to stop the needle; the gold center earns a perfect check with a spark effect. A miss loses no code or repair progress. **Assist · no timing** provides an untimed check for the same generator credit and is enabled by default when the device requests reduced motion.

The Exit Gates unlock only after all **16 verified generators** are repaired. Hold the final switch, wait for the gate timer, and escape. Repairs survive reloads and experiments; reviewing or changing an already completed blueprint does not remove earned power. New repairs still require verified code and a successful check.

Previous/Next and **Left/Right Arrow** shortcuts navigate outside editable controls. The generator index lets you revisit any topic. Hints reveal progressively, and worked solutions are hidden behind an explicit choice. A previous callback-practice lab remains accessible from the index.

## Curriculum through the Fog

**Generators 1–11 · JavaScript survivor prerequisites:** survivor actions/functions; perk-loadout destructuring; inventory spread; survivor-ID template literals; four-survivor map rendering; injured-teammate filtering; flat chest loot; health ternaries; immutable game state; async exit-gate timers; modular perk imports/exports.

**Generators 12–16 · Core React:** composing PerkIcon and HealthBar into SurvivorHUD; stable survivor keys and local note state; a functional-updater repair meter; Client HUD vs. Entity-server/Suspense architecture; Web DOM vs. iOS/Android native-view models.

React code, local state, list identity, imports, and client Suspense execute as real React. The Entity server and native views are clearly labeled **educational models**, not a live game server or a React Native runtime. The generator 10 gate timer is a practice drill; it does not bypass the trial's final exit condition.

## Audio and accessibility

Every generator has English (`en-US`) and Nepali (`ne-NP`) concept, field-drill, and code-mission narration. Play, Pause/Resume, Replay, 0.8x/1.0x/1.25x speed, and optional auto-play use the browser **Web Speech API**. Changing topic or language cancels stale speech.

A matching voice must be installed and exposed by the browser/OS. If no Nepali voice is available, Play is disabled with an explanation, and the Nepali transcript remains readable. English is never substituted for Nepali. Browser auto-play restrictions may require a Play click. Speech availability and any network behavior of system voices are controlled by the device, not a custom app speech service.

**SFX are off by default.** Enable the SFX switch to hear short, quiet Web Audio cues on successful, perfect, missed, or final-exit checks. There is no automatic heartbeat soundtrack. Fog, sparks, and gate transitions respect reduced-motion preferences. The danger indicator is atmospheric only; there is no punishment timer.

## Local code sandbox

Monaco and its worker are loaded locally on entering a blueprint. `npm run build:sandbox` generates the Git-ignored `public/lesson-runtime.js`, then Vite copies it into `dist/`. React and Babel run in an iframe with **`sandbox="allow-scripts"` and no same-origin permission**. Learner code cannot access the parent document. Preview messages are tied to the expected frame, channel, source revision, and run ID. A CSP blocks connections/forms and limits resources; loop/function guards catch accidental runaway examples. This is a learning sandbox, not an adversarial-code hosting service.

The runner supports React and provided local fixture modules. Imports, syntax errors, and runtime errors produce feedback. A completed generator remains earned even if a later experiment breaks its preview.

## Saved trial and previous work

Progress is stored only in this browser on this device:

- `fog-survival-deck-v6`: current generator and display preference.
- `fog-survival-missions-v6`: drill/blueprint completion, selected stage, code files, and hints.
- `fog-survival-trial-v6`: verified repairs, perfect checks, exit status, Assist and SFX settings.
- `deep-dive-audio-v5`: retained narration language, speed, and auto-play preferences.

The v6 survivor blueprints differ from v5, so the new trial starts fresh. Existing `syntax-lab-deck-v3`, `deep-dive-missions-v5`, and `syntax-lab-v1` work is left untouched; old completion is never counted as a repaired v6 generator. Visual-demo controls reset when leaving their topic, while code drafts and repair history persist.

Clearing site data clears saved work. Localhost and hosted sites use separate storage, so return to the same address/port. If storage is unavailable, the session remains usable and shows a saving warning.

## Validate

```sh
npm test          # 70 checks: drills, blueprints, audio, repair integrity, skill timing, gates, and legacy practice
npm run build    # TypeScript + isolated runtime + production bundle
npm run preview  # Serve dist/ locally
```

Browser checks cover all 16 field drills, edited Monaco solutions, misses and assisted checks, restored repair history, the complete exit sequence, and mobile/Nepali presentation. Timed scoring, perfect checks, and optional audio cues also have focused tests. Actual spoken narration still depends on installed voices.

The repository remains `maxdahal/react-learn`. The existing Vercel configuration builds and publishes `dist/`; no deployment credentials are needed to run locally.
