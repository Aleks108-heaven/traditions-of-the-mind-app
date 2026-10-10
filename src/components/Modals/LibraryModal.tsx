import type { CSSProperties } from "react";
import { appData } from "../../lib/appData";
import { t } from "../../lib/i18n";
import { libraryText } from "../../lib/library";
import { Modal } from "../Modal";
import { Button } from "../ui/Button";
import { useAppState } from "../../state/AppStateContext";
import type { LibraryLink } from "../../types";

interface LibraryModalProps {
  open: boolean;
  onClose: () => void;
  onOpenPersona: (idx: number) => void;
}

const mutedStyle: CSSProperties = { color: "var(--ink-muted)", fontSize: "var(--fs-sm)" };
const linkStyle: CSSProperties = { color: "var(--amber-strong)", textDecoration: "underline", fontWeight: 600 };
const sectionStyle: CSSProperties = { marginTop: "var(--space-3)" };
const tightStyle: CSSProperties = { marginBottom: 0 };

// External links open in the system browser; the app itself makes no request for them.
function Links({ links }: { links: LibraryLink[] }) {
  return (
    <ul>
      {links.map((l) => (
        <li key={l.url}>
          <a href={l.url} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function LibraryModal({ open, onClose, onOpenPersona }: LibraryModalProps) {
  const { lang } = useAppState();
  const lib = appData.library;
  const text = libraryText(lang);
  const status = (s: string) => t(lang, `library_status_${s}`);

  return (
    <Modal open={open} onClose={onClose} title={t(lang, "library_title")} maxWidth={760}>
      <p>{t(lang, "library_intro")}</p>
      <p style={mutedStyle}>{t(lang, "library_links_note")}</p>

      {lib.teachers.map((teacher) => {
        const idx = appData.personaMeta.findIndex((p) => p.n === teacher.name);
        const years = idx > -1 ? appData.personaMeta[idx].y : "";
        return (
          <section key={teacher.key} style={sectionStyle}>
            <h3>
              {teacher.name}
              {years ? <span style={mutedStyle}> · {years}</span> : null}
            </h3>
            <p>
              <strong>{t(lang, "library_h_idea")}.</strong> {text.ideas[teacher.key]}{" "}
              <span style={mutedStyle}>[{status(teacher.ideaStatus)}]</span>
            </p>
            <p style={tightStyle}>
              <strong>{t(lang, "library_h_works")}</strong>
            </p>
            <ul>
              {teacher.works.map((w) => (
                <li key={w.id}>
                  <em>{w.title}</em>
                  {w.tibetan ? <span style={mutedStyle}> ({w.tibetan})</span> : null}
                  {w.edition ? <span style={mutedStyle}> — {w.edition}</span> : null}. {text.notes[w.id]}{" "}
                  <span style={mutedStyle}>[{status(w.status)}]</span>
                </li>
              ))}
            </ul>
            <p style={tightStyle}>
              <strong>{t(lang, "library_h_read")}</strong>
            </p>
            {teacher.links.length > 0 ? <Links links={teacher.links} /> : <p style={mutedStyle}>{t(lang, "library_no_links")}</p>}
            {idx > -1 && (
              <Button variant="ghost" inline onClick={() => onOpenPersona(idx)}>
                {t(lang, "library_open_chat")}
              </Button>
            )}
          </section>
        );
      })}

      <h3 style={sectionStyle}>{t(lang, "library_h_glossary")}</h3>
      <p style={mutedStyle}>{t(lang, "library_glossary_note")}</p>
      <ul>
        {lib.glossary.map((g) => (
          <li key={g.key}>
            <strong>{text.terms[g.key]}</strong> <span style={mutedStyle}>({g.tibetan})</span> — {text.glossary[g.key]}
          </li>
        ))}
      </ul>

      <h3 style={sectionStyle}>{t(lang, "library_general")}</h3>
      <Links links={lib.general} />
    </Modal>
  );
}
