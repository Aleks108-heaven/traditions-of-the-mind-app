import type { CSSProperties } from "react";
import { appData } from "../../lib/appData";
import { t } from "../../lib/i18n";
import { termsText } from "../../lib/terms";
import { Modal } from "../Modal";
import { useAppState } from "../../state/AppStateContext";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

const mutedStyle: CSSProperties = { color: "var(--ink-muted)", fontSize: "var(--fs-sm)" };
const sectionStyle: CSSProperties = { marginTop: "var(--space-3)" };
const tightStyle: CSSProperties = { marginBottom: 0 };

export function TermsModal({ open, onClose }: TermsModalProps) {
  const { lang } = useAppState();
  const data = appData.terms;
  const text = termsText(lang);

  return (
    <Modal open={open} onClose={onClose} title={t(lang, "terms_title")} maxWidth={760}>
      <p>{t(lang, "terms_intro")}</p>
      <p style={mutedStyle}>{t(lang, "terms_note")}</p>

      {data.terms.map((term) => (
        <section key={term.key} style={sectionStyle}>
          <h3>{text.names[term.key]}</h3>
          <p style={mutedStyle}>
            {t(lang, "terms_label_tibetan")}: {term.tibetan}
            {term.sanskrit ? ` · ${t(lang, "terms_label_sanskrit")}: ${term.sanskrit}` : ""}
          </p>
          <p>
            <strong>{t(lang, "terms_h_short")}.</strong> {text.short[term.key]}
          </p>
          <p style={tightStyle}>
            <strong>{t(lang, "terms_h_renderings")}</strong>
          </p>
          <ul>
            {term.renderings.map((r) => (
              <li key={r.text}>
                <em>{r.text}</em>
                {r.by ? <span style={mutedStyle}> — {r.by}</span> : null}
              </li>
            ))}
          </ul>
          <p>
            <strong>{t(lang, "terms_h_varies")}.</strong> {text.varies[term.key]}
          </p>
        </section>
      ))}

      <h3 style={sectionStyle}>{t(lang, "terms_sources")}</h3>
      <p style={mutedStyle}>{t(lang, "terms_sources_note")}</p>
      <ul>
        {data.sources.map((s) => (
          <li key={s.title}>
            {s.author}, <em>{s.title}</em> <span style={mutedStyle}>— {s.detail}</span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
