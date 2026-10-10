import { describe, expect, it } from "vitest";
import { appData } from "./appData";
import { t } from "./i18n";
import { modeData, personaText } from "./personas";

const en = appData.languages.en;
const COUNT = 33;
const SCHOOLS = ["buddhist_classical", "nyingma_dzogchen", "lamrim_kadam", "kagyu_mahamudra", "contemplative_science"];
// Belongs to Consulting Room, not here: a sample of the psychology schools, plus the two "contemplative science" names who are psychologists/neuroscientists.
const NOT_HERE = ["Sigmund Freud", "Fritz Perls", "Carl Jung", "Alfred Adler", "Carl Rogers", "Viktor Frankl", "Daniel Kahneman", "Martin Seligman", "B.F. Skinner", "Daniel Goleman", "Richard Davidson"];
const PSYCH_WORDS = /psycholog|psychotherap|psicolog|psicoter|psychothér|psihol|psihoter|психолог|психотерап/i;

describe("character data", () => {
  it(`has ${COUNT} numbered characters, in the same order as the Traditions list`, () => {
    expect(appData.personaMeta).toHaveLength(COUNT);
    expect(appData.traditions).toHaveLength(COUNT);
    appData.traditions.forEach((row, i) => {
      expect(row.num).toBe(i + 1);
      expect(row.personaIdx).toBe(i);
    });
    for (const p of appData.personaMeta) {
      expect(p.n).not.toBe("");
      expect(p.y).not.toBe("");
    }
  });

  it("has only Buddhist, Tibetan and contemplative teachers — no psychologists or psychotherapists", () => {
    for (const p of appData.personaMeta) expect(SCHOOLS, p.n).toContain(p.mode);
    const names = appData.personaMeta.map((p) => p.n);
    for (const n of NOT_HERE) expect(names, n).not.toContain(n);
    expect(names).toContain("Gautama Buddha");
    expect(names).toContain("Chögyal Namkhai Norbu");
  });

  it("gives every character a tag, a voice and key terms in English", () => {
    appData.personaMeta.forEach((_, i) => {
      const p = en.personas[i];
      expect(p?.tag, `#${i + 1} tag`).toBeTruthy();
      expect(p?.voice, `#${i + 1} voice`).toBeTruthy();
      expect(Array.isArray(p?.terms) && p.terms.length > 0, `#${i + 1} terms`).toBe(true);
    });
  });

  it("resolves every character's text and school label in every language", () => {
    for (const lang of appData.langs) {
      appData.personaMeta.forEach((meta, i) => {
        expect(personaText(lang, i).tag, `${lang} #${i + 1}`).toBeTruthy();
        expect(modeData(lang, meta.mode)?.label, `${lang} mode ${meta.mode}`).toBeTruthy();
      });
    }
  });

  it("keeps crisis keywords in every language, so crisis messages are always routed", () => {
    for (const lang of appData.langs) {
      const cats = appData.languages[lang].categories || en.categories;
      expect(cats.crisis.kw.length, lang).toBeGreaterThan(0);
    }
    expect(appData.categoryOrder[0]).toBe("crisis");
  });
});

describe("Dzogchen lineage", () => {
  const names = ["Padmasambhava", "Rongzom Chökyi Zangpo", "Longchenpa", "Jigme Lingpa", "Patrul Rinpoche", "Dudjom Rinpoche", "Chögyal Namkhai Norbu"];

  it("is seven linked characters, in order, ending with Chögyal Namkhai Norbu", () => {
    expect(appData.chainA.map((c) => appData.personaMeta[c.personaIdx]?.n)).toEqual(names);
  });

  it("has a note for every step, in every language", () => {
    for (const lang of appData.langs) {
      const notes = appData.languages[lang].chainANotes;
      expect(notes, lang).toHaveLength(names.length);
      notes?.forEach((n, i) => expect(n, `${lang} note ${i}`).toBeTruthy());
    }
  });

  it("has its own translated menu item and intro in every language, with no stray placeholders", () => {
    for (const lang of appData.langs) {
      const ui = appData.languages[lang].ui;
      for (const key of ["nav_lineage", "lineage_title", "lineage_intro"]) {
        expect(ui[key], `${lang}.${key}`).toBeTruthy();
        expect(ui[key], `${lang}.${key}`).not.toMatch(/[{}]/);
      }
      expect(ui.lineage_title, lang).toBe(ui.nav_lineage);
      expect(ui.lineage_h_formative, lang).toBeUndefined();
    }
    for (const lang of appData.langs.filter((l) => l !== "en")) {
      expect(appData.languages[lang].ui.lineage_intro, lang).not.toBe(en.ui.lineage_intro);
    }
  });
});

describe("ui text", () => {
  it("uses each language's own name for the app as the brand", () => {
    for (const lang of appData.langs) expect(t(lang, "brand_title"), lang).toBe(t(lang, "traditions_title"));
  });

  it("mentions neither the old app, the old character counts, nor psychologists and psychotherapists", () => {
    for (const lang of appData.langs) {
      for (const [key, value] of Object.entries(appData.languages[lang].ui)) {
        expect(value, `${lang}.${key}`).not.toMatch(/Consulting Room|\b135\b|\b68\b/);
        expect(value, `${lang}.${key}`).not.toMatch(PSYCH_WORDS);
      }
    }
  });

  it("states the right character count in the subtitle and About text of every language", () => {
    for (const lang of appData.langs) {
      expect(t(lang, "brand_sub"), lang).toContain(String(COUNT));
      expect(t(lang, "about_p1"), lang).toContain(String(COUNT));
    }
  });

  it("has a start-here banner with both placeholders in every language", () => {
    for (const lang of appData.langs) {
      const banner = t(lang, "lineage_banner_text");
      expect(banner, lang).toContain("{start}");
      expect(banner, lang).toContain("{lineage}");
    }
  });
});
