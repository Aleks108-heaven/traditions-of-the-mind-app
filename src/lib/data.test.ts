import { describe, expect, it } from "vitest";
import { appData } from "./appData";
import { t } from "./i18n";
import { modeData, personaText } from "./personas";

const en = appData.languages.en;

describe("character data", () => {
  it("has 68 numbered characters, in the same order as the Traditions list", () => {
    expect(appData.personaMeta).toHaveLength(68);
    expect(appData.traditions).toHaveLength(68);
    appData.traditions.forEach((row, i) => {
      expect(row.num).toBe(i + 1);
      expect(row.personaIdx).toBe(i);
    });
    for (const p of appData.personaMeta) {
      expect(p.n).not.toBe("");
      expect(p.y).not.toBe("");
    }
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

  it("has lineage chains that link to real characters or show a plain name", () => {
    for (const lang of appData.langs) {
      const l = appData.languages[lang];
      for (const [chain, names] of [
        [appData.chainA, l.chainANames || en.chainANames],
        [appData.chainB, l.chainBNames || en.chainBNames],
      ] as const) {
        chain.forEach((c, i) => {
          if (c.personaIdx > -1) expect(c.personaIdx).toBeLessThan(appData.personaMeta.length);
          else expect(names?.[i], `${lang} unlinked chain item ${i}`).toBeTruthy();
        });
      }
    }
    // only Freud and Perls from the first chain, and the whole second chain, are among the 68
    expect(appData.chainA.filter((c) => c.personaIdx > -1)).toHaveLength(2);
    expect(appData.chainB.filter((c) => c.personaIdx > -1)).toHaveLength(7);
  });
});

describe("ui text", () => {
  it("uses each language's own name for the app as the brand", () => {
    for (const lang of appData.langs) expect(t(lang, "brand_title"), lang).toBe(t(lang, "traditions_title"));
  });

  it("no longer mentions the old app name or the old character count", () => {
    for (const lang of appData.langs) {
      for (const [key, value] of Object.entries(appData.languages[lang].ui)) {
        expect(value, `${lang}.${key}`).not.toMatch(/Consulting Room|\b135\b/);
      }
    }
  });

  it("has a start-here banner with both placeholders in every language", () => {
    for (const lang of appData.langs) {
      const banner = t(lang, "lineage_banner_text");
      expect(banner, lang).toContain("{start}");
      expect(banner, lang).toContain("{lineage}");
    }
  });

  it("states the right character count in the About text of every language", () => {
    for (const lang of appData.langs) expect(t(lang, "about_p1"), lang).toContain("68");
  });
});
