# Project Context

> Claude Code reads this file automatically at the start of every session.
> Keep it short — every line here is loaded into context on every run.

## Stack

TypeScript + React, built with Vite. Wrapped natively for Android (Capacitor) and Windows (Tauri 2). No backend/DB — all state in localStorage.

## Project Structure

- `src/` — app source (React components, `state/AppStateContext.tsx`, `lib/` helpers incl. `liveAi.ts`)
- `data/core.json` + `i18n/*.json` — content source (the 33 characters + UI text per language); `scripts/build-data.js` compiles them into `src/data/appData.generated.json`
- `www/` — generated build output (gitignored); Capacitor/Tauri serve this, never edit directly
- `capacitor.config.json` / `src-tauri/tauri.conf.json` — native wrapper config

## Current Status

- [x] Split out of the Consulting Room app into its own repo (the original repo is unchanged)
- [x] Consulting Room–style app (library, chat, Live AI) with 33 Buddhist / Tibetan / Dzogchen teachers and philosophers — no psychologists (those stay in Consulting Room); Buddha icon; renamed IDs, storage prefix and CI
- [x] Dzogchen lineage window (Padmasambhava → … → Chögyal Namkhai Norbu)
- [x] Dzogchen library window: 7 teachers, verified links and editions, labelled statements; no verbatim quotes yet (`data/library.json`, `scripts/check-links.js`)
- [ ] Windows link opening (`tauri-plugin-opener`) is unverified — no Rust toolchain here; check the CI Windows job
- [x] Non-English copy for the app-specific strings (unreviewed by native speakers)
- [ ] Tidy `src/styles/global.css` (selectors and spacing for the new layout) — todo
- [ ] `SECURITY.md` is still GitHub's template — needs a real contact and policy before going public

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
