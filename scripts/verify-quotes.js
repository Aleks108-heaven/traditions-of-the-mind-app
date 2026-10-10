#!/usr/bin/env node
// Manual check (needs network; not run in CI): node scripts/verify-quotes.js
// Re-fetches the source page of every quotation and mantra text in data/quotes.json and confirms the words appear
// there verbatim, line by line and in order (footnote markers like [1] and typographic quotes are ignored).
// Exits non-zero if anything cannot be found.
const fs = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "quotes.json"), "utf8"));
const UA = { headers: { "User-Agent": "Mozilla/5.0 (quote verification for a study app)" } };

const toText = (html) => html
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<nav[\s\S]*?<\/nav>|<header[\s\S]*?<\/header>|<footer[\s\S]*?<\/footer>/gi, " ")
  .replace(/<br\s*\/?>|<\/p>|<\/div>|<\/h\d>|<\/li>/gi, "\n").replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&").replace(/&#39;|&rsquo;|&#8217;/g, "’").replace(/&lsquo;|&#8216;/g, "‘").replace(/&nbsp;/g, " ")
  .replace(/&quot;/g, '"').replace(/&#8211;|&ndash;/g, "–").replace(/&#8212;|&mdash;/g, "—").replace(/&#8220;|&ldquo;/g, "“").replace(/&#8221;|&rdquo;/g, "”");
const norm = (s) => s.replace(/\[\d+\]/g, "").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();

const cache = new Map();
async function pageText(url) {
  if (!cache.has(url)) {
    const r = await fetch(url, UA);
    if (!r.ok) throw new Error(`${r.status} for ${url}`);
    cache.set(url, norm(toText(await r.text())));
  }
  return cache.get(url);
}

// every non-empty line of `text` must occur on the page, each after the previous one
async function checkLines(label, url, text) {
  const page = await pageText(url);
  let from = 0;
  for (const raw of text.split("\n")) {
    const line = norm(raw.replace(/^…|…$/g, ""));
    if (!line) continue;
    const at = page.indexOf(line, from);
    if (at < 0) return `${label}: not found verbatim — "${line.slice(0, 80)}"`;
    from = at + line.length;
  }
  return null;
}

(async () => {
  const problems = [];
  let checked = 0;
  for (const q of data.quotes) {
    const err = await checkLines(`quote ${q.teacher}`, q.sourceUrl, q.text);
    checked++;
    console.log(`${err ? "BAD" : "ok "} quote  ${q.teacher} — ${q.work}`);
    if (err) problems.push(err);
  }
  for (const m of data.mantras) {
    const checks = [[`mantra ${m.key} text`, m.aboutUrl, m.text], [`mantra ${m.key} description`, m.aboutUrl, m.about]];
    if (m.meaning.length) checks.push([`mantra ${m.key} syllables`, m.sourceUrl, m.meaning.join("\n")]);
    for (const [label, url, text] of checks) {
      const err = await checkLines(label, url, text);
      checked++;
      console.log(`${err ? "BAD" : "ok "} ${label}`);
      if (err) problems.push(err);
    }
  }
  console.log(`\n${checked} checks, ${problems.length} problem(s)`);
  for (const p of problems) console.log("  - " + p);
  process.exit(problems.length ? 1 : 0);
})().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
