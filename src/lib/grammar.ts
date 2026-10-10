// Scripted replies are assembled from templates and phrases, so the joins need a small grammar pass:
// a capital letter at the start of the sentence, the preposition + article contractions that a plain
// substitution leaves apart in Portuguese and Catalan ("em o que" -> "no que"), and a closing phrase
// that the template and the substituted topic both supply ("ara mateix ara mateix").

const keepCase = (from: string, to: string) =>
  from[0] === from[0].toLocaleUpperCase() ? to[0].toLocaleUpperCase() + to.slice(1) : to;

const word = (phrase: string) => new RegExp(`(?<![\\p{L}'])${phrase}(?![\\p{L}'])`, "giu");

const contractions: Record<string, Array<[RegExp, string]>> = {
  pt: [
    [word("de o que"), "do que"],
    [word("em o que"), "no que"],
    [word("a o que"), "ao que"],
    [word("por o que"), "pelo que"],
  ],
  ca: [
    [word("de el que"), "del que"],
    [word("a el que"), "al que"],
  ],
};

const repeatedEnding: Record<string, RegExp> = {
  ca: word("(ara mateix) ara mateix"),
};

export function capitalizeFirst(text: string): string {
  return text.replace(/^([\p{P}\s]*)(\p{Ll})/u, (_, lead: string, ch: string) => lead + ch.toLocaleUpperCase());
}

export function tidyGrammar(lang: string, text: string): string {
  let out = text;
  for (const [re, to] of contractions[lang] ?? []) out = out.replace(re, (m) => keepCase(m, to));
  const repeat = repeatedEnding[lang];
  if (repeat) out = out.replace(repeat, "$1");
  return capitalizeFirst(out);
}
