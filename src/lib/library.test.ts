import { describe, expect, it } from "vitest";
import capabilities from "../../src-tauri/capabilities/default.json";
import { appData } from "./appData";
import { t } from "./i18n";
import { libraryText } from "./library";

const lib = appData.library;
const en = appData.languages.en;
const PSYCH_WORDS = /psycholog|psychotherap|psicolog|psicoter|psychothér|psihol|psihoter|психолог|психотерап/i;
const UI_KEYS = [
  "nav_library", "library_title", "library_intro", "library_h_idea", "library_h_works", "library_h_read", "library_h_glossary",
  "library_status_historical", "library_status_tradition", "library_status_summary", "library_no_links", "library_links_note",
  "library_glossary_note", "library_open_chat", "library_general",
];

describe("Dzogchen library data", () => {
  it("covers the seven teachers of the Dzogchen lineage, in the same order", () => {
    expect(lib.teachers.map((x) => x.name)).toEqual(appData.chainA.map((c) => appData.personaMeta[c.personaIdx].n));
    expect(lib.teachers).toHaveLength(7);
  });

  it("gives every teacher a known status and at least one work with a title and status", () => {
    for (const teacher of lib.teachers) {
      expect(["historical", "tradition", "summary"], teacher.key).toContain(teacher.ideaStatus);
      expect(teacher.works.length, teacher.key).toBeGreaterThan(0);
      for (const w of teacher.works) {
        expect(w.title, `${teacher.key}/${w.id}`).toBeTruthy();
        expect(["historical", "tradition"], `${teacher.key}/${w.id}`).toContain(w.status);
      }
    }
  });

  it("has unique ids and keys", () => {
    const ids = lib.teachers.flatMap((x) => x.works.map((w) => w.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(lib.teachers.map((x) => x.key)).size).toBe(lib.teachers.length);
  });

  it("links only to https pages on hosts the Windows app is allowed to open", () => {
    const opener = capabilities.permissions.find(
      (p): p is { identifier: string; allow: { url: string }[] } => typeof p === "object" && p.identifier === "opener:allow-open-url"
    );
    expect(opener, "opener:allow-open-url permission").toBeTruthy();
    const prefixes = opener!.allow.map((a) => a.url.replace(/\*$/, ""));
    const links = [...lib.teachers.flatMap((x) => x.links), ...lib.general];
    expect(links.length).toBeGreaterThan(0);
    for (const l of links) {
      expect(l.url, l.label).toMatch(/^https:\/\//);
      expect(prefixes.some((p) => l.url.startsWith(p)), `${l.url} is not covered by the opener scope`).toBe(true);
    }
  });

  it("does not link anything for Chögyal Namkhai Norbu until a link is verified", () => {
    expect(lib.teachers.find((x) => x.key === "namkhai-norbu")?.links).toEqual([]);
  });
});

describe("Dzogchen library text", () => {
  it("has every label in every language", () => {
    for (const lang of appData.langs) {
      for (const key of UI_KEYS) expect(appData.languages[lang].ui[key], `${lang}.${key}`).toBeTruthy();
    }
    for (const lang of appData.langs.filter((l) => l !== "en")) {
      expect(appData.languages[lang].ui.library_intro, lang).not.toBe(en.ui.library_intro);
      expect(appData.languages[lang].ui.library_no_links, lang).not.toBe(en.ui.library_no_links);
    }
  });

  it("has complete English and Ukrainian content: an idea per teacher, a note per work, a gloss per term", () => {
    for (const lang of ["en", "uk"]) {
      const text = libraryText(lang);
      const own = appData.languages[lang].library;
      for (const teacher of lib.teachers) {
        expect(own?.ideas?.[teacher.key], `${lang} idea ${teacher.key}`).toBeTruthy();
        for (const w of teacher.works) expect(own?.notes?.[w.id], `${lang} note ${w.id}`).toBeTruthy();
      }
      for (const g of lib.glossary) {
        expect(own?.terms?.[g.key], `${lang} term ${g.key}`).toBeTruthy();
        expect(own?.glossary?.[g.key], `${lang} gloss ${g.key}`).toBeTruthy();
      }
      expect(Object.keys(text.ideas)).toHaveLength(lib.teachers.length);
    }
  });

  it("falls back to English per entry for languages without their own content", () => {
    expect(appData.languages.de.library).toBeUndefined();
    expect(libraryText("de").ideas.padmasambhava).toBe(en.library?.ideas?.padmasambhava);
    expect(libraryText("uk").ideas.padmasambhava).not.toBe(en.library?.ideas?.padmasambhava);
  });

  it("has no psychology wording in the labels or the content", () => {
    for (const lang of appData.langs) {
      for (const key of UI_KEYS) expect(t(lang, key), `${lang}.${key}`).not.toMatch(PSYCH_WORDS);
    }
    const everything = JSON.stringify([en.library, appData.languages.uk.library]);
    expect(everything).not.toMatch(PSYCH_WORDS);
  });
});
