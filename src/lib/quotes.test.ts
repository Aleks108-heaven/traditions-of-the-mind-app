import { describe, expect, it } from "vitest";
import { appData } from "./appData";
import { fillUI, t } from "./i18n";

const data = appData.quotes;
const en = appData.languages.en;
const UI_KEYS = [
  "nav_quotes", "quotes_title", "quotes_intro", "quotes_h_quotes", "quotes_h_mantras", "quotes_translated_by", "quotes_missing",
  "quotes_licence", "quotes_english_note", "quotes_mantra_note", "quotes_h_syllables", "quotes_h_about", "quotes_note_terma", "quotes_note_ellipsis",
];
const PSYCH_WORDS = /psycholog|psychotherap|psicolog|psicoter|psychothér|psihol|psihoter|психолог|психотерап/i;
const chain = appData.chainA.map((c) => appData.personaMeta[c.personaIdx].n);

describe("quotations", () => {
  it("has six, in lineage order, all by teachers of the Dzogchen lineage", () => {
    const names = data.quotes.map((q) => q.teacher);
    expect(names).toEqual(["Padmasambhava", "Rongzom Chökyi Zangpo", "Longchenpa", "Jigme Lingpa", "Patrul Rinpoche", "Dudjom Rinpoche"]);
    for (const n of names) expect(chain).toContain(n);
  });

  it("gives Chögyal Namkhai Norbu no quotation, since no freely usable text was found", () => {
    expect(data.quotes.some((q) => q.teacher === "Chögyal Namkhai Norbu")).toBe(false);
  });

  it("credits every quotation: work, translator and source, with a Lotsawa House source page", () => {
    for (const q of data.quotes) {
      expect(q.text, q.teacher).toBeTruthy();
      expect(q.work, q.teacher).toBeTruthy();
      expect(q.translator, q.teacher).toBeTruthy();
      expect(q.source, q.teacher).toMatch(/^Lotsawa House/);
      expect(q.sourceUrl, q.teacher).toMatch(/^https:\/\/www\.lotsawahouse\.org\//);
    }
  });

  it("marks the terma and the abridged quotation, and nothing else needs a note", () => {
    const byTeacher = (n: string) => data.quotes.find((q) => q.teacher === n)!;
    expect(byTeacher("Padmasambhava").noteKey).toBe("terma");
    expect(byTeacher("Rongzom Chökyi Zangpo").noteKey).toBe("ellipsis");
    expect(byTeacher("Rongzom Chökyi Zangpo").text.startsWith("…")).toBe(true);
    for (const q of data.quotes) if (q.noteKey) expect(["terma", "ellipsis"], q.teacher).toContain(q.noteKey);
  });

  it("states the licence it relies on", () => {
    expect(data.licence.short).toBe("CC BY-NC 4.0");
    expect(data.licence.holder).toBe("Lotsawa House");
    for (const lang of appData.langs) expect(t(lang, "quotes_licence"), lang).toContain("creativecommons.org/licenses/by-nc/4.0/");
  });
});

describe("mantras", () => {
  it("has the Vajra Guru, Mañjuśrī and Avalokiteśvara mantras, each described by a source", () => {
    expect(data.mantras.map((m) => m.key)).toEqual(["vajra-guru", "manjushri", "avalokiteshvara"]);
    expect(data.mantras.map((m) => m.text)).toEqual(["oṃ āḥ hūṃ vajra guru padma siddhi hūṃ", "oṃ arapacana dhīḥ", "oṃ maṇi padme hūṃ"]);
    for (const m of data.mantras) {
      expect(m.about, m.key).toBeTruthy();
      expect(m.aboutSource, m.key).toMatch(/^Lotsawa House/);
    }
  });

  it("gives syllable explanations only where a translation of one was found (Vajra Guru)", () => {
    const vg = data.mantras.find((m) => m.key === "vajra-guru")!;
    expect(vg.meaning).toHaveLength(6);
    expect(vg.meaning[0]).toMatch(/^OṂ ĀḤ HŪṂ is the supreme essence/);
    expect(vg.translator).toBeTruthy();
    for (const m of data.mantras.filter((x) => x.key !== "vajra-guru")) expect(m.meaning, m.key).toEqual([]);
  });
});

describe("quotes labels", () => {
  it("has every label in every language", () => {
    for (const lang of appData.langs) {
      for (const key of UI_KEYS) expect(appData.languages[lang].ui[key], `${lang}.${key}`).toBeTruthy();
    }
    for (const lang of appData.langs.filter((l) => l !== "en")) {
      expect(appData.languages[lang].ui.quotes_intro, lang).not.toBe(en.ui.quotes_intro);
      expect(appData.languages[lang].ui.quotes_mantra_note, lang).not.toBe(en.ui.quotes_mantra_note);
    }
  });

  it("names the teacher without a quotation in every language", () => {
    for (const lang of appData.langs) {
      expect(appData.languages[lang].ui.quotes_missing, lang).toContain("{name}");
      expect(fillUI(t(lang, "quotes_missing"), { name: "Chögyal Namkhai Norbu" }), lang).toContain("Chögyal Namkhai Norbu");
    }
  });

  it("shows no web links and no psychology wording", () => {
    for (const lang of appData.langs) {
      for (const key of UI_KEYS) {
        expect(t(lang, key), `${lang}.${key}`).not.toMatch(/https?:\/\//);
        expect(t(lang, key), `${lang}.${key}`).not.toMatch(PSYCH_WORDS);
      }
    }
    expect(JSON.stringify([data.quotes.map((q) => q.text), data.mantras.map((m) => m.about)])).not.toMatch(PSYCH_WORDS);
  });
});
