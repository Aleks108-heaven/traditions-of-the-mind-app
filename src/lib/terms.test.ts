import { describe, expect, it } from "vitest";
import { appData } from "./appData";
import { t } from "./i18n";
import { termsText } from "./terms";

const data = appData.terms;
const en = appData.languages.en;
const KEYS = ["dzogchen", "rigpa", "ma-rigpa", "kadag", "lhundrub", "terma", "terton", "trekcho", "togal", "three-series"];
const UI_KEYS = [
  "nav_terms", "terms_title", "terms_intro", "terms_note", "terms_h_short", "terms_h_renderings", "terms_h_varies",
  "terms_sources", "terms_sources_note", "terms_label_tibetan", "terms_label_sanskrit",
];
const PSYCH_WORDS = /psycholog|psychotherap|psicolog|psicoter|psychothér|psihol|psihoter|психолог|психотерап/i;

describe("Dzogchen terms data", () => {
  it("has the ten terms, in order, each with Tibetan and at least one rendering", () => {
    expect(data.terms.map((x) => x.key)).toEqual(KEYS);
    for (const term of data.terms) {
      expect(term.tibetan, term.key).toBeTruthy();
      expect(term.renderings.length, term.key).toBeGreaterThan(0);
      const texts = term.renderings.map((r) => r.text);
      expect(new Set(texts).size, `${term.key} has duplicate renderings`).toBe(texts.length);
      for (const r of term.renderings) {
        expect(r.text, term.key).toBeTruthy();
        if (r.by !== undefined) expect(r.by, `${term.key}/${r.text}`).toBeTruthy();
      }
    }
  });

  it("lists its sources as citations, and contains no web links", () => {
    expect(data.sources.length).toBeGreaterThan(0);
    for (const s of data.sources) {
      expect(s.author).toBeTruthy();
      expect(s.title).toBeTruthy();
      expect(s.detail).toBeTruthy();
    }
    expect(JSON.stringify(data)).not.toMatch(/https?:\/\//);
  });

  it("names the teachers or dictionaries behind the renderings that vary most", () => {
    const by = (key: string) => data.terms.find((x) => x.key === key)!.renderings.map((r) => r.by ?? "").join(" | ");
    expect(by("togal")).toMatch(/Hopkins/);
    expect(by("togal")).toMatch(/Germano/);
    expect(by("trekcho")).toMatch(/Pearcey/);
    expect(by("kadag")).toMatch(/Hopkins/);
    expect(by("lhundrub")).toMatch(/Rangjung Yeshe/);
    expect(by("rigpa")).toMatch(/Dalai Lama/);
  });
});

describe("Dzogchen terms text", () => {
  it("keeps the six supplied glosses word for word in English", () => {
    const short = en.terms!.short!;
    expect(short.rigpa).toBe("intrinsic awareness — the knowing quality of mind that Dzogchen teaches one to recognize.");
    expect(short.kadag).toBe("primordial purity — the nature of mind and phenomena as pure from the very beginning.");
    expect(short.lhundrub).toBe("spontaneous presence — the natural, effortless manifestation of that nature as qualities and appearances.");
    expect(short.terma).toBe("treasure teaching — teachings that tradition says were concealed (by Padmasambhava and others) to be revealed later by a tertön.");
    expect(short.trekcho).toBe("“cutting through” — the Dzogchen practice of recognizing the primordial state directly.");
    expect(short.togal).toBe("“leaping over” — the advanced Dzogchen practice working with visions of light; traditionally taught only by a qualified teacher.");
  });

  it("has complete English and Ukrainian content: a name, a short gloss and a note on variation for every term", () => {
    for (const lang of ["en", "uk"]) {
      const own = appData.languages[lang].terms;
      for (const key of KEYS) {
        expect(own?.names?.[key], `${lang} name ${key}`).toBeTruthy();
        expect(own?.short?.[key], `${lang} short ${key}`).toBeTruthy();
        expect(own?.varies?.[key], `${lang} varies ${key}`).toBeTruthy();
      }
    }
  });

  it("falls back to English per entry for languages without their own content", () => {
    expect(appData.languages.de.terms).toBeUndefined();
    expect(termsText("de").short.rigpa).toBe(en.terms?.short?.rigpa);
    expect(termsText("uk").short.rigpa).not.toBe(en.terms?.short?.rigpa);
  });

  it("has every label in every language, and says in each that meanings vary", () => {
    for (const lang of appData.langs) {
      for (const key of UI_KEYS) expect(appData.languages[lang].ui[key], `${lang}.${key}`).toBeTruthy();
    }
    for (const lang of appData.langs.filter((l) => l !== "en")) {
      expect(appData.languages[lang].ui.terms_intro, lang).not.toBe(en.ui.terms_intro);
      expect(appData.languages[lang].ui.terms_note, lang).not.toBe(en.ui.terms_note);
    }
    expect(en.ui.terms_note).toBe("Simplified: meanings vary between teachers and translations.");
  });

  it("no longer carries the old library strings or content", () => {
    for (const lang of appData.langs) {
      const pack = appData.languages[lang] as unknown as Record<string, unknown>;
      expect(pack.library, lang).toBeUndefined();
      for (const key of Object.keys(appData.languages[lang].ui)) expect(key, lang).not.toMatch(/^library_|^nav_library$/);
    }
  });

  it("has no psychology wording in the labels or the content", () => {
    for (const lang of appData.langs) {
      for (const key of UI_KEYS) expect(t(lang, key), `${lang}.${key}`).not.toMatch(PSYCH_WORDS);
    }
    expect(JSON.stringify([en.terms, appData.languages.uk.terms, data])).not.toMatch(PSYCH_WORDS);
  });
});
