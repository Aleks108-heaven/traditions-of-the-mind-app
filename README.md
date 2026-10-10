# Traditions of the Mind — Android + Windows app

An offline reference to 68 figures across Buddhist, contemplative and psychological
traditions: a searchable list with each figure's name and what they are known for, in
11 languages, with light/dark themes. Built with **Vite + React + TypeScript** and wrapped
as a native app for **Android** (Capacitor) and **Windows** (Tauri 2). It also runs in any
browser.

This app was split out of the Consulting Room app, where it started as a single screen.
It is a separate project with its own app ID and its own storage.

`www/` is a **build output directory** (gitignored, produced by `npm run build`), not source.

---

## Privacy and security

- The app makes **no network requests**. The Windows build ships a Content-Security-Policy
  with `connect-src 'self'` (`src-tauri/tauri.conf.json`) and no HTTP permissions
  (`src-tauri/capabilities/default.json`).
- The only data stored on the device is your language and theme choice, in
  `localStorage` under keys starting with `traditionsofthemind_`.
- The Android build disables app-data backup (`scripts/harden-android-manifest.js`).
- The CI workflow (`.github/workflows/build.yml`) only runs on push to `main`, pull
  requests to `main` and manual dispatch, uses no repo secrets, and its `GITHUB_TOKEN` is
  scoped to `contents: read`.

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

- `data/core.json` holds the 68 traditions, in list order: `num`, `n` (name), `y` (years)
  and `mode` (school key, not shown in the UI yet).
- `i18n/<code>.json` has one file per language: `label`, `ui` (interface strings) and,
  optionally, `traditions` (the "known for" tag and key terms for each tradition).
  The `traditions` array is **parallel to `core.json` by index**.

**Do not hand-edit `src/data/appData.generated.json`** — it is generated. After changing
anything under `data/` or `i18n/`, run:

```bash
npm run data:build
```

(`npm run dev`, `npm test` and `npm run build` already run it first.)

Currently shipped: English, Ukrainian, Spanish, Polish, German, Italian, Catalan, French,
Portuguese, Romanian, Russian. Every lookup falls back to English key by key, so a
language file can be partial. Today only **English, Spanish, Polish and Ukrainian** have
their own per-tradition text; the other languages show the English text. Several interface
strings (the About text, search placeholder, intro, disclaimer line, app subtitle, and the
language-setting description and empty-search message) are English-only until translated.

To add a language: copy `i18n/en.json` to `i18n/<code>.json`, translate `label` and `ui`
(and `traditions` if you can), add `<code>` to the `ORDER` array in
`scripts/build-data.js`, then `npm run data:build`.

To add a tradition: append an entry to `data/core.json` with the next `num`, and append
the matching entry to the `traditions` array of every language file that has one.

---

## App icon

The icons currently in the repo are **placeholders inherited from Consulting Room**. To use
your own artwork, replace:

- `resources/icon.png` — square PNG, at least 1024×1024 (also the Windows and iOS source).
  Optionally add `resources/icon-foreground.png` and `resources/icon-background.png` for a
  proper Android adaptive icon.
- `public/icons/icon-192.png`, `public/icons/icon-512.png` and
  `public/icons/apple-touch-icon.png` — the web/home-screen icons, at their own sizes.

Then regenerate the platform icons:

```bash
npx @tauri-apps/cli icon resources/icon.png   # Windows: writes src-tauri/icons/
npm run android:icon                          # Android launcher icon
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
Program account ($99/year).

---

## Project layout

```
traditions-of-the-mind-app/
├─ index.html                # Vite entry template (references src/main.tsx)
├─ src/
│  ├─ main.tsx, App.tsx      # bootstrap + About/Settings modal wiring
│  ├─ state/                 # AppStateContext.tsx — search, language, theme
│  ├─ lib/                   # appData, i18n, traditions (text lookup), theme, storage
│  ├─ components/            # Traditions (the list), Settings, Modals, TopBar, ui/
│  ├─ styles/global.css      # design tokens + component styles
│  └─ data/appData.generated.json   # generated — do not hand-edit
├─ data/core.json            # the 68 traditions (shared across languages)
├─ i18n/*.json               # one file per language
├─ scripts/                  # build-data.js, harden-android-manifest.js
├─ resources/                # icon sources for Tauri / Capacitor
├─ public/                   # web manifest + web icons
├─ www/                      # generated build output (gitignored)
├─ vite.config.ts            # build.outDir = "www"
├─ capacitor.config.json     # Android/iOS config (webDir: "www")
└─ src-tauri/                # Windows (Tauri 2)
   ├─ tauri.conf.json        # frontendDist: "../www"
   ├─ capabilities/default.json
   └─ src/{main,lib}.rs
```

## Build outputs are not committed

`node_modules/`, `android/`, `ios/`, `src-tauri/target/`, `www/` and `ci-artifacts/` are
gitignored on purpose — they are generated from source, and binaries don't belong in git
history. A fresh clone gets them back via `npm install` + `npm run build` +
`npm run android:add`. If you want built APKs/EXEs available online, attach them to a
GitHub/GitLab Release instead of committing them.
