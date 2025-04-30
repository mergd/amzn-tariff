# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Dev server: `pnpm run dev`
- Build extension: `pnpm run build`
- Lint code: `pnpm run lint`
- Preview build: `pnpm run preview`

## Code Style Guidelines
- TypeScript with strict mode enabled
- React components using functional style with hooks
- ES modules with explicit imports
- Tailwind CSS for styling
- Naming: PascalCase for components, camelCase for variables/functions
- Follow React hooks rules (enforced by ESLint)
- Use explicit type annotations for function parameters and returns
- No unused variables or parameters (enforced by TypeScript)
- No switch case fallthrough

## Project Structure
- Extension code in `src/chrome-extension/`
- Popup UI in `src/chrome-extension/popup/`
- Options page in `src/chrome-extension/options/`
- Extension manifest in `src/chrome-extension/manifest.json`
- Extension assets in `src/chrome-extension/public/`