#!/usr/bin/env node
// Assembles src/data/appData.generated.json from data/core.json (the 33 characters, the Dzogchen chain and category order: shared,
// language-independent content) + i18n/<lang>.json (one file per language).
// Vite imports that JSON directly, so it gets bundled at build time.
// Run after editing anything under data/ or i18n/.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const core = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "core.json"), "utf8"));
const i18nDir = path.join(ROOT, "i18n");

const files = fs.readdirSync(i18nDir).filter(f => f.endsWith(".json"));
const languages = {};
for (const f of files) {
  const lang = f.replace(/\.json$/, "");
  languages[lang] = JSON.parse(fs.readFileSync(path.join(i18nDir, f), "utf8"));
}

// Preserve a stable, curated language order (original four, then the newly
// added ones alphabetically); any language file not listed here is appended.
const ORDER = ["en", "uk", "es", "pl", "de", "it", "ca", "fr", "pt", "ro", "ru"];
const langs = ORDER.filter(l => languages[l]).concat(
  Object.keys(languages).filter(l => ORDER.indexOf(l) === -1).sort()
);

const appData = {
  langs,
  personaMeta: core.personaMeta,
  chainA: core.chainA,
  traditions: core.traditions,
  categoryOrder: core.categoryOrder,
  library: JSON.parse(fs.readFileSync(path.join(ROOT, "data", "library.json"), "utf8")),
  languages
};

const outDir = path.join(ROOT, "src", "data");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "appData.generated.json");
fs.writeFileSync(outPath, JSON.stringify(appData));
console.log(`Wrote ${path.relative(ROOT, outPath)} with languages: ${langs.join(", ")}`);
