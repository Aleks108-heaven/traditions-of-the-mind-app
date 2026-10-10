# Project Context

> Claude Code reads this file automatically at the start of every session.
> Keep it short — every line here is loaded into context on every run.

## Stack
TypeScript + React, built with Vite. Wrapped natively for Android (Capacitor) and Windows (Tauri 2). No backend/DB — the only persisted state (language, theme) is in localStorage.

## Project Structure
- `src/` — app source (React components, `state/AppStateContext.tsx`, `lib/` helpers)
- `data/core.json` + `i18n/*.json` — content source (the 68 traditions + UI text per language); `scripts/build-data.js` compiles them into `src/data/appData.generated.json`
- `www/` — generated build output (gitignored); Capacitor/Tauri serve this, never edit directly
- `capacitor.config.json` / `src-tauri/tauri.conf.json` — native wrapper config

## Current Status
- [x] Split out of the Consulting Room app into its own repo (the original repo is unchanged)
- [x] Data trimmed to the 68 traditions; app IDs, names and CI renamed
- [x] Standalone reference UI (replaces the persona chat/library); typecheck, tests and build pass
- [ ] Trim dead chat/persona rules from `src/styles/global.css` — todo
- [ ] Buddha app icon (user to supply) — todo

## Rules for Claude Code
- Do NOT scan the entire repository on startup.
- Only read files explicitly named in the user's message.
- Before reading more than 3 files, ask for confirmation.
- Use `git log --oneline -10` — never full `git log`.
- Use `git diff <file>` on specific files — never a full repo diff.
- Use `git status --short` — never verbose status.
- Do not enter autonomous/auto-run loops without explicit permission.
- Prefer Plan Mode for multi-step tasks: propose the plan first, wait for approval, then execute.
- After finishing a task, summarize changes in 3-5 lines — do not re-read files to confirm unless asked.

## Commit Convention
Conventional Commits — `feat:`, `fix:`, `chore:`, `test:`, `ci:`.

## Out of Scope
`node_modules/`, `www/` and `src/data/appData.generated.json` (generated); never commit signing keystores or API keys.
