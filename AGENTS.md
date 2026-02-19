<!-- AI agent instructions tailored for the YouTube Rewind & Fast Forward Buttons repo -->
# AI agent instructions

This repository is a TypeScript Chrome extension that injects content scripts into YouTube pages, provides an options UI, and ships Playwright E2E and Jest unit tests. Use these instructions to be productive quickly.

Keep guidance concise and actionable. If you change behavior that affects tests, update `e2e-tests/` and the Jest suites under `src/**/__tests__`.

Key locations and why they matter
- `src/` — extension implementation. Important subfolders:
  - `shared/` — shared types (`types.ts`). Used by content and options.
  - `content/` — injected scripts that interact with the YouTube player. Entry: `content.ts`. Subfolders: `buttons/` (buttons, helper), `player/` (handle-video-player, wait-for-player), `events/` (event-keys), `ui/` (tooltip, button-styles-sync). `selectors.ts` remains at root. Changes here affect runtime behavior and E2E tests.
    - `selectors.ts` — Centralized location for all YouTube DOM selectors. Use this to maintain consistency and avoid magic strings.
  - `background/` — service worker logic and feature flags (see `service-worker.ts`). Use this for cross-tab state and messaging.
    - `whats-new-page/` — changelog page shown automatically on extension updates. Includes HTML, CSS, TypeScript, tests, and test helpers.
  - `options/` — the options page implementation (`options-page.ts`, `options.html`) and CSS. This is the canonical source of user-settings handling.
  - `popup/` — popup implementation (`popup.html`, `popup.ts`, `popup.css`) that provides a button to open the options page.
  - `web-components/` — reusable UI pieces used by popup/options.
  - `icons/` — icon assets directory (PNG files and SVG) for extension icons.
- `manifest.json` — permission and entry points for content/background/pages. Keep schema changes minimal and document them in PRs.
- `scripts/` — developer utilities (e.g. `updateVersion.js`, `fix-pico-paths.mjs`, `zip-ext.js`). Use these for packaging and version bumps.
- `e2e-tests/` — Playwright integration specs. Update when changing UI flows or DOM selectors.

Important developer workflows (commands)
- Development watch: `npm run start` — cleans `dist/`, starts Parcel watch on `src/manifest.json`, and reapplies minor path fixes for development.
- Build for release: `npm run build` — creates production bundle and `dist.zip`.
- Quick zip: `npm run zip:ext` — regenerate distributable archive.
- Typecheck & lint: `npm run check`, `npm run eslint`, `npm run prettier`.
- Unit tests:
  - `npm run jest:test` or `npm run jest:test:coverage` (uses `jest.setup.js` to stub Chrome APIs via `jest-chrome`).
  - For a single file, run `npm run jest -- src/content/__tests__/your-file.test.ts --watchAll=false` (Jest accepts partial matches); combine with `-t "<name pattern>"` to target individual test cases. Note: `jest:test` runs with `--watchAll` for continuous testing; use `--no-coverage --watchAll=false` when running specific files to avoid waiting for watch mode to finish.
- Playwright:
  - `npm run playwright:test` — run E2E tests (see `playwright.config.ts`), tests live in `e2e-tests/`.
  - `npm run playwright:test:debug` — debug Playwright tests interactively.
  - `npm run playwright:report` — show Playwright test report.
  - `npm run playwright:codegen` — generate Playwright test code.
- Release workflow:
  - `npm run release` — standard version bump (follows conventional commits).
  - `npm run release:minor`, `npm run release:patch`, `npm run release:major` — version bump by type.
  - `npm run updateVersion` — update version script utility.

Project-specific patterns and conventions
- TypeScript-first: prefer explicit interfaces and enums. Shared types are in `types.d.ts` and `src/shared/types.ts`.
- Place shared interfaces first, then types, followed by module-level `const` declarations directly after imports and before any function bodies.
- File naming: kebab-case for files (e.g. `buttons.ts`), PascalCase for classes/components, camelCase for variables.
- Tests: colocate test helpers under `__utils__` and name specs `<feature>.spec.ts` or `<feature>.test.ts`.
- Chrome API stubbing: unit tests rely on `jest.setup.js` and `jest-chrome`. Do not import real chrome APIs in unit tests.
- Styling: shared CSS lives under `src/css/pico/` — `scripts/fix-pico-paths.mjs` is used during builds to repatch asset paths. If you update Pico or assets, update that script.
- **if statements:** always use curly brackets (no single-line bodies without braces).

  ```ts
  // BAD
  if (!video?.src) return null;

  // GOOD
  if (!video?.src) {
    return null;
  }
  ```

Integration and messaging
- Content scripts communicate with the background service worker via standard chrome.runtime messaging. Look for usages of `chrome.runtime.sendMessage` and `chrome.runtime.onMessage` across `content/` and `background/`.
- Options page persists settings that content scripts read; the `options-page.ts` and `content/buttons/helper.ts` are good starting points to trace the settings flow.

Examples of repository-specific intents
- When changing a selector used by the Playwright tests, update the tests under `e2e-tests/` and update any screenshots in `screenshots/`.
- When adding a manifest permission, document why in the PR and run the E2E tests — missing permissions will fail runtime scenarios.

Small rules for AI edits
- Keep changes minimal and scoped. Prefer updating or adding a single file unless a multi-file change is required.
- Run `npm run check` and `npm run jest:test` after code changes. If adding UI or DOM changes, remind the user to run Playwright tests or update `e2e-tests/` accordingly — do **not** run Playwright/E2E tests unless the user explicitly asks you to.
- Preserve public APIs (message formats, settings keys in `types.d.ts`) unless you update all callsites and tests.

Where to look when debugging
- Runtime issues on YouTube pages: `src/content/*` and `src/content/player/handle-video-player.ts`.
- Background messaging/state: `src/background/service-worker.ts`.
- Options/serialization bugs: `src/options/options-page.ts`.
- Packaging / build quirks: `scripts/fix-pico-paths.mjs` and `package.json` scripts.

If unsure or blocked
- Run the unit tests locally; if the user asks, they can run Playwright and inspect `playwright-report/` and `test-results/` for failing test artifacts.
- Ask for clarification and include failing test names or stack traces. Prefer concrete, small PRs for behavior changes.
