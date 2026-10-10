# Traditions of the Mind — Android + Windows app

A study companion for 33 Buddhist, Tibetan and Dzogchen teachers and philosophers:
a character library, chat UI, scripted conversation engine, i18n and theming,
built with **Vite + React + TypeScript**. This repo wraps it as a native app for **Android**
(Capacitor) and **Windows** (Tauri 2), and adds a **provider-agnostic Live AI mode**. It also
runs in any browser.

It was split out of the Consulting Room app (same design and code base, a different set of
characters) and is a separate project with its own app ID and its own storage. Consulting Room
keeps all 135 psychologists and psychotherapists; this app has none of them.

`www/` is a **build output directory** (gitignored, produced by `npm run build`), not source.

---

## Live AI mode

- `crProviderReply()` (`src/lib/liveAi.ts`) is a small provider-agnostic layer that
  speaks to **Anthropic, Google Gemini, Groq, OpenRouter, or any OpenAI-compatible
  endpoint**.
- Settings has an **AI provider** dropdown, an optional **Model ID**, and an
  optional **Base URL** (for OpenAI-compatible servers). Key + settings are stored
  on-device only (localStorage).
- Network calls go through the **native HTTP bridge** (Capacitor `CapacitorHttp` /
  Tauri `http` plugin) so they are **not blocked by browser CORS** in the packaged apps.
  A plain `fetch` fallback is kept for running in a normal browser tab. Every call is
  bounded by a client-side timeout so a hung request can't leave the chat stuck on
  the typing indicator.

With Live AI mode **off** the app is 100% offline, using the scripted engine only.

---

## Choosing a free AI provider

| Provider | Free tier | Get a key | Default model |
|---|---|---|---|
| **Google Gemini** ✅ recommended | Generous, **no credit card** | <https://aistudio.google.com/apikey> | `gemini-2.5-flash` |
| **Groq** ✅ very fast | Generous, no credit card | <https://console.groq.com/keys> | `llama-3.3-70b-versatile` |
| **OpenRouter** | Use models ending in `:free` | <https://openrouter.ai/keys> | `meta-llama/llama-3.3-70b-instruct:free` |
| **Anthropic** | Paid only | <https://console.anthropic.com> | `claude-haiku-4-5` |
| **OpenAI-compatible** | depends on host | — | set Base URL + Model |

> ⚠️ **Do not ship your own key inside a distributed build** — it can be extracted
> from the APK / EXE. For public distribution, have each user paste their own free
> key (the Settings UI already supports this), or run a tiny proxy (e.g. Cloudflare
> Workers free tier) that holds the key. Embedding your key is fine for **personal
> use only**.

---

## Security notes

- **API keys live only in `localStorage`** on the device; they're never bundled
  into the app and never sent anywhere except straight to the provider you chose.
- **Windows (Tauri):** the app ships a locked-down Content-Security-Policy
  (`src-tauri/tauri.conf.json`), and outbound HTTP is capability-scoped in
  `src-tauri/capabilities/default.json` to exactly the five providers' hosts —
  the packaged app cannot be made to call an arbitrary URL. If you pick
  **OpenAI-compatible (custom)** with your own Base URL, add that host to the
  `http:default` allow-list in that file before building, or the request will be
  blocked (safe default; not a bug).
- The Android build disables app-data backup (`scripts/harden-android-manifest.js`), so the
  stored key and chat history are not copied to cloud backups.
- The Dzogchen library's links open in your browser only when you click them; the app makes no
  request for them.
- **CI workflow** (`.github/workflows/build.yml`) only runs on push to `main`, pull
  requests to `main` and manual dispatch, uses no repo secrets, and its
  `GITHUB_TOKEN` is scoped to `contents: read`.
- The scripted engine routes messages that look like a crisis to a fixed message with
  crisis-line guidance (the `crisis` category in each `i18n/<code>.json`). Keep that category
  populated when adding a language.

---

## Prerequisites

- **Node.js 18+** and npm
- **Android build:** Android Studio (SDK + platform tools), JDK 17
- **Windows build:** [Rust](https://rustup.rs/) + the "Desktop development with C++"
  workload from the Visual Studio Build Tools, and the WebView2 runtime (preinstalled on
  Windows 11)

```bash
npm install
```

## Run in the browser (development)

```bash
npm run dev          # rebuilds the data, then starts Vite with hot reload
```

Open the `localhost` address it prints. To check the phone layout, use the browser's
device toolbar (Chrome/Edge DevTools → Ctrl+Shift+M) and pick a narrow device such as
360 px wide.

Other scripts: `npm run typecheck` (TypeScript only), `npm test` (rebuilds the data, then
runs Vitest), `npm run build` (data + typecheck + production build into `www/`).

---

## Languages & content

- `data/core.json` (shared across languages): `personaMeta` (the 33 characters — name, years,
  school key), `traditions` (the numbered list in the Traditions window → character index),
  `chainA` (the Dzogchen chain, ending with Chögyal Namkhai Norbu) and `categoryOrder`.
- `i18n/<code>.json`, one file per language: `label`, `ui` (interface strings), `modes` (each
  school's label and its scripted-reply template bank), `personas` (each character's tag, voice and
  key terms — **parallel to `personaMeta` by index**), `categories` (keyword routing, including
  `crisis`) and the Dzogchen chain notes (`chainANotes`).

**Do not hand-edit `src/data/appData.generated.json`** — it is generated. After changing
anything under `data/` or `i18n/`, run:

```bash
npm run data:build
```

(`npm run dev`, `npm test` and `npm run build` already run it first.)

Currently shipped: English, Ukrainian, Spanish, Polish, German, Italian, Catalan, French,
Portuguese, Romanian, Russian. Every lookup falls back to English key by key, so a
language file can be partial. Only **English, Spanish, Polish and Ukrainian** have their own
per-character `personas` text; the other languages show the English text.

The Traditions-specific wording (app name, subtitle, About text, library intro, search hint,
start-here banner, Traditions intro, the Dzogchen lineage menu item and intro, and the chain
notes) in the ten non-English languages was translated without native review — corrections welcome.

To add a language: copy `i18n/en.json` to `i18n/<code>.json`, translate `label`, `ui`, `categories`
and `modes` (and ideally the chain notes), add `<code>` to the `ORDER` array in
`scripts/build-data.js`, then `npm run data:build`.

To add a character: append it to `personaMeta` and to `traditions` (next `num`, `personaIdx` = its
new index) in `data/core.json`, and append the matching entry to the `personas` array of every
language file that has one.

---

## Dzogchen library

The **Dzogchen library** window is a reading guide to the seven teachers of the Dzogchen lineage
(Padmasambhava → … → Chögyal Namkhai Norbu): a one-sentence paraphrased idea, key works, where to
read them, and a short glossary. Every statement carries a label — *Historical record*, *Tradition
holds* or *Summary — check the named work* — so attributions are not stated more firmly than the
evidence allows. There are **no verbatim quotations yet**; one would be added only with its title,
translator, edition and location in the text, and a licence that permits it.

- Facts (works, editions, links, glossary keys) live in `data/library.json`; per-language text
  (ideas, work notes, glossary) in each `i18n/<code>.json` under `library`. English and Ukrainian are
  complete; other languages show English content with their own translated labels.
- Titles and editions were checked against a library catalogue, and every link against the live
  site. Re-check the links with `node scripts/check-links.js` (needs network; not run in CI).
- Links open in the system browser. On Windows this uses `tauri-plugin-opener`, scoped in
  `src-tauri/capabilities/default.json` to the hosts the library links to (a test fails if a link is
  outside that scope). Link opening on Windows and Android has not been tested in a packaged build.

---

## App icon

The icon is a Buddha seated under a bodhi tree, light on blue (`#1F558C`):

- `resources/icon.png` — 1024×1024 master (also the Windows and iOS source)
- `resources/icon-foreground.png` / `resources/icon-background.png` — Android adaptive-icon layers
  (the foreground art sits inside the 60 % safe zone)
- `public/icons/icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — web / home-screen icons
- `src-tauri/icons/` — Windows icons

The artwork was upscaled from a 626 px source, so a larger or vector original would be sharper.
To replace it, update the files above and regenerate the platform icons:

```bash
npx @tauri-apps/cli icon resources/icon.png -o some-temp-dir   # then copy 32x32, 128x128, 128x128@2x, icon.ico, icon.png into src-tauri/icons
npm run android:icon                                           # Android launcher icon
```

`android:icon` and the iOS equivalent use `@capacitor/assets`, which needs the `sharp`
package's install script to have run. If npm reports it as blocked, run
`npm install-scripts approve sharp` (or reinstall with scripts allowed).

---

## Windows (Tauri)

```bash
# run in dev
npm run win:dev

# build installers -> src-tauri/target/release/bundle/{nsis,msi}/
npm run win:build
```

If `window.__TAURI__.http` is unavailable at runtime, Live mode falls back to
`fetch`; keep `withGlobalTauri: true` in `src-tauri/tauri.conf.json` (already set) so
the http bridge is exposed without a bundler.

---

## Android (Capacitor)

```bash
# one-time
npm run android:add          # creates the android/ project and hardens its manifest
npm run android:icon         # writes the launcher icon from resources/icon*.png

# after any change to src/, data/, or i18n/
npm run build && npm run android:sync

# open in Android Studio to run on a device/emulator or build an AAB
npm run android:open
```

`CapacitorHttp` is enabled in `capacitor.config.json`, which routes `fetch` through
native code and bypasses CORS. Internet permission is included by Capacitor by default.

Without Android Studio, build with Gradle directly (Capacitor's `cap run` does not resolve
`gradlew` reliably from Git Bash on Windows):

```bash
cd android
./gradlew.bat assembleDebug      # -> android/app/build/outputs/apk/debug/app-debug.apk
./gradlew.bat assembleRelease    # -> .../apk/release/app-release-unsigned.apk
```

**The release APK is unsigned and will not install as-is.** A Play Store release needs a
real, permanently kept release keystore. Keystores are gitignored — a signing key is a
secret and never belongs in source control — so back yours up yourself: the same key must
be reused for every release for an installed app to update.

To produce a release AAB: Android Studio → Build → Generate Signed Bundle, or
`cd android && ./gradlew bundleRelease`.

---

## iPhone (Capacitor + Xcode)

Building for iOS requires a Mac with Xcode. The `ios` job in
[`.github/workflows/build.yml`](.github/workflows/build.yml) (and the manual `ios` job in
`.gitlab-ci.yml`) builds an **unsigned iOS Simulator build** on a hosted macOS runner. It
proves the app compiles and runs in the Simulator; it does not run on a physical iPhone.

On your own Mac:

```bash
npm run ios:add     # creates the ios/ project (needs CocoaPods)
npm run ios:icon    # writes the app icon from resources/icon*.png
npm run build       # after any change to src/, data/, or i18n/
npm run ios:sync
npx cap open ios    # opens Xcode
```

Installing on a real iPhone or publishing to the App Store needs an Apple Developer
Program account ($99/year). The app stores your API key and chat history on the device
only, and sends messages only to the AI provider you configure when Live AI is on —
say so in the privacy policy a store listing requires.

---

## Project layout

```text
traditions-of-the-mind-app/
├─ index.html                # Vite entry template (references src/main.tsx)
├─ src/
│  ├─ main.tsx, App.tsx      # app bootstrap + top-level view/modal wiring
│  ├─ state/                 # AppStateContext.tsx — settings, chat state, persistence
│  ├─ lib/                   # i18n, theming, persona helpers, scripted engine, liveAi.ts
│  ├─ components/            # Library, Chat, Settings, Modals
│  ├─ styles/global.css      # design tokens + component styles
│  └─ data/appData.generated.json   # generated — do not hand-edit
├─ data/core.json            # the 33 characters, the Dzogchen chain, category order (shared)
├─ i18n/*.json               # one file per language
├─ scripts/                  # build-data.js, harden-android-manifest.js
├─ resources/                # icon sources for Tauri / Capacitor
├─ public/                   # web manifest + web icons
├─ www/                      # generated build output (gitignored)
├─ vite.config.ts            # build.outDir = "www"
├─ capacitor.config.json     # Android/iOS config (webDir: "www")
└─ src-tauri/                # Windows (Tauri 2)
   ├─ tauri.conf.json        # frontendDist: "../www"
   ├─ capabilities/default.json   # allow-list of API hosts
   └─ src/{main,lib}.rs
```

## Build outputs are not committed

`node_modules/`, `android/`, `ios/`, `src-tauri/target/`, `www/` and `ci-artifacts/` are
gitignored on purpose — they are generated from source, and binaries don't belong in git
history. A fresh clone gets them back via `npm install` + `npm run build` +
`npm run android:add`. If you want built APKs/EXEs available online, attach them to a
GitHub/GitLab Release instead of committing them.
