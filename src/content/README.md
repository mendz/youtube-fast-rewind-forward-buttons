# Content Folder

This folder contains the injected YouTube content-script runtime.
It adds rewind/forward buttons to the player and handles keyboard shortcuts.

## Entry Point

- `content.ts` is the manifest entry and orchestrates initialization, SPA navigation handling, options loading, and keyboard wiring.

## Structure

| Path | Role |
| --- | --- |
| `content.ts` | Entry point: init, SPA navigation, options loading, keyboard handlers |
| `selectors.ts` | Centralized YouTube DOM selectors |
| `content-styles.css` | Styles for the custom buttons |
| `content-trigger-flows.md` | Trigger-flow and lifecycle documentation |
| `buttons/` | Button UI: creation, SVG generation, labels/titles |
| `player/` | Video/player logic: seek updates and player-ready polling |
| `events/` | Keyboard handling: arrow/media key behavior |
| `ui/` | UI helpers: tooltip behavior and native-style syncing |
| `__tests__/` | Unit tests for content modules |
| `__utils__/` | Test fixtures/helpers for content tests |

## Shared Types

- Shared interfaces and enums used by content and options live in `src/shared/types.ts`.

## Related Docs

- See `content-trigger-flows.md` for startup, SPA navigation, fallback observer, and cleanup flows.
