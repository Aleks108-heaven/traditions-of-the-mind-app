import type { CSSProperties } from "react";
import { appData } from "../../lib/appData";
import { fillUI, t } from "../../lib/i18n";
import { Modal } from "../Modal";
import { useAppState } from "../../state/AppStateContext";

interface QuotesModalProps {
  open: boolean;
  onClose: () => void;
}

const mutedStyle: CSSProperties = { color: "var(--ink-muted)", fontSize: "var(--fs-sm)" };
const sectionStyle: CSSProperties = { marginTop: "var(--space-3)" };
const quoteStyle: CSSProperties = {
  whiteSpace: "pre-line",
  margin: "var(--space-1) 0",
  paddingLeft: "var(--space-2)",
  borderLeft: "3px solid var(--amber-subtle-border)",
  fontFamily: "var(--font-serif)",
};
const mantraStyle: CSSProperties = { fontFamily: "var(--font-serif)", fontSize: "var(--fs-lg)", margin: "var(--space-1) 0" };

export function QuotesModal({ open, onClose }: QuotesModalProps) {
  const { lang } = useAppState();
  const { quotes, mantras, licence } = appData.quotes;
  const years = (name: string) => appData.personaMeta.find((p) => p.n === name)?.y;
  const quoted = new Set(quotes.map((q) => q.teacher));
  const withoutQuote = appData.chainA.map((c) => appData.personaMeta[c.personaIdx].n).filter((n) => !quoted.has(n));

  return (
    <Modal open={open} onClose={onClose} title={t(lang, "quotes_title")} maxWidth={760}>
      <p>{t(lang, "quotes_intro")}</p>
      <p style={mutedStyle}>{t(lang, "quotes_english_note")}</p>

      <h3 style={sectionStyle}>{t(lang, "quotes_h_quotes")}</h3>
      {quotes.map((q) => (
        <section key={q.teacher} style={sectionStyle}>
          <p style={{ marginBottom: 0 }}>
            <strong>{q.teacher}</strong>
            {years(q.teacher) ? <span style={mutedStyle}> · {years(q.teacher)}</span> : null}
          </p>
          <blockquote style={quoteStyle}>{q.text}</blockquote>
          <p style={mutedStyle}>
            <em>{q.work}</em> — {t(lang, "quotes_translated_by")} {q.translator} — {q.source} · {licence.short}
            {q.noteKey ? ` — ${t(lang, `quotes_note_${q.noteKey}`)}` : ""}
          </p>
        </section>
      ))}
      {withoutQuote.map((name) => (
        <p key={name} style={mutedStyle}>
          {fillUI(t(lang, "quotes_missing"), { name })}
        </p>
      ))}

      <h3 style={sectionStyle}>{t(lang, "quotes_h_mantras")}</h3>
      <p style={mutedStyle}>{t(lang, "quotes_mantra_note")}</p>
      {mantras.map((m) => (
        <section key={m.key} style={sectionStyle}>
          <p style={mantraStyle}>{m.text}</p>
          <p style={mutedStyle}>
            {t(lang, "quotes_h_about")}: “{m.about}” — {m.aboutSource}
          </p>
          {m.meaning.length > 0 ? (
            <>
              <p style={{ marginBottom: 0 }}>
                <strong>{t(lang, "quotes_h_syllables")}</strong>{" "}
                <span style={mutedStyle}>
                  ({t(lang, "quotes_translated_by")} {m.translator} — {m.source} · {licence.short})
                </span>
              </p>
              <ul>
                {m.meaning.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ))}

      <p style={{ ...mutedStyle, ...sectionStyle }}>{t(lang, "quotes_licence")}</p>
    </Modal>
  );
}
