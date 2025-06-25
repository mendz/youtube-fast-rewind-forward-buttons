# Project Agents.md Guide for OpenAI Codex

This Agents.md file provides comprehensive guidance for OpenAI Codex and other AI agents working with this codebase.

## Project Structure for OpenAI Codex Navigation

- `/src`: Source code for the Chrome extension
  - `/assets`: Static SVG assets used by the extension
  - `/background`: Service worker and "What's new" page code
  - `/content`: Content scripts injected into YouTube pages
  - `/icons`: Extension icon files
  - `/options`: HTML, CSS and scripts for the options page
  - `/popup`: Popup page resources
  - `/web-components`: Custom web components
  - `**/__tests__`: Unit tests colocated with the source files
- `/e2e-tests`: Playwright end‑to‑end tests
- `/scripts`: Node scripts for building and version management
- `/screenshots`: Screenshots used in the documentation

## Coding Conventions for OpenAI Codex

### General Conventions for Agents.md Implementation

- Use TypeScript for all new code
- Follow the existing ESLint and Prettier configuration
- Choose meaningful variable and function names
- Add comments for any non‑trivial logic

### CSS/Styling Standards for OpenAI Codex

- Use plain CSS as in the existing styles
- Keep styles minimal and consistent with the current files

## Testing Requirements for OpenAI Codex

Run the following commands when updating code (not required for comment or documentation only changes):

```bash
npm run eslint       # lint check
npm run check        # TypeScript type check
npm run jest:test    # unit tests
npm run playwright:test  # e2e tests
```

Use `npm run jest:test:coverage` to generate coverage when needed.

## Pull Request Guidelines for OpenAI Codex

1. Provide a clear description of the changes
2. Reference related issues if applicable
3. Ensure all tests pass
4. Include screenshots for UI changes
5. Keep each PR focused on a single concern

## Programmatic Checks for OpenAI Codex

Before submitting changes run:

```bash
npm run eslint       # Lint check
npm run check        # Type check
npm run build        # Build the extension
```
