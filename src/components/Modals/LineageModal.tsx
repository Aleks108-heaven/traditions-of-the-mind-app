import { appData } from "../../lib/appData";
import { t } from "../../lib/i18n";
import { personaText } from "../../lib/personas";
import { Modal } from "../Modal";
import { useAppState } from "../../state/AppStateContext";
import type { ChainItem, ListRow } from "../../types";

interface LineageModalProps {
  open: boolean;
  onClose: () => void;
  onOpenPersona: (idx: number) => void;
}

function ChainList({ chain, notes, names, onOpenPersona }: { chain: ChainItem[]; notes?: string[]; names?: string[]; onOpenPersona: (idx: number) => void }) {
  return (
    <div className="chain-line">
      {chain.map((c, i) => {
        const hasPersona = c.personaIdx > -1;
        const name = hasPersona ? appData.personaMeta[c.personaIdx].n : (names && names[i]) || "";
        const note = (notes && notes[i]) || "";
        return (
          <div className="chain-item" key={i}>
            <div className="cname">
              {hasPersona ? <button onClick={() => onOpenPersona(c.personaIdx)}>{name}</button> : name}
            </div>
            <div className="cnote">{note}</div>
          </div>
        );
      })}
    </div>
  );
}

function ListTable({ rows, overrides, lang, onOpenPersona }: { rows: ListRow[]; overrides?: Record<string, string>; lang: string; onOpenPersona: (idx: number) => void }) {
  return (
    <div className="master-scroll">
      <table className="master-table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">{t(lang, "th_name")}</th>
            <th scope="col">{t(lang, "th_known_for")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const idx = row.personaIdx;
            const name = idx > -1 ? appData.personaMeta[idx].n : "";
            const overrideTag = overrides && overrides[String(row.num)];
            const tag = idx > -1 ? (overrideTag != null ? overrideTag : personaText(lang, idx).tag) : "";
            return (
              <tr key={row.num}>
                <td className="num mono">{row.num}</td>
                <td>
                  <button className="linklike" onClick={() => onOpenPersona(idx)}>
                    {name}
                  </button>
                </td>
                <td>{tag}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function LineageModal({ open, onClose, onOpenPersona }: LineageModalProps) {
  const { lang } = useAppState();
  const l = appData.languages[lang] || appData.languages.en;
  const en = appData.languages.en;

  return (
    <Modal open={open} onClose={onClose} title={t(lang, "lineage_title")} maxWidth={760}>
      <p>{t(lang, "lineage_intro")}</p>
      <h3>{t(lang, "lineage_h_dzogchen")}</h3>
      <ChainList chain={appData.chainC} notes={l.chainCNotes || en.chainCNotes} onOpenPersona={onOpenPersona} />
      <h3>{t(lang, "lineage_h_formative")}</h3>
      <ChainList chain={appData.chainA} notes={l.chainANotes || en.chainANotes} names={l.chainANames || en.chainANames} onOpenPersona={onOpenPersona} />
      <h3>{t(lang, "lineage_h_compare")}</h3>
      <ChainList chain={appData.chainB} notes={l.chainBNotes || en.chainBNotes} names={l.chainBNames || en.chainBNames} onOpenPersona={onOpenPersona} />
    </Modal>
  );
}

export { ListTable };
