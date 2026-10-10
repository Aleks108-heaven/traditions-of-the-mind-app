#!/usr/bin/env node
// Manual link check (needs network; not run in CI): node scripts/check-links.js
// Requests every URL in data/library.json and exits non-zero if any does not answer 200.
const fs = require("fs");
const path = require("path");

const lib = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "library.json"), "utf8"));
const urls = [...new Set([...lib.teachers.flatMap((t) => t.links), ...lib.general].map((l) => l.url))];

(async () => {
  let bad = 0;
  for (const u of urls) {
    try {
      const r = await fetch(u, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (traditions-of-the-mind link check)" } });
      const ok = r.status === 200;
      if (!ok) bad++;
      console.log(`${ok ? "ok " : "BAD"} ${r.status} ${u}`);
    } catch (e) {
      bad++;
      console.log(`BAD ERR ${u} ${e.message}`);
    }
  }
  console.log(`\n${urls.length} links checked, ${bad} problem(s)`);
  process.exit(bad ? 1 : 0);
})();
